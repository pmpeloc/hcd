# Servicio de llaves (`hcd_api/src/keys/`)

> Spec de trabajo. Contrato on-chain: `hcd_api/idl/hcd.json` + `programs/hcd/src/instructions/log_access.rs`.
> Regla de fondo: **denegar por defecto**. La DEK nunca se guarda ni se loguea en claro; solo vive en memoria entre desenvolverla y responderla.

## 1. Responsabilidades

- `POST /keys/release` — único endpoint del módulo. Decide quién puede recibir la DEK leyendo Postgres y la cadena; desenvuelve y responde solo si corresponde.
- `KeyService.wrapDek` / `unwrapDek` — helpers internos exportados como provider de Nest. El módulo `records` llama a `wrapDek(dek, organizationId)` al registrar el estudio y guarda el resultado en `records.wrapped_dek`; `release` llama a `unwrapDek`.
- **`GET /audit/:recordId` recomiendo que quede FUERA** (en `src/indexer` o `src/access`): el audit trail combina `audit_events`, `key_releases` y `access_count` on-chain, que es dominio del indexer. Meterlo acá agranda la superficie del módulo más delicado. Si el MVP apura, puede colgar de este controller como atajo temporal.
- Rate limit del endpoint: hereda la política del fee payer del módulo `tx` (cada release de médico gasta una tx).

## 2. Flujo de `POST /keys/release`

Request: `{ record_id: uuid }` (Zod). Auth: `Authorization: Bearer <supabase jwt>`.
Response 200: `{ dek: base64(32 B), download_url, expires_in: 60, content_hash: hex }`.

1. Guard de auth: `auth.getClaims(token)` → `sub`; cargo `app_user` (role, status). Sin token válido → 401; usuario `suspended` → 403.
2. Leo `records` **con la service role** (no con el cliente por request): un médico de otra organización con grant válido no pasaría la RLS y la autorización la decide la cadena, no la membresía. Columnas: `organization_id`, `patient_user_id`, `issuer_doctor_id`, `record_pda`, `storage_path`, `wrapped_dek`. No existe → 404.
3. Leo on-chain la cuenta `Record` (`record_pda`). `status != Active` (Disputed/Voided) → 403 para todos. De la cuenta tomo `patient` e `issuer`: son la fuente de verdad, la base local puede estar desfasada.
4. Mapeo requester → wallet: médico → `doctors.wallet_pubkey`; paciente → `app_user.wallet_pubkey` (**campo que falta**, ver §8).
5. Matriz de decisión:

| Quién pide | Condición | Resultado |
|---|---|---|
| Paciente | `wallet == record.patient` | OK · role `patient` · **sin** `log_access` \* |
| Emisor | `wallet == record.issuer` | OK · role `issuer` · **sin** `log_access` \* |
| Otro médico | PDA `["grant", record_pda, wallet]` existe, `status == Active`, `expires_at > now` (reloj del servidor) y PDA `["provider", wallet]` con `verified == true` | OK · role `doctor` · **con** `log_access` |
| Cualquier otro caso | — | 403 |

\* **Hallazgo del contrato:** `log_access` exige la cuenta `grant` (seeds `["grant", grant.record, grant.doctor]`) con `status Active`; no existe grant para el paciente ni para el emisor, así que esas entregas **no pueden registrarse on-chain**: solo fila en `key_releases`. Discusión abierta en §8.

6. Si role `doctor`: armo la tx `log_access` (cuentas `key_service` firmante, `config`, `grant` mut, `record`, `doctor_provider`) y la envío firmada por `KEY_SERVICE` con `FEE_PAYER` como pagador — keypairs distintos, los dos firman la misma tx. El programa re-valida todo (grant activo, Clock < expires_at, record no Disputed/Voided, provider verificado); yo lo leí antes para no gastar una tx que revienta.
   - **Rechazo del programa** (Anchor 6001/6003/6004/6007/6008) → **403, no se entrega nada**: entre mi lectura y la tx el estado cambió (venció, se revocó, se disputó). El rechazo del programa ES la autorización definitiva; no hay entrega "a medio permiso".
   - **Falla de infraestructura** (RPC caído, timeout, sin confirmación tras 2 reintentos) → **entrego igual** y la fila queda `log_access_status = 'pending'` para reintento en background. Justificación: el permiso ya se verificó leyendo la cuenta; un RPC caído no debe dejar al paciente sin su propia historia clínica, y el médico con grant vigente podía haber pedido la DEK un minuto antes igual.
7. `KEK_org = HKDF(master_key, salt=org_id, info="salua-org-kek")` → `unwrapDek`. Si el open de GCM falla (blob corrupto o manipulado) → 500, nunca 200.
8. Insert en `key_releases` (§3) con `tx_signature` y `log_access_status` según el paso 6.
9. URL firmada de **60 s** de Supabase Storage sobre `storage_path` (service role, bucket privado).
10. Respondo DEK + URL. Limpio el buffer de la DEK tras responder. La DEK jamás va a logs ni a `key_releases` (solo su fingerprint).

## 3. Tabla `key_releases` (propuesta para Matías)

