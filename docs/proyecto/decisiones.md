# Decisiones del equipo

Una entrada por decisión, la más nueva arriba. Formato: fecha · decisión · quién la propuso · por qué.

## 2026-10-06 · Programa endurecido tras la revisión de seguridad (IDL v1) · Misael
Una revisión independiente del programa no encontró nada crítico ni alto. Cambios:
- **`storage_ref` es el `id` (UUID) de la fila de `records`.** El programa solo acepta un UUID en minúsculas, así que no se puede grabar on-chain una ruta legible, un nombre o un DNI. **Impacto (Franco/Mati):** el builder de `issue_record` tiene que mandar `records.id`, no `storage_path`; conviene que el esquema Zod pase de `z.string().max(64)` a `z.string().uuid()`.
- **`update_config` (solo el admin)** reemplaza admin, `key_service` y duración máxima. Si se filtra `key_service` se rota en una transacción (`scripts/update-config.mts`), en vez de tener que actualizar el programa. `key_service` nunca puede ser el admin.
- **`issue_record`** rechaza que el médico se emita a sí mismo y un `content_hash` en cero.
- **IDL v1:** suma `update_config`, el evento `ConfigUpdated` y 3 errores nuevos. No cambia ninguna instrucción existente, cuenta ni código de error: los clientes actuales siguen andando sin regenerarse.
- **Riesgos aceptados para el MVP** (detalle en `hcd_api/programs/hcd/README.md`): un estudio anulado puede reemplazarse más de una vez (la app muestra el más reciente); verificar de nuevo a un médico suspendido reactiva sus permisos vigentes (el admin los revisa antes); la relación paciente-médico es visible on-chain sin datos médicos.

## 2026-10-06 · Cada `log_access` lleva un Memo con el id de `key_releases` · Misael (aceptado por Franco)
- Cuando se implemente `src/keys`, cada transacción de `log_access` incluye una instrucción **Memo con `key_releases.id`**.
- Por qué: dos `log_access` seguidos del mismo permiso pueden ser transacciones idénticas; si comparten blockhash, la red descarta la segunda y `access_count` subcuenta aunque las dos llamadas devuelvan éxito (visto en devnet el 2026-10-05). El Memo hace única cada transacción y además enlaza el registro on-chain con la fila de la base.
- No cambia el programa ni el IDL. Detalle en [ideas de Misael](../miembros/misael/ideas.md).

## 2026-10-05 · Config del programa en devnet · Franco y Misael
- **`key_service`:** `DmiHb7zTyWhaLtRCXhCTNkM8Ga1G2S36XzCUx1GUH4yG`, la del `.env` definitivo del backend. Es distinta del fee payer.
- **Duración máxima de un permiso:** 7 días (604800 s).
- **Admin:** la upgrade authority del programa (`6AdUWfFLkpBCHNSsnCLKbEPB8khvGcnFHZczx6zjTdiQ`, wallet de Misael).
- Config PDA: `7tChRt4bpCXD8PAsREFpW82i4qrxZwXnfqYYmv2p1EZA`. **No se puede cambiar** sin agregar una instrucción nueva al programa. Si se rota `key_service`, hay que sumar esa instrucción primero.

## 2026-10-05 · `main` y `staging` protegidas: todo entra por PR con aprobación · Misael
- En los 4 repos (`hcd`, `hcd_api`, `hcd_app`, `hcd_landing`) hay un ruleset de GitHub ("Require approval on main and staging") sobre `main` y `staging`: no se puede hacer push directo, force push ni borrar la rama.
- Todo entra por PR con **1 aprobación de otro integrante**. Nadie está exento, tampoco el dueño de los repos.
- Impacto: los commits de docs en `hcd` (bitácora y estado) también van en una rama y con su propio PR. Detalle en `AGENTS.md`, sección 6.

