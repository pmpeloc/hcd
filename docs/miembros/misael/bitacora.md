# Bitácora · Misael

Una entrada por commit, la más nueva arriba.

## 2026-10-05 · docs(agents): require PR approval on main and staging
- **Qué hice:** copié la plantilla actualizada de `AGENTS.md` en `hcd_api`, `hcd_app` y `hcd_landing`: suma la regla de trabajar en una rama desde `staging` y mergear por PR con 1 aprobación de otro integrante. Un PR por repo.
- **Archivos clave:** `AGENTS.md` de `hcd_api`, `hcd_app` y `hcd_landing`.
- **Próximo paso:** que alguien del equipo apruebe los PRs; redeploy del programa en devnet.

## 2026-10-05 · docs(rules): require PR approval on main and staging
- **Qué hice:** creé en GitHub un ruleset en los 4 repos que protege `main` y `staging`: solo se entra por PR con 1 aprobación de otro integrante, sin excepciones (tampoco el dueño), y sin push directo, force push ni borrado. Lo documenté en `AGENTS.md` (sección 6), en la plantilla de los repos de código y en `decisiones.md`.
- **Archivos clave:** `AGENTS.md`, `templates/code-repo/AGENTS.md`, `docs/proyecto/decisiones.md`.
- **Próximo paso:** avisar al equipo del flujo nuevo; redeploy del programa en devnet.

## 2026-10-05 · feat(program): implement access grants and publish IDL v0
- **Qué hice:** `grant_access` (paciente; solo a médico verificado; Record Active; vencimiento futuro y dentro del máximo contra `Clock`; re-otorgar reactiva la misma cuenta con `init_if_needed` y conserva `access_count`), `revoke_access` (paciente; Revoked sin cerrar) y `log_access` (solo `key_service`; grant Active y vigente, estudio no disputado ni anulado y médico todavía verificado). Las 9 instrucciones quedan completas, 43 tests pasando, y publiqué el IDL v0 en `idl/hcd.json`. Saqué el error `Unimplemented`.
- **Archivos clave:** `programs/hcd/src/instructions/{grant_access,revoke_access,log_access}.rs`, `programs/hcd/Cargo.toml`, `programs/hcd/src/errors.rs`, `tests/hcd.test.mts`, `idl/hcd.json`.
- **Próximo paso:** avisar al grupo del IDL v0, abrir PR a `main` para revisión de Franco y deploy en devnet.

## 2026-10-05 · feat(program): implement issue, dispute and void record
- **Qué hice:** `issue_record` exige la firma del médico verificado (no clínica) y la co-firma de `key_service`; usa `next_record_id` como semilla, guarda `rent_payer` y acepta un `superseded_record` opcional (debe estar Voided, mismo paciente y emisor) para la reemisión. `dispute_record` (paciente: Active → Disputed) y `void_record` (emisor: Disputed → Voided; un emisor suspendido igual puede anular). Emiten sus eventos. Errores nuevos: `NotADoctor`, `InvalidStorageRef`, `RecordNotVoided`, `RecordNotDisputed`. 29 tests pasando en local.
- **Archivos clave:** `programs/hcd/src/instructions/{issue_record,dispute_record,void_record}.rs`, `programs/hcd/src/errors.rs`, `programs/hcd/src/state/record.rs`, `tests/hcd.test.mts`.
- **Próximo paso:** `grant_access`, `revoke_access` y `log_access`; publicar el IDL v0 esta noche.

## 2026-10-04 · feat(program): implement config, provider and patient registration
- **Qué hice:** cerré el esquema de las 5 PDAs (semillas como constantes `SEED`) e implementé `initialize_config` (solo la upgrade authority), `register_provider` (clínica o médico, nace sin verificar), `set_provider_verified` (solo admin; sirve para verificar y suspender) y `register_patient`. El rent lo paga un `payer` aparte, así el usuario no necesita SOL. 13 tests (positivos y negativos) con `node:test`, sin dependencias nuevas. `Anchor.toml` pasa a `localnet` por defecto: `anchor test` había desplegado en devnet por error; el deploy a devnet queda explícito (`npm run anchor:deploy`).
- **Archivos clave:** `programs/hcd/src/instructions/`, `programs/hcd/src/state/`, `programs/hcd/src/errors.rs`, `tests/hcd.test.mts`, `Anchor.toml`.
- **Próximo paso:** las 6 instrucciones del ciclo del estudio y el IDL v0 (lunes 5).

## 2026-10-04 · build(program): sync program id and target Solana 3.1.10
- **Qué hice:** instalé el toolchain en WSL (Rust, Solana CLI 3.1.10, Anchor 1.2.0 con avm) y dejé `anchor build` funcionando. `Anchor.toml` pedía Solana 1.18.26, que no entiende el formato de Anchor 1.2; lo pasé a 3.1.10 y saqué `registry`. `anchor keys sync` reemplazó el ID placeholder por el real (`8FNP6rs3DQ4h6bqWNeD9meHt5mUNEhcaXbrbJxSJniyd`). Versiono `Cargo.lock` para compilar todos con las mismas dependencias. En WSL hizo falta `options = "metadata"` en `/etc/wsl.conf` para compilar sobre `/mnt/c`.
- **Archivos clave:** `hcd_api/Anchor.toml`, `hcd_api/programs/hcd/src/lib.rs`, `hcd_api/Cargo.lock`.
- **Próximo paso:** cargar SOL de devnet en mi wallet de desarrollo y hacer `anchor deploy`; después, el esquema de las 5 PDAs.

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
