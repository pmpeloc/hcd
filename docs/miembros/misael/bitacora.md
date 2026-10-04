# Bitácora · Misael

Una entrada por commit, la más nueva arriba.

## 2026-10-04 · chore(deps): prune extraneous entries from package-lock
- **Qué hice:** npm quitó del `package-lock.json` entradas `extraneous` (dependencias anidadas sin uso, p. ej. copias de `typescript` y `zod`). No cambia ninguna versión instalada.
- **Archivos clave:** `hcd_api/package-lock.json`, `hcd_app/package-lock.json`.
- **Próximo paso:** completar las credenciales en los `.env` locales; seguir con el programa Anchor.

## 2026-10-04 · chore(config): move API dev port to 3001
- **Qué hice:** la API y la app usaban los dos el puerto 3000 y no podían correr a la vez. La API pasa a 3001 (`.env.example` y default de `main.ts`) y la app apunta a `http://localhost:3001`. Toqué archivos de Matías y Maximiliano con su aviso pendiente; decisión registrada en `decisiones.md`.
- **Archivos clave:** `hcd_api/.env.example`, `hcd_api/src/main.ts`, `hcd_app/.env.example`, `docs/proyecto/decisiones.md`.
- **Próximo paso:** completar las credenciales de Supabase, Helius y Privy en los `.env` locales; seguir con el programa Anchor.

## 2026-10-04 · chore(agents): add agent instruction files pointing to hcd rules
- **Qué hice:** los repos de código no tenían `AGENTS.md`, y Codex y otros agentes buscan las reglas solo hasta la raíz del repo, así que no las veían. Copié la plantilla (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`) a `hcd_api`, `hcd_app` y `hcd_landing`. Además, `AGENTS.md` ahora pide leer `plan.md`, `stack.md`, `decisiones.md` y `docs/tareas/<slug>.md` antes de cada tarea; con eso el prompt de arranque se reduce a "Soy `<slug>`".
- **Archivos clave:** `AGENTS.md`, `templates/code-repo/`, y en cada repo de código `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`.
- **Próximo paso:** arrancar el esquema de cuentas del programa Anchor (`docs/tareas/misael.md`, día 1).

## 2026-10-03 · docs: use Supabase Auth for login, Privy for wallets and RLS per organization
- **Qué hice:** decidimos que el login lo haga Supabase Auth y que Privy solo cree la wallet (modo "custom auth"), para poder aislar organizaciones con RLS. Documenté el patrón multi-organización completo en `stack.md` (guard con `getClaims`, cliente por request con el token del usuario, `app_user` + `get_my_organization_id()`, solo el backend escribe, cuidado con las RPC `security definer`, tests con pgTAP), sin depender de conocer otros proyectos. Confirmado: solo Privy, no Cavos.
- **Archivos clave:** `docs/proyecto/stack.md`, `decisiones.md`, `plan.md`, `arquitectura.md`.
- **Próximo paso:** prueba de 1 hora de Privy con Supabase Auth y Solana; armar el tablero de tareas.

## 2026-10-03 · chore: split project into docs and code repos and define the stack
- **Qué hice:** definimos cuatro repos (`hcd` docs, `hcd_api` backend + programa, `hcd_app`, `hcd_landing`), los tres de código clonados dentro de `hcd`. Adapté el hook `pre-commit` para que funcione en los repos de código y exija la bitácora pendiente en `hcd/docs` (probado), agregué `.gitignore`, plantilla de `AGENTS.md` para los repos de código y el onboarding. Armé `stack.md` con versiones verificadas: NestJS 12, supabase-js sin ORM, npm, TypeScript 6. Revisé Cavos contra Privy: Cavos no permite fee payer propio ni verificar usuarios en el backend, así que seguimos con Privy. Registré el caso Pepito (MVP: origen y emisor en el visor; resto a la hoja de ruta).
- **Archivos clave:** `.githooks/pre-commit`, `.gitignore`, `AGENTS.md`, `README.md`, `templates/code-repo/`, `docs/proyecto/stack.md`, `plan.md`, `decisiones.md`.
- **Próximo paso:** crear los tres repos en GitHub y arrancar `hcd_api` con el programa Anchor.

## 2026-10-03 · docs: note pitch deck is updated with accepted roles
- **Qué hice:** actualicé la presentación con los roles aceptados: diagrama del sistema (médico carga, clínica avala, backend con API, servicio de llaves e indexer; Privy en datos), flujo con "no es mío" y verificación de hash, y la tarjeta "Firmado por el médico". Saqué de `arquitectura.md` la advertencia de que estaba desactualizada.
- **Archivos clave:** `docs/proyecto/arquitectura.md`, presentación (diapositivas 2, 5 y 6).
- **Próximo paso:** arrancar el programa Anchor.

## 2026-10-03 · docs: add project plan, accept Franco's proposals and verify on-chain costs
- **Qué hice:** subí el plan v1 (`plan-v1.pdf`) y lo resumí en `plan.md` con los cambios aceptados. Registré en `decisiones.md` las propuestas de Franco que aceptó el equipo y actualicé `arquitectura.md`. Verifiqué las cifras del relevamiento de Franco contra la red de Solana y fuentes oficiales: el rent real es (128 + bytes) × 5.080 lamports, no 6.960; AccessGrant son 118 bytes, no 90; costo por paciente por año ≈ 0,041 a 0,0475 SOL, de los cuales las comisiones son solo ≈ USD 0,09.
- **Archivos clave:** `docs/proyecto/plan.md`, `plan-v1.pdf`, `decisiones.md`, `arquitectura.md`, `investigacion.md`, relevamiento de Franco.
- **Próximo paso:** actualizar la presentación con los cambios de roles y arrancar el programa Anchor.

## 2026-10-03 · docs: link pitch deck from README and project docs
- **Qué hice:** dejé visible el link a la [presentación](https://claude.ai/artifact/KoaaYCW2DJJAyeZpHPSB5S) en el README principal, arriba de `docs/README.md` y en `arquitectura.md` (diapositivas 5 y 6 = diagrama y flujo). Antes solo estaba al final de `docs/README.md` y en `investigacion.md`.
- **Archivos clave:** `README.md`, `docs/README.md`, `docs/proyecto/arquitectura.md`.
- **Próximo paso:** revisar con el equipo los problemas pendientes antes de arrancar a codear.

## 2026-10-03 · chore: bootstrap repository with agent rules and team docs
- **Qué hice:** conecté Colosseum Copilot e investigué herramientas de Solana, precedentes en hackatones y marco legal. Armé la presentación del proyecto, definí el nombre (HCD) y la descripción del repo. Creé `docs/` como segundo cerebro, las reglas para agentes (AGENTS.md, CLAUDE.md, GEMINI.md, Copilot), los hooks de git y el README con el onboarding. Roles definidos: Misael, Maxi y Franco developers; Rodrigo y Matías founders (Matías también dev).
- **Archivos clave:** `README.md`, `AGENTS.md`, `.githooks/`, `docs/proyecto/`, `docs/equipo.md`.
- **Próximo paso:** invitar al equipo y que cada uno haga el onboarding del README.
