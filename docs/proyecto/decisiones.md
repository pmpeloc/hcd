# Decisiones del equipo

Una entrada por decisión, la más nueva arriba. Formato: fecha · decisión · quién la propuso · por qué.

## 2026-10-04 · Programa: calendario, re-otorgar permisos y cuentas pagadas por el sponsor · Misael
- **Las 6 instrucciones del ciclo** (`issue_record`, `dispute_record`, `void_record`, `grant_access`, `revoke_access`, `log_access`) entran el **lunes 5**, con el IDL v0 esa noche, como dice el plan de Franco (`Plan_Completo_Salua.pdf`). Deploy con tests negativos el martes 6.
- **Re-otorgar un permiso revocado o vencido:** se reactiva el **mismo** AccessGrant (`["grant", record, doctor]`) con un vencimiento nuevo; `access_count` sigue sumando. Sin esto, un paciente no podía volver a darle acceso al mismo médico, porque la cuenta revocada no se cierra.
- **`register_provider` y `register_patient` tienen un `payer` aparte del `authority`:** el fee payer del backend paga el rent y el usuario solo firma, así nunca necesita SOL.
- **`initialize_config` solo lo puede llamar la upgrade authority del programa**, para que nadie se adelante después del deploy y se quede con el rol de admin.
- **Pendiente:** exigir la firma de `key_service` en `issue_record` para cerrar el hueco de carga. Misael recomienda que sí; hay que decidirlo antes del IDL v0.

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