## 2026-10-05 · Auditoría on-chain solo de accesos de terceros · Franco y Misael
- **`log_access` registra solo los accesos de médicos con permiso.** No se agrega `log_self_access`: la auditoría on-chain existe para mostrarle al paciente quién **más** accedió a sus datos.
- Las lecturas del **propio paciente** no se registran on-chain: no aportan a la auditoría y costarían una transacción por lectura.
- Las relecturas del **emisor** quedan solo en `key_releases` (Supabase), que el servicio de llaves escribe en cada entrega.
- Si más adelante queremos al emisor on-chain: `log_issuer_access` (firma solo `key_service` y solo emite un evento). Es un cambio aditivo, no rompe el IDL.

## 2026-10-05 · Programa: permisos solo a médicos verificados y suspensión inmediata · Misael
- **`grant_access` solo acepta como destinatario a un médico verificado** (no clínicas ni wallets sueltas).
- **`log_access` vuelve a chequear que el médico siga verificado y que el estudio no esté disputado ni anulado.** Suspender a un prestador con `set_provider_verified(false)` corta el acceso al instante, sin tener que revocar permiso por permiso. Impacto para el servicio de llaves (Franco): si `log_access` falla, no entregar la DEK.
- **Cuentas que pasa el backend:** `issue_record` (`payer`, `issuer`, `keyService`, opcional `supersededRecord`), `grant_access` (`payer`, `patient`, `record`, `doctorProvider`, `grant`), `log_access` (`keyService`, `grant`, `record`, `doctorProvider`). Detalle en `hcd_api/idl/hcd.json`.
## 2026-10-05 · `hcd_app` se reparte entre Maxi y Mati · Franco (por confirmar con Mati y Maxi)
- **Maxi** se queda con lo que ve el jurado: rutas `(paciente)` y `(medico)`, `components/` (visor, marca de agua, QR, listas), la marca Salua en lo visible y la publicación del demo.
- **Mati** suma la plomería de la app: `app/(auth)/login`, `(clinica)/avalar-medicos`, `(admin)/verificar`, `lib/api.ts`, `lib/supabase.ts`, `lib/privy.ts`, `lib/schemas/` (copia de los esquemas Zod que él mismo escribe en la API), `lib/hcd-client/` (con Franco), guards de ruta, estados globales de carga/error y la PWA (manifest + Serwist + Web Push).
- **Por qué:** la app era la carga más pesada del proyecto y estaba toda en una sola persona. Todo lo que se movió empalma con el backend que escribe Mati: cada uno hace el endpoint y la pantalla que lo consume, con menos coordinación y sin errores de traducción de contratos.
- **Regla de territorio:** un archivo, una sola persona. Si Maxi necesita un cambio en la plomería se lo pide a Mati (y viceversa con las pantallas); nunca dos personas editan lo mismo en paralelo.

## 2026-10-04 · Programa: calendario, re-otorgar permisos y cuentas pagadas por el sponsor · Misael
- **Las 6 instrucciones del ciclo** (`issue_record`, `dispute_record`, `void_record`, `grant_access`, `revoke_access`, `log_access`) entran el **lunes 5**, con el IDL v0 esa noche, como dice el plan de Franco (`Plan_Completo_Salua.pdf`). Deploy con tests negativos el martes 6.
- **Re-otorgar un permiso revocado o vencido:** se reactiva el **mismo** AccessGrant (`["grant", record, doctor]`) con un vencimiento nuevo; `access_count` sigue sumando. Sin esto, un paciente no podía volver a darle acceso al mismo médico, porque la cuenta revocada no se cierra.
- **`register_provider` y `register_patient` tienen un `payer` aparte del `authority`:** el fee payer del backend paga el rent y el usuario solo firma, así nunca necesita SOL.
- **`initialize_config` solo lo puede llamar la upgrade authority del programa**, para que nadie se adelante después del deploy y se quede con el rol de admin.
- **`issue_record` exige dos firmas: el médico verificado y `key_service`.** El backend solo co-firma con `key_service` si el código del QR del paciente es válido. Sin esto, un médico verificado podía saltear el backend y cargarle estudios a cualquier wallet (el "hueco de carga" del plan). Impacto: el módulo `tx` (Franco) agrega la firma de `key_service` al armar `issue_record`.

