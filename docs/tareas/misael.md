# Tareas · Misael (programa Anchor)

**Rol:** programa de Solana en Rust + Anchor, sus tests (positivos y negativos) y el IDL del que todos generan su cliente.
**Respaldo:** Franco (revisión cruzada; otra persona siempre revisa el programa).
**Repo:** `hcd_api` — únicamente `programs/hcd/`, `tests/` e `idl/`.

## Archivos y módulos bajo tu responsabilidad

- `hcd_api/programs/hcd/src/lib.rs` — instrucciones del programa.
- `hcd_api/programs/hcd/src/state/` — cuentas: `Config`, `Provider`, `PatientProfile`, `Record`, `AccessGrant`.
- `hcd_api/programs/hcd/src/instructions/` — una por instrucción.
- `hcd_api/programs/hcd/src/errors.rs` y `events.rs`.
- `hcd_api/tests/` — tests de Anchor en TypeScript.
- `hcd_api/idl/hcd.json` — IDL publicado; es el contrato de backend y app.
- `Anchor.toml` y configuración del programa.

**No tocar:** `src/` de NestJS ni `supabase/` (Matías y Franco), nada de `hcd_app` (Maximiliano), docs de pitch/demo (Rodrigo).

> En Windows, Anchor requiere **WSL**. Si el toolchain local falta, arrancar en Solana Playground.

## Plan día por día

### Día 1 · sáb 3/10 (setup + esquema)
- Pasos 1 y 2 (Luma + Arena).
- Empezar el esquema de cuentas: semillas y campos de las 5 PDAs (Config, Provider, PatientProfile, Record, AccessGrant), incluyendo `rent_payer` y `supersedes` en Record.
- Dejar andando el toolchain: WSL + Rust + Solana CLI + Anchor CLI 1.2 (avm).

### Día 2 · dom 4/10 (esqueleto) — puerta G1
- Kickoff técnico: congelar cuentas y contratos con el equipo (Franco coordina).
- `initialize_config` (admin, key_service, duración máxima de permisos), `register_provider` / `set_provider_verified` (solo admin verifica) y `register_patient` (con `next_record_id`), con sus primeros tests.

### Día 3 · lun 5/10 (ciclo del estudio)
- `issue_record` (solo médico verificado; Record nace **Active**; guarda `content_hash`, `storage_ref`, `issuer`, `rent_payer`).
- `dispute_record` (paciente: Active → Disputed) y `void_record` (emisor: Disputed → Voided; la reemisión es un Record nuevo con `supersedes`).
- Tests positivos y negativos de cada una.
- **Publicar el IDL v0 esta noche (puerta G2):** sin él se atrasan backend y app.

### Día 4 · mar 6/10 (permisos y auditoría)
- `grant_access` (paciente; exige Record Active, vencimiento futuro contra `Clock` y menor al máximo de Config).
- `revoke_access` (paciente; pasa a Revoked sin cerrar la cuenta, para conservar auditoría).
- `log_access` (solo `key_service`; exige grant Active y vigente; incrementa `access_count`).
- Eventos: RecordIssued, RecordDisputed, RecordVoided, AccessGranted, AccessRevoked, AccessLogged.
- Si el equipo lo decidió en el kickoff: exigir la firma de `key_service` en `issue_record` para cerrar el hueco de carga.

### Día 5 · mié 7/10 (deploy en devnet) — puerta G3
- Deploy del programa en devnet; program ID anotado en el README de `hcd_api`.
- Tests negativos completos contra devnet: médico sin permiso, permiso vencido, permiso revocado, estudio en disputa, prestador sin verificar, seeds/bump incorrectos.

### Día 6 · jue 8/10 (admin + soporte)
- Script de admin para verificar prestadores (`set_provider_verified`) que use la wallet de autoridad.
- Soporte de integración a Matías (indexer consume los eventos) y a Franco (`log_access`, fee payer).
- Revisión cruzada: Franco revisa el programa completo; corregir lo que salte.

### Día 7 · vie 9/10 (integración) — puerta G4
- Tests de integración contra devnet del recorrido completo: emitir → disputar/anular → grant → log → revoke.
- README del programa: cómo compilar, desplegar, program id y decisiones de seguridad.

### Día 8 · sáb 10/10 (endurecer)
- Corregir errores encontrados en el recorrido.
- Casos negativos extra y documentación (comentarios en las restricciones de Anchor: validación de signers, seeds, bump; nunca confiar en un timestamp del cliente).

### Día 9 · dom 11/10 (congelar) — puerta G5
- Congelar el programa: solo se arreglan errores críticos.
- Verificar que `idl/hcd.json` publicado coincide con lo desplegado.

### Día 10 · lun 12/10 (entrega) — puerta G6
- Solo errores. Entregar al equipo el program id y enlaces del explorador a transacciones de ejemplo (issue, grant, log_access) para el formulario final.

## Entregables

1. Programa Anchor con las 9 instrucciones y las 5 cuentas del diseño.
2. Suite de tests positivos y **negativos** pasando.
3. Deploy en devnet con program id documentado.
4. `idl/hcd.json` v0 publicado el lunes 5 a la noche y actualizado con cada cambio (avisando al grupo).
5. Script de admin para verificar prestadores.
6. README del programa con build, deploy y decisiones.

## Criterios de aceptación (Definition of Done)

- Las instrucciones y firmantes coinciden con el plan: solo el admin verifica, solo el médico verificado emite, solo el paciente disputa/otorga/revoca, solo `key_service` registra accesos.
- Nada médico ni identificable en cuentas o eventos: sin nombres, diagnósticos, DNI ni rutas legibles (solo hashes y pubkeys).
- Los vencimientos se comparan contra `Clock`, nunca contra un valor del cliente.
- `access_count` se incrementa solo vía `log_access` con grant vigente (es la fuente de verdad de la auditoría).
- El rent de cuentas cerradas vuelve al sponsor (`rent_payer` + `close = rent_payer`).
- Tests negativos cubren: sin permiso, permiso vencido, permiso revocado, estudio en disputa, prestador sin verificar.
- Todo mergeado a `main` por PR con revisión de alguien distinto (regla del equipo).

## Dependencias

- El kickoff del domingo congela cuentas y campos; después de eso, cambiar el IDL exige avisar al grupo y regenerar clientes.
- Tu IDL habilita a Matías (cliente del backend e indexer), a Franco (`tx`, `keys`) y a Maximiliano (`hcd-client` de la app): sos el cuello de botella del lunes.
- El fee payer de Franco es quien paga el rent en las transacciones de los usuarios.
