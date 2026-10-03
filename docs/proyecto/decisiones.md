# Decisiones del equipo

Una entrada por decisión, la más nueva arriba. Formato: fecha · decisión · quién la propuso · por qué.

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