## 2026-10-04 · Program ID del programa `hcd` y Solana 3.1.10 · Misael
- El programa usa el ID **`8FNP6rs3DQ4h6bqWNeD9meHt5mUNEhcaXbrbJxSJniyd`** (antes había un placeholder). Va en `PROGRAM_ID` (`hcd_api/.env`) y `NEXT_PUBLIC_PROGRAM_ID` (`hcd_app/.env`). Desplegado en devnet el 2026-10-04; la upgrade authority es la wallet de desarrollo de Misael.
- El toolchain del programa es **Anchor 1.2.0 + Solana CLI 3.1.10** (`Anchor.toml`). Solana 1.18 no compila con Anchor 1.2.

## 2026-10-04 · Puertos locales: API en 3001, app en 3000 · Misael
`hcd_api` y `hcd_app` (`next dev`) usaban los dos el puerto 3000 y no podían correr a la vez. La API pasa a `PORT=3001`; la app queda en 3000 y apunta a `NEXT_PUBLIC_API_URL=http://localhost:3001`. `CORS_ORIGIN` de la API sigue en `http://localhost:3000`. Falta actualizar `hcd_api/.env.example` y el default de `src/main.ts` (Matías) y `hcd_app/.env.example` (Maximiliano).

## 2026-10-03 · Login con Supabase Auth, wallet con Privy y aislamiento con RLS · Misael
- **Supabase Auth** hace el login (email y Google). **Privy** solo crea y maneja la wallet embebida de Solana, aceptando el token de Supabase (modo "custom auth").
- Así Supabase reconoce al usuario y **RLS aísla los datos entre organizaciones** con una tabla `app_user` y `get_my_organization_id()`. El backend lee con un cliente por request con el token del usuario y solo él escribe.
- Se mantiene todo lo anterior: fee payer propio, backend que arma las transacciones, wallet embebida.
- **Solo Privy, no Cavos** (ni las dos a la vez): cada una crea su propia wallet y la de Cavos no acepta nuestro fee payer.
- **Antes de construir encima:** prueba de 1 hora para confirmar que Privy crea wallets de Solana con el token de Supabase. Si falla, el login vuelve a Privy con canje de token.
- Detalle del patrón en [stack.md](stack.md#patrón-multi-organización-con-rls).

## 2026-10-03 · Caso Pepito: origen y emisor visibles en el MVP · Misael (aceptado por el equipo)
Para el caso de un médico cómplice que carga un estudio falso: en el MVP el visor muestra el origen ("emitido por el centro" o "copia digitalizada por el médico") y los datos completos del emisor (nombre, matrícula, especialidad, fecha on-chain, transacción). El resto de las soluciones (alerta de conflicto, suspender prestadores, auditoría como evidencia, centros como emisores, detección de patrones) queda en la [hoja de ruta](plan.md#15-hoja-de-ruta-después-del-mvp).

## 2026-10-03 · Stack: NestJS, supabase-js sin ORM, npm y TypeScript 6 · Misael
- Backend con **NestJS** en vez de Express. Por eso: `@nestjs/throttler` en lugar de `express-rate-limit`, Jest en lugar de Vitest y un `ZodValidationPipe` propio (`nestjs-zod` todavía no soporta NestJS 12).
- **`@supabase/supabase-js` directo**, sin ORM. Migraciones y tipos con el Supabase CLI.
- **npm** en todos los repos.
- **TypeScript 6.0** en todos los repos (la del CLI de NestJS).
- Detalle en [stack.md](stack.md).

## 2026-10-03 · Cuatro repos: `hcd`, `hcd_api`, `hcd_app` y `hcd_landing` · Misael
`hcd` queda como repo de documentación. El programa Anchor va dentro de `hcd_api`. Los tres repos de código se clonan dentro de `hcd` y usan sus hooks y su `docs/`. Ver [plan.md](plan.md#11-estructura-de-repositorios).

## 2026-10-03 · Se aceptan las propuestas del relevamiento de Franco · Franco (aceptado por el equipo)
Detalle en el [relevamiento](../miembros/franco/relevamientos/2026-10-03-fees-wallet-antifalsificacion.md). Aplicado en [plan.md](plan.md) y [arquitectura.md](arquitectura.md).
- **Solo el médico verificado carga estudios**, cada uno firmado con su propia wallet. Se elimina el rol "personal de clínica que carga".
- **La clínica no carga estudios**; avala qué médicos le pertenecen.
- **El paciente no modifica nada.** No existe ninguna instrucción que edite un Record.
- **Estados del Record: Active → Disputed → Voided.** El paciente solo puede marcar "no es mío" (`dispute_record`); el emisor anula (`void_record`) y reemite. Reemplaza Pending/Accepted/Rejected del plan v1.
- **El paciente sigue aprobando y revocando accesos.** `grant_access` exige Record Active.
- **El médico emisor puede releer sus estudios** sin permiso.
- **Fee payer propio en el backend:** el servidor arma la transacción, el usuario firma y el backend verifica byte a byte antes de co-firmar. Rate limit por usuario y organización, presupuesto diario, hot wallet con poco saldo y alerta.
- **Fee payer y autoridad `key_service` en keypairs distintos.**
- **Payer separado del firmante**, para que el paciente pueda pagarse sus transacciones si el backend cae.
- **El rent de cuentas cerradas vuelve al sponsor** (`rent_payer` + `close = rent_payer`).
- **El visor verifica el hash** del archivo cifrado contra el on-chain antes de descifrar.
- **Privy, no Cavos**, para el MVP.
- **Empezar por el programa Anchor**, no por el monorepo.

## 2026-10-03 · El plan v1 en PDF es la base del proyecto · Misael
[plan-v1.pdf](plan-v1.pdf) queda como documento base. [plan.md](plan.md) lo resume en texto y aplica los cambios aceptados; si no coinciden, manda `plan.md`.

## 2026-10-03 · El repo va en inglés, salvo `docs/` · Misael
Código, comentarios, commits y PRs en inglés para que los jueces lo lean. `docs/` queda en español porque es la memoria interna del equipo. Lo hacen cumplir [AGENTS.md](../../AGENTS.md) y el hook `commit-msg`.

## 2026-10-03 · `docs/` como segundo cerebro, actualizado en cada commit · Misael
Cada integrante tiene su carpeta en `docs/miembros/` y la actualiza en el mismo commit que su código. Así cualquier agente puede responder "¿en qué está trabajando X?". Lo hace cumplir el hook `pre-commit`.

## 2026-10-03 · Nombre del proyecto: HCD · Historial Clínico Digital · Misael

## 2026-10-03 · Nada médico en la cadena · propuesta de la investigación
En Solana solo van identidad, permisos, hashes, firmas y registro de accesos. Los documentos van cifrados en almacenamiento que se pueda borrar. Ver [arquitectura.md](arquitectura.md).

## 2026-10-06 · Dependencias de la integración Privy en la app · implementación de Matías para revisión
- La integración usa Supabase PKCE y el hook useSyncJwtBasedAuthState de Privy para eventos de sesión y renovación de tokens. El cliente no acredita por sí mismo la propiedad de la wallet ante la API.
- Para compilar el SDK Solana de Privy se agregan sus peer dependencies: @solana/kit 8.4.0 (ya parte del stack), @solana-program/memo 0.15.0, @solana-program/system 0.15.0 y @solana-program/token 0.17.0. Versiones fijadas con npm y lockfile. No se introduce otro proveedor de wallets.
- El recorrido de esta entrega termina en sesión y wallet. El alta de app_user y vinculación verificable quedan en backend de Matías; protección de tx/keys y asociación al signer requieren integración con Franco.
