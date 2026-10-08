# Bitácora · Franco

Una entrada por commit, la más nueva arriba.

## 2026-10-08 · docs(readme): add Archify skill and architecture diagram
- **Qué hice:** instalé la skill `tt-a1i/archify` en `.devin/skills/archify/` (queda disponible para todo el equipo; registrada en `skills-lock.json`, carpeta de trabajo `/.archify/` gitignored). Generé el mapa de arquitectura de Salua con evidencia real del repo (sources pinneadas a `hcd_api@65fa691`, gates validate/deliver/check/browser-check todos verdes) y exporté SVG canónico + HTML interactivo a `docs/proyecto/assets/`. README ahora muestra el diagrama con 3 bullets clave (cifrado en cliente, Solana solo hashes/grants/logs, backend que solo libera clave tras verificar grant on-chain) — el "Code is coming" quedó corregido porque ya hay código en los repos hermanos.
- **Archivos clave:** `.devin/skills/archify/`, `skills-lock.json`, `.gitignore`, `README.md`, `docs/proyecto/assets/salua-architecture.{svg,html}`.
- **Próximo paso:** smoke E2E contra devnet; la migración `tx_stores` sigue pendiente de correr en Supabase.

## 2026-10-07 · fix(tx): require lowercase UUID storage_ref (IDL v1)
- **Qué hice:** revisión cruzada del programa de Misael (PR hcd_api#10): leí las 11 instrucciones + 5 cuentas + errors/events completos y corrí `anchor test` en WSL (62/62 verdes, 1 skipped). Checklist de firmantes, seeds, Clock, log_access y datos on-chain: todo OK; dos menores reportados en la review (typo "ponytail:" en register_provider.rs y la independencia admin/key_service en update_config). Aprobé y mergeé #10 + docs #15. Adapté `src/tx/` al contrato nuevo: `storage_ref` ahora exige UUID canónico en minúscula (regex espejo del validador on-chain) + test negativo nuevo (13 tests en total).
- **Archivos clave:** `src/tx/tx-schemas.ts`, `src/tx/tx.service.spec.ts`. También aprobé y mergeé las PRs de Mati: #11 (schema wallet+key_releases) y #12 (SupabaseAuthGuard, resolviendo el conflicto de README que le quedó con #11; 25 tests verdes post-merge).
- **Próximo paso:** revisar PRs de Mati (#11 schema key_releases, #12 auth guard) para destrabar `src/keys/`; el storage_ref real lo pasa el endpoint `/records` de Mati (records.id).

## 2026-10-05 · feat(tx): add transaction build/submit flow with byte-by-byte verification
- **Qué hice:** implementé `src/tx/` completo según `modulo-tx.md`: `POST /tx/build` arma la transacción con el cliente Anchor contra `idl/hcd.json` (7 instrucciones de usuario, resuelve PDAs y `next_record_id` on-chain), guarda los bytes del `message` en un store con TTL ~2 min; `POST /tx/submit` compara byte a byte (un bit distinto = 403 + log de seguridad), verifica la firma del usuario, co-firma como fee payer (+`key_service` en `issue_record`) y envía a devnet con fallback de RPC. Fee payer protegido con throttler por wallet (10/min), cupo diario por usuario (50), presupuesto diario en lamports (corrige con el balance delta real post-confirmación) y alerta de saldo bajo. Errores del programa 6000+ mapeados a 422 desde el IDL. 12 tests Jest verdes incluyendo tamper, firma forjada, tx_id de un solo uso y budget 429.
- **Decisiones:** cliente `@anchor-lang/core` en vez de Codama por ahora (la interfaz `ProgramClient` aísla el swap futuro); `pending_tx` y `fee_payer_spend` en memoria — se migran a Postgres cuando llegue el esquema de Mati (misma interfaz). `npm test` ahora corre con `--experimental-vm-modules` porque `@solana/web3.js` trae `uuid` ESM-only.
- **Archivos clave:** `src/tx/` (9 archivos + spec), `.env.example` (`TX_DAILY_BUDGET_LAMPORTS`), `package.json`.
- **Próximo paso:** PR a `staging` con 1 aprobación; día 5 `hcd_app/lib/crypto/`; luego `src/keys/` donde entra el Memo con `key_releases.id` en `log_access`.

## 2026-10-05 · docs(specs): add key service, tx module and Privy spike docs
- **Qué hice:** specs de trabajo escritos con subagentes sobre el IDL v0 real. `servicio-llaves.md`: flujo de `/keys/release` con matriz de decisión, HKDF/AES-GCM exactos, propuesta de columnas para `key_releases`; `modulo-tx.md`: flujo `POST /tx/build` + `/tx/submit`, verificación byte a byte, límites del fee payer; `prueba-privy.md`: plan A confirmado (JWKS de Supabase devuelve ES256 — verifiqué el endpoint). Hallazgo: `log_access` exige grant de médico, así que entregas a paciente/emisor solo quedan en `key_releases`.
- **Archivos clave:** `docs/proyecto/servicio-llaves.md`, `modulo-tx.md`, `prueba-privy.md`.
- **Próximo paso:** decisión sobre `log_self_access` + `app_user.wallet_pubkey` (aviso a Mati/Misael); Día 2: implementar `src/tx/`.

## 2026-10-05 · docs(tasks): split hcd_app between Maxi and Mati
- **Qué hice:** redistribuí `hcd_app` porque toda la app estaba en una sola persona. Maxi se queda con lo que ve el jurado (`(paciente)`, `(medico)`, `components/`, marca y demo); Mati suma la plomería que empalma con su backend (`(auth)/login`, `(clinica)`, `(admin)`, `lib/api|supabase|privy|schemas|hcd-client`, guards y PWA). Actualicé los planes de ambos, `franco.md`, `equipo.md` y la decisión en `decisiones.md`.
- **Archivos clave:** `docs/tareas/maximiliano.md`, `docs/tareas/matias.md`, `docs/tareas/franco.md`, `docs/proyecto/decisiones.md`, `docs/equipo.md`.
- **Próximo paso:** avisar en el grupo antes de mergear; arrancar Día 1 (diseño del servicio de llaves + prueba Privy).

## 2026-10-04 · feat(demo): add real logo, ES/EN language switch and larger type
- **Qué hice:** integré el logo oficial (`demo/assets/logo-salua.jpeg`) en sidebar, topbar móvil y favicon; subí toda la escala tipográfica (~+2-4px en textos chicos); agregué toggle ES/EN en la topbar con diccionario completo en `app.js` (~120 strings), persistencia en localStorage y locale de fechas. Log, notificaciones y panel on-chain se re-traducen al cambiar de idioma.
- **Archivos clave:** `demo/app.js`, `demo/styles.css`, `demo/index.html`, `demo/assets/`.
- **Próximo paso:** deploy del `demo/` en Vercel/Netlify y ensayo del guion bilingüe.

## 2026-10-03 · feat(demo): add Salua clickable prototype
- **Qué hice:** prototipo navegable de Salua en `demo/` (HTML+CSS+JS puro, sin backend ni build, datos ficticios). Recorre el flujo completo: emisión firmada de estudio, disputa "no es mío", solicitud de acceso, firma de grant_access por 1h/24h/7d, visor con marca de agua y verificación de hash, denegación por defecto, vencimiento del permiso y línea de tiempo con links simulados a solscan devnet. Panel lateral "Qué queda en Solana" con PDAs, hashes, firmas y eventos. Verificado de punta a punta con Playwright en móvil y desktop.
- **Archivos clave:** `demo/index.html`, `demo/app.js`, `demo/styles.css`, `demo/README.md`.
- **Próximo paso:** deploy en Vercel/Netlify para presentarlo mañana en la entrega.

## 2026-10-03 · feat(landing): scaffold static Next.js landing page
- **Qué hice:** estructura base de `hcd_landing`: Next.js con `output: 'export'`, Tailwind 4 con la paleta Salua, página inicial con hero/problema/cómo funciona/seguridad/equipo, `.gitignore`, `.env.example` y README. Build estático verificado (`out/`).
- **Archivos clave:** `hcd_landing/app/`, `next.config.ts`, `package.json`.
- **Próximo paso:** Rodrigo y Maximiliano completan las secciones y la marca; publicar en Vercel (día 8).

## 2026-10-03 · feat(app): scaffold Next.js app with role routes and crypto lib
- **Qué hice:** estructura base de `hcd_app`: Next.js 16 + TypeScript 6 + Tailwind 4, grupos de rutas por rol (`(auth)`, `(paciente)`, `(medico)`, `(clinica)`, `(admin)`) con páginas stub, `lib/crypto/` con AES-256-GCM + SHA-256 en WebCrypto, `lib/` con clientes de Supabase, Privy y API, manifest de PWA, `.gitignore`, `.env.example` y README. `next build` verifica las 14 rutas.
- **Archivos clave:** `hcd_app/app/`, `lib/crypto/index.ts`, `lib/{supabase,privy,api}.ts`, `package.json`.
- **Próximo paso:** prueba de 1 hora de Privy + Supabase Auth; layouts y login reales (Maximiliano, día 2-3).

## 2026-10-03 · feat(api): scaffold NestJS API, Anchor program skeleton and Supabase schema
- **Qué hice:** estructura base de `hcd_api`: proyecto NestJS 12 (módulos auth, organizations, records, access, keys, tx, indexer, common), esqueleto del programa Anchor con las 5 cuentas y 10 instrucciones stub, migración inicial de Supabase con `app_user` + RLS por organización, carpetas `idl/` y `tests/`, `.gitignore`, `.env.example` y README. `npm run build` y `npm test` verificados.
- **Archivos clave:** `hcd_api/src/`, `programs/hcd/src/`, `supabase/migrations/20261003000000_init.sql`, `Anchor.toml`.
- **Próximo paso:** kickoff del domingo para congelar cuentas y contratos; Misael implementa las instrucciones.

## 2026-10-03 · docs(tasks): add individual task plans for the 10-day sprint
- **Qué hice:** creé `docs/tareas/` con un archivo por integrante: plan día por día (Día 1 = sáb 3/10 a Día 10 = lun 12/10), entregables, criterios de aceptación y archivos/módulos bajo la responsabilidad de cada uno, según la división de trabajo del plan v2 y el plan completo de Salua.
- **Archivos clave:** `docs/tareas/franco.md`, `rodrigo.md`, `maximiliano.md`, `misael.md`, `matias.md`.
- **Próximo paso:** kickoff técnico del domingo 4/10 para congelar cuentas y contratos de API; enviar la preselección antes de las 13:00.

## 2026-10-03 · docs(franco): add research on network fees, wallets and anti-forgery
- **Qué hice:** relevamiento con Claude Desktop sobre quién paga los fees de red, Privy vs Cavos, cómo evitar estudios falsificados y roles de carga. Lo cargó Misael en el repo a partir de la exportación de Franco.
- **Archivos clave:** `docs/miembros/franco/relevamientos/2026-10-03-fees-wallet-antifalsificacion.md`, `ideas.md`, `estado.md`.
- **Próximo paso:** decidir en equipo las propuestas de diseño y arrancar el programa Anchor.