Ya existe en la migración init: `id`, `record_id`, `released_to`, `tx_signature`, `created_at`. Propongo una migración que agregue:

| Columna | Tipo | Nota |
|---|---|---|
| `role` | `text not null` | `patient` \| `issuer` \| `doctor` — por qué vía se autorizó |
| `grant_pda` | `text null` | PDA del `AccessGrant` usado (solo role `doctor`) |
| `dek_fingerprint` | `text not null` | `hex(SHA-256(DEK))` — prueba QUÉ llave se entregó sin guardarla |
| `log_access_status` | `text not null default 'skipped'` | `confirmed` \| `pending` \| `failed` \| `skipped` (skipped = patient/issuer) |
| `log_access_attempts` | `int not null default 0` | reintentos del worker sobre las `pending` |

Escritura solo con el rol backend; la RLS actual (el paciente ve las de sus records, `released_to` las suyas) alcanza.

## 4. Cripto exacta (`node:crypto`, sin libs externas)

- **KEK por organización:** `KEK_org = HKDF-SHA256(ikm = MASTER_KEY (32 B), salt = bytes(organization_id) (uuid, 16 B), info = "salua-org-kek", length = 32)`. Rotar la llave de una clínica no toca las demás.
- **Wrap/unwrap:** AES-256-GCM sobre la DEK (32 B): `iv` 12 B aleatorio por cada wrap, `auth tag` 16 B, sin AAD.
- **Blob en `records.wrapped_dek` (bytea):** `iv(12) || ciphertext(32) || tag(16)` = 60 B crudos. Base64 solo en el borde (JSON).
- **Fingerprint de auditoría:** `SHA-256(DEK)` en hex. Nunca la DEK en DB, logs ni ninguna respuesta que no sea el release autorizado.
- `MASTER_KEY`: 32 B en base64 o hex por env var; validar decodificación y largo al boot — si no, la app no levanta. (KMS en producción.)

## 5. Errores

| Caso | HTTP |
|---|---|
| Body inválido (Zod) | 400 |
| Sin token / token inválido | 401 |
| Record inexistente (fila o PDA sin cuenta) | 404 |
| Usuario suspendido · Record Disputed/Voided · requester sin derecho · grant ausente/Revoked/`expires_at` vencido · provider no verificado · `log_access` rechazado por el programa | 403 |
| Unwrap falla · storage o RPC caído sin lectura posible · config/env inválida · excepción inesperada | 500 |

Regla: un error inesperado siempre sale 403 o 500, **nunca 200 sin entrega autorizada y verificada**.

## 6. Env vars

`MASTER_KEY` · `KEY_SERVICE_SECRET` · `FEE_PAYER_SECRET` · `SOLANA_RPC_URL` (+ `SOLANA_RPC_URL_FALLBACK`) · `PROGRAM_ID` · `SUPABASE_URL` · `SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE`.

Guardarraíl al boot: `pubkey(KEY_SERVICE_SECRET) != pubkey(FEE_PAYER_SECRET)` y debe igualar `Config.key_service` on-chain; si no, la app no levanta. Robar el fee payer cuesta SOL; robar `key_service` permitiría falsificar la auditoría.

## 7. Tests

Positivos:
- Paciente pide su record → 200, fila `role=patient`, `log_access_status=skipped`, sin tx.
- Emisor → 200, `role=issuer`. Otro médico con grant Active vigente → 200, `access_count` sube on-chain, fila `confirmed` con `tx_signature`.
- Grant revocado y re-otorgado → 200. RPC caído en `log_access` → 200 con `pending` y el reintento confirma después.
- Roundtrip: `wrapDek` → `unwrapDek` → descifra el archivo y matchea `content_hash`. `dek_fingerprint` == `sha256(dek)` y la DEK no aparece en ninguna fila ni log.

Negativos:
- Sin token / token inválido → 401. Suspendido → 403. Record inexistente → 404. Disputed/Voided → 403 **incluso para el paciente**.
- Médico sin grant, grant Revoked, `expires_at` pasado o `== now` → 403. Provider `verified=false` → 403.
- `log_access` rechazado por el programa → 403 y nada se entregó. Blob truncado o tag inválido → 500, cero entrega.
- `KEY_SERVICE_SECRET == FEE_PAYER_SECRET` o `MASTER_KEY` mal formado → el boot falla. Dos releases concurrentes → dos filas, mismo fingerprint.

## 8. Puntos abiertos (para discutir)

1. ~~`log_access` no puede registrar entregas a paciente/emisor~~ — **resuelto** ([decisión 2026-10-05](decisiones.md)): auditoría on-chain solo de accesos de terceros; paciente y emisor quedan solo en `key_releases`.
2. `app_user` no tiene `wallet_pubkey` del paciente y se necesita para comparar contra `Record.patient`. Propuesta: columna `wallet_pubkey text` en `app_user` (Mati).
3. Dueño de `GET /audit/:recordId` (§1) — propuesta: indexer de Mati.
4. Reintentos de las `pending`: worker con backoff o reintento lazy en el próximo release.
