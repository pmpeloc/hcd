# Spec del módulo `tx` (`hcd_api/src/tx/`)

> Owner: Franco. Implementación: día 4 (mar 6/10). Decisiones base: [decisiones.md](decisiones.md) (fee payer propio, verificación byte a byte, keypairs separados) y [arquitectura.md](arquitectura.md#quién-paga-la-red). Contrato on-chain: `hcd_api/idl/hcd.json`.

## 1. Responsabilidad y endpoints

El backend **arma** la transacción, el usuario la **firma** con su wallet embebida Privy en el navegador, y el backend la **verifica byte a byte** antes de co-firmar como fee payer y enviarla. Nunca se firma ni envía una transacción armada por el cliente. Flujo en dos fases:

### `POST /tx/build`

Body: `{ instruction, args }` — `args` es una unión discriminada por instrucción, validada con `ZodValidationPipe`. El backend:

1. Resuelve las cuentas (PDAs derivadas de las seeds del IDL, lecturas on-chain si hacen falta, p.ej. `patient_profile.next_record_id` para `issue_record`).
2. Obtiene un blockhash reciente de devnet.
3. Arma la transacción con `payer` = fee payer del backend como pagador del fee.
4. Guarda los bytes exactos del `message` serializado bajo un `tx_id` (tabla `pending_tx` o caché con TTL de ~2 min, la vida útil del blockhash).
5. Devuelve `{ tx_id, tx_base64, message_hash, expires_in_slots }`. La tx viaja sin la firma del fee payer.

### `POST /tx/submit`

Body: `{ tx_id, signed_tx_base64 }`. El backend:

1. Deserializa la transacción firmada.
2. Compara **byte a byte** el `message` con el guardado para ese `tx_id` (ver §3). Si difiere → 403.
3. Verifica que la firma del usuario sea válida para la pubkey esperada en su slot.
4. Agrega la firma del fee payer y, solo en `issue_record`, la de `key_service`.
5. Envía a devnet (`SOLANA_RPC_URL`, con fallback), confirma y devuelve `{ signature, explorer_url }`.
6. El `tx_id` es de un solo uso: se consume o se marca como usado.

`GET /tx/:signature/status` (opcional): re-consulta la confirmación para que la app haga polling.

## 2. Instrucciones y firmantes (verificado contra `idl/hcd.json`)

| Instrucción | Firmantes según IDL | Quién firma en el flujo | Dónde se usa |
|---|---|---|---|
| `register_patient` | `payer` + `authority` | usuario + fee payer | alta del paciente |
| `register_provider` | `payer` + `authority` | usuario + fee payer | alta del médico/clínica |
| `issue_record` | `payer` + `issuer` + `key_service` | médico + fee payer + `key_service` | carga de estudio (doble firma: cierra el hueco de carga) |
| `grant_access` | `payer` + `patient` | paciente + fee payer | paciente otorga acceso |
| `dispute_record` | `patient` (sin `payer`) | paciente + fee payer* | "no es mío" |
| `revoke_access` | `patient` (sin `payer`) | paciente + fee payer* | paciente revoca acceso |
| `void_record` | `issuer` (sin `payer`) | médico + fee payer* | emisor anula un Record disputado |

\* Estas tres instrucciones **no tienen cuenta `payer` en el IDL**: no crean cuentas ni pagan rent. Igual necesitan la firma del fee payer porque este paga el **fee de la transacción** (rol a nivel de mensaje, no de instrucción).

**No pasan por este flujo:** `log_access` (firma solo `key_service`; lo arma y envía `src/keys/` internamente en cada entrega de llave) e `initialize_config`/`set_provider_verified` (firma el admin; scripts operativos, no endpoints públicos).

## 3. Verificación byte a byte

Una transacción de Solana es `signatures[] + message`. El usuario firma sobre los bytes del `message`; lo único que puede cambiar legítimamente entre `build` y `submit` es **el slot de firma del usuario** (de vacío a una firma válida). Todo lo demás — header, tabla de account keys (incluido el fee payer en la posición 0), blockhash e instrucciones compiladas — tiene que ser **idéntico** a lo que armó el backend.

Por eso se comparan los bytes del `message` recibido contra los bytes guardados (o su `message_hash`), no "que se parezca". Una comparación semántica (decodificar y comparar campos) deja huecos: una re-codificación puede esconder una instrucción extra, una cuenta distinta con el mismo rol o un `programId` cambiado, y el backend estaría co-firmando un gasto arbitrario con su hot wallet. Si los bytes difieren en **un solo bit**: rechazo total (403) + log de seguridad con `tx_id`, usuario e instrucción declarada — nunca los bytes de la tx.

## 4. Límites del fee payer

- **Rate limit** con `@nestjs/throttler`, dos alcances: por usuario ~10 tx/min y ~50 tx/día; por organización ~300 tx/hora. Rechazo: 429.
- **Presupuesto diario** en lamports (`TX_DAILY_BUDGET_LAMPORTS`, sugerido ~200_000_000 ≈ 0.2 SOL en devnet). Contador en Postgres: tabla `fee_payer_spend (day, lamports)` que se incrementa con el fee + rent real de cada tx confirmada (estimación conservadora antes de enviar, corrección después de confirmar). Presupuesto agotado → **429** con mensaje "presupuesto diario de red agotado, reintenta mañana".
- **Alerta de saldo**: chequeo en cada envío (y un cron por si no hay tráfico); si el balance del fee payer baja de ~0.1 SOL (100_000_000 lamports) → alerta (log `warn` + webhook al canal del equipo). Hot wallet con poco saldo siempre: la recarga es manual.
- El fee payer y `key_service` son keypairs **distintos**: robar el primero cuesta SOL; robar el segundo permitiría falsificar auditoría y cargas.

## 5. Variables de entorno

| Var | Uso |
|---|---|
| `FEE_PAYER_SECRET` | keypair del fee payer, base58 (el `.env.example` también admite array JSON de bytes) |
| `KEY_SERVICE_SECRET` | keypair de `key_service`, base58; **≠** `FEE_PAYER_SECRET` (validar al boot, fallar si son iguales) |
| `SOLANA_RPC_URL` / `SOLANA_RPC_URL_FALLBACK` | Helius devnet + RPC público de respaldo |
| `PROGRAM_ID` | `8FNP6rs3DQ4h6bqWNeD9meHt5mUNEhcaXbrbJxSJniyd` |
| `TX_DAILY_BUDGET_LAMPORTS` | tope diario del fee payer |

**Regla:** nunca loguear la transacción (armada o firmada) ni las llaves. Los logs llevan `tx_id`, signature pública y pubkeys.

## 6. Manejo de errores

| Caso | Respuesta |
|---|---|
| Blockhash vencido al hacer submit | 409 "transacción vencida"; el cliente vuelve a llamar `/tx/build`. No se reintenta la misma tx. |
| Falta la firma del usuario o es inválida | 400 |
| `message` distinto del armado | 403 + log de seguridad |
| Presupuesto diario agotado o throttler | 429 |
| RPC caído / timeout de confirmación | 503 (se intenta el fallback una vez) |
| Error del programa (6000–6016 del IDL: `Unauthorized`, `ProviderNotVerified`, `RecordNotActive`, `GrantExpired`, `NotKeyService`, etc.) | 422 con `code` y `msg` mapeados del IDL |

## 7. Dependencia de Codama

El cliente TS se genera con **Codama** (`@codama/renderers-js`, stack #11) desde `hcd_api/idl/hcd.json`. Salida: `src/tx/generated/` en la API (mismo artefacto que Matías copia a `hcd_app/lib/hcd-client/`). Lo generan Franco + Matías cuando Misael publique el IDL v0 (día 5–6). El módulo consume los builders de instrucciones y decoders de cuentas generados sobre `@solana/kit`; ninguna cuenta ni discriminador se escribe a mano. Script sugerido: `npm run idl:gen` para regenerar al cambiar el IDL.

## 8. Tests propuestos (Jest + devnet/localnet)

**Positivos**
- Flujo completo `build → firma con keypair de prueba → submit` para `register_patient`, `issue_record` (verifica doble firma médico + `key_service`), `grant_access`, `dispute_record`, `revoke_access`, `void_record`.
- `tx_id` de un solo uso; signature devuelta confirmada en devnet.
- Presupuesto: el contador registra fee + rent y se resetea por día.

**Negativos**
- Tx adulterada: instrucción extra, cuenta cambiada, otro `programId`, otro blockhash, otro fee payer → 403.
- Firma de otra wallet, slot de firma vacío o firma corrupta → 400/403.
- `tx_id` inexistente, reutilizado o con blockhash vencido.
- Presupuesto excedido → 429; throttler por usuario y por organización → 429.
- `issue_record` sin QR de paciente válido: el backend no agrega la firma de `key_service`.
- `log_access` e instrucciones de admin rechazadas en `/tx/build` (no están en la unión discriminada).
