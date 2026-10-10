# Bitácora · Franco

Una entrada por commit, la más nueva arriba.

## 2026-10-10 · fix(db): grant table privileges to service_role and authenticated
- **Qué hice:** las migraciones se aplicaron por el pooler como `postgres`, entonces los default privileges de Supabase (que cubren tablas creadas por `supabase_admin`) nunca corrieron — `service_role` y `authenticated` no tenían permisos sobre ninguna tabla nueva y todo PostgREST devolvía "permission denied". Migración correctiva: `service_role` recibe DML completo + sequences, `authenticated` recibe SELECT por tabla (respetando los revokes deliberados y la lista de columnas de `records`), y default privileges de ambos quedan alineados para tablas futuras. Aplicada a Supabase compartida; el enrolamiento de wallet arrancó a funcionar inmediatamente.
- **Archivos clave:** `supabase/migrations/20261014000000_role_privileges.sql`.
- **Próximo paso:** smoke E2E — ya validado el enrolamiento; falta QR, acceso y upload.

## 2026-10-10 · fix(app): live devnet smoke fixes
- **Qué hice:** correcciones que salieron del primer smoke E2E real: la app nunca llamaba `register_patient` (ahora firma el alta on-chain post-enrolamiento; el fee payer cubre el rent), el login no redirigía (ahora lleva a `/inicio` o `/panel` según el rol del profile), el home `/inicio` estaba 100% hardcodeado (ahora carga solicitudes, permiso activo con revocación real, estudios y registro de accesos desde la API), y Privy 3.x pedía RPC de Solana explícito (`solana:devnet` con clientes kit + `chain` en `signTransaction`). `TxRequest` suma `register_patient` y `register_provider`. Verificado en vivo: enrolamiento completo y PatientProfile creado en devnet.
- **Archivos clave:** `lib/auth-providers.tsx`, `components/onchain/tx-flow.ts`, `app/(auth)/login/page.tsx`, `app/(paciente)/inicio/page.tsx`.
- **Próximo paso:** seguir el smoke — QR del paciente, cuenta médico, pedido/aprobación de acceso y upload cifrado. Bloqueo: `set_provider_verified` requiere la wallet admin (upgrade authority) de Misael.

## 2026-10-10 · feat(app): wire the real API end to end
- **Qué hice:** reemplacé los placeholders de la app por llamadas reales: QR contra `POST /patients/me/record-code` (exige wallet enrolada), lookup + `POST /access-requests`, upload cifrado (AES-256-GCM en el browser → `/records/upload-url` → PUT del blob sellado a la signed URL → `POST /records` → `issue_record` vía `runTx`), estudios desde `GET /patients/me/records` con `dispute_record` firmado por el paciente, centro de accesos con `grant_access`/`revoke_access` por PDA, y la página de historial nueva contra `GET /patients/me/timeline`. Enrolamiento Privy challenge→firma→verify integrado en `WalletBridge` (la firma es siempre la acción del usuario en el modal). `DEMO_DATA` (`NEXT_PUBLIC_DEMO_RECORDS=1`) conserva los fixtures para e2e. tsc + eslint limpios, Playwright 80/80.
- **Archivos clave:** `lib/auth-providers.tsx`, `lib/enrollment.ts`, `lib/demo.ts`, `components/{patient-qr,doctor-scanner,doctor-upload,patient-studies,access,timeline}/`.
- **Próximo paso:** smoke E2E devnet con dos sesiones reales (paciente + médico).

## 2026-10-10 · feat(api): complete MVP modules and wallet enrollment
- **Qué hice:** cerré los tres módulos stub (organizations, access, indexer), integré el enrolamiento de Mati (#22), alias dictables `SAL-XXXX` sobre el mismo nonce de un solo uso, metadata de estudios (título/fecha/origen/emisor), grants revocables (`reason`, `granted_expires_at`, `grant_pda`), el formato sealed `iv‖ct+tag` con el IV declarado verificado contra el blob, y reserva de `issue_record` contra la reserva de upload persistida. El indexer baja los 7 eventos del programa a `audit_events` y activa los `pending_chain` con PDA derivada localmente. Migraciones aplicadas a Supabase (8, vía pooler) + bucket `records` privado. 126/126 tests, lint/build limpios.
- **Archivos clave:** `src/{organizations,access,indexer}/`, `src/auth/wallet-enrollment.*`, `src/records/*`, `supabase/migrations/2026101{0,1,2,3}*`.
- **Próximo paso:** merges en orden (#22 → #17–#20) y smoke E2E devnet.

## 2026-10-08 · fix(tx): fail closed on identity lookup errors
- **Qué hice:** punto de Mati en coordinación — si la consulta de `app_user` falla (DB/red), `/tx/build` devolvía 403 como si el usuario no tuviera wallet; ahora una query con error da 503 (reintentable) y solo la ausencia real de wallet verificada da 403. Mismo criterio aplicado en `/keys` (rama `fix/keys-fail-closed`, nuevo test de lookup caído → 503). Tests 17/17 tx + 16/16 keys, lint limpio. Va en `hcd_api#19` y `hcd_api#17`.
- **Archivos clave:** `hcd_api/src/tx/tx.service.ts`, `tx.service.spec.ts`.
- **Próximo paso:** mismo fix en `keys.service.ts` (rama `fix/keys-fail-closed`), rebase de #20, coordinar contrato con Mati.

## 2026-10-08 · refactor(keys): only verified enrolled wallets get grants
- **Qué hice:** `/keys/release` ya no confía en `doctors.wallet_pubkey` ni en `app_user.wallet_pubkey` pelado: la única wallet que habilita grants es la del `app_user` con `wallet_verified_at` no nulo (post-enrolamiento de #22). Wallets legacy o cargadas por admin sin prueba quedan afuera. Mock del spec actualizado, nuevo test de wallet sin verificar → 403, 15/15 tests, lint/build limpios. Va en `hcd_api#17`.
- **Archivos clave:** `hcd_api/src/keys/keys.service.ts`, `keys.service.spec.ts`.
- **Próximo paso:** rebase de #20 sobre el nuevo tip de #19; revisión de API #22 en curso.

## 2026-10-08 · refactor(tx): require enrolled wallet, drop first-use binding
- **Qué hice:** siguiendo la revisión de Mati y su enrolamiento (#22), `/tx/build` ya no bindea el primer signer ni acepta `wallet_proof`: exige que `signer` coincida con `app_user.wallet_pubkey` y que `wallet_verified_at` no sea nulo (la prueba de posesión la hace el desafío de enrolamiento). Sin wallet enrolada o wallet no verificada → 403. Esquemas sin `wallet_proof`/`wallet_proof_ts`, 16/16 tests, lint/tsc/build limpios. Va en `hcd_api#19`.
- **Archivos clave:** `hcd_api/src/tx/tx.service.ts`, `tx-schemas.ts`, `tx.service.spec.ts`.
- **Próximo paso:** mismo requisito `wallet_verified_at` en `/keys` (rama `fix/keys-fail-closed`); rebase de #20 sobre el nuevo tip de #19.

## 2026-10-08 · feat(tx): prove wallet ownership before first-use binding
- **Qué hice:** hallazgo de Mati en review de #19 — el binding anterior registraba `wallet_pubkey` sin probar posesión (cualquiera podía ligar la clave de otro). Ahora el primer `build` exige `wallet_proof` (firma ed25519 de `salua:bind-wallet:<user.id>:<signer>:<ts>`, frescura ≤5 min) + `wallet_proof_ts`; verificación nativa con `crypto.verify` + JWK — cero dependencias nuevas. Sin proof → 400, firma inválida o stale → 403. 3 tests nuevos (19/19 en tx), lint/build limpios. Va en `hcd_api#19`.
- **Archivos clave:** `src/tx/{tx.service,tx-schemas,tx.service.spec}.ts`.
- **Próximo paso:** la app firma ese mensaje con Privy `signMessage` en el primer build (aviso a Maxi/Mati); luego smoke E2E.

## 2026-10-08 · feat(tx): move pending_tx and fee payer spend to Postgres
- **Qué hice:** migré los dos stores en memoria a Postgres (migración `20261008000000_tx_stores.sql`, tablas backend-only con RLS sin policies — solo service role). `pending_tx` guarda los envelopes build→submit con TTL (ya no se pierden con un restart ni dependen de una sola instancia); `fee_payer_spend` (día → lamports) + `fee_payer_user_txs` (día+signer → count) con el incremento atómico en la función `fee_payer_record` (solo service_role puede ejecutarla). Misma interfaz que antes, ahora async. Un bug del mock encontrado por los tests: el `default false` de la columna `used` no existe en un mock — explícito en el insert.
- **Archivos clave:** `src/tx/{pending-tx.store,fee-budget.service,tx.service,tx.service.spec}.ts`, `supabase/migrations/20261008000000_tx_stores.sql`.
- **Próximo paso:** smoke E2E contra devnet; la migración hay que correrla en Supabase antes de desplegar.

## 2026-10-08 · feat(tx): require auth and bind the signer wallet
- **Qué hice:** enchufé `SupabaseAuthGuard` a todo `/tx` (antes del throttler). En `build`, el `signer` declarado tiene que ser una wallet del usuario autenticado (`app_user.wallet_pubkey` o `doctors.wallet_pubkey`, leídas con service-role). Si el usuario aún no tiene wallet registrada, el primer signer se **bindea** a su `app_user` (`wallet_pubkey` null → set, nunca sobrescribe) y queda exigido de ahí en más; una wallet ya ligada a otra cuenta → 403. Así se cierra el hueco "backend co-firma cualquier signer" sin bloquear el flujo hasta que exista el enrolamiento formal. `SupabaseAdminFactory` se mudó a `src/auth/` (era de `src/keys/`) y ahora lo exporta `AuthModule` para compartirlo sin acoplar tx→keys. 3 tests nuevos (signer ajeno → 403, binding inicial, wallet ya ligada a otra cuenta → 403); 43/43 en total, lint/tsc/build limpios.
- **Archivos clave:** `src/tx/{tx.controller,tx.service,tx.module,tx.service.spec}.ts`, `src/auth/{auth.module,supabase-admin.factory}.ts`, `src/keys/*` (imports).
- **Próximo paso:** migrar `pending_tx`/`fee_payer_spend` a Postgres; smoke E2E contra devnet.

## 2026-10-08 · chore(build): exclude anchor tests from root tsconfig
- **Qué hice:** `tsc --noEmit` de staging fallaba en `tests/hcd.test.mts` (vino del merge #16: usa `web3.` sin import y `program.account.record` sin tipar — se ejecuta con el runner de Anchor que transpila sin typecheck, no con `tsc`). Saqué `tests/**/*` del `include` del `tsconfig.json` raíz; `tsconfig.build.json` ya lo excluía, así que el comportamiento queda consistente. No toqué el archivo del test (es de Misael). `tsc --noEmit` y `nest build` limpios.
- **Archivos clave:** `hcd_api/tsconfig.json`.
- **Próximo paso:** enchufar `SupabaseAuthGuard` a `/tx` + validar `signer` = `wallet_pubkey`.

## 2026-10-08 · fix(keys): fail-closed release — no DEK without a confirmed log_access
- **Qué hice:** invertí el fallback de `/keys/release` según la decisión de Franco (sin Solana no hay Salua): si `log_access` no confirma on-chain —rechazo del programa o infra caída tras 2 reintentos— no se entrega la DEK. Infra → 503 y fila `failed` (antes entregaba igual y quedaba `pending`); el médico reintenta la request completa. Caso borde aceptado: una tx que confirmó aunque el RPC no respondió deja log sin entrega, preferible a entrega sin log. `KeyCryptoService` queda exportado para que el `/records` de Mati envuelva la DEK al registrar el estudio. Spec actualizado (§5, §6, §7, §8). 14/14 tests verdes, lint y build limpios.
- **Archivos clave:** `src/keys/keys.service.ts`, `keys.service.spec.ts`, `keys.module.ts`, `docs/proyecto/servicio-llaves.md`.
- **Próximo paso:** enchufar `SupabaseAuthGuard` a `/tx` y validar `signer` = `wallet_pubkey`; migrar `pending_tx`/`fee_payer_spend` a Postgres; smoke E2E contra devnet.

## 2026-10-07 · fix(tx): require lowercase UUID storage_ref (IDL v1)
- **Qué hice:** revisión cruzada del programa de Misael (PR hcd_api#10): leí las 11 instrucciones + 5 cuentas + errors/events completos y corrí `anchor test` en WSL (62/62 verdes, 1 skipped). Checklist de firmantes, seeds, Clock, log_access y datos on-chain: todo OK; dos menores reportados en la review (typo "ponytail:" en register_provider.rs y la independencia admin/key_service en update_config). Aprobé y mergeé #10 + docs #15. Adapté `src/tx/` al contrato nuevo: `storage_ref` ahora exige UUID canónico en minúscula (regex espejo del validador on-chain) + test negativo nuevo (13 tests en total).
- **Archivos clave:** `src/tx/tx-schemas.ts`, `src/tx/tx.service.spec.ts`. También aprobé y mergeé las PRs de Mati: #11 (schema wallet+key_releases) y #12 (SupabaseAuthGuard, resolviendo el conflicto de README que le quedó con #11; 25 tests verdes post-merge).
- **Próximo paso:** revisar PRs de Mati (#11 schema key_releases, #12 auth guard) para destrabar `src/keys/`; el storage_ref real lo pasa el endpoint `/records` de Mati (records.id).

## 2026-10-07 · feat(keys): add key release service with on-chain audit
- **Qué hice:** implementé `src/keys/` según `servicio-llaves.md`: `POST /keys/release` con SupabaseAuthGuard, matriz paciente/emisor/médico decidida on-chain (Record activo, grant vigente contra Clock, provider verificado), DEK desenvuelta con KEK por organización (HKDF de MASTER_KEY, AES-256-GCM, blob `iv||ct||tag` de 60 B) y URL firmada de 60 s. En releases de médico la fila `key_releases` se inserta primero y su `id` va en un **Memo** dentro de la `log_access` (firman key_service + fee_payer): queda única y enlazada a la base. Guardarraíl al boot: KEY_SERVICE_SECRET debe ser el `Config.key_service` on-chain. 14 tests verdes. *(Mergeado en hcd_api#14; esta entrada se había perdido al mergear la PR de docs antes de pushearla.)*
- **Archivos clave:** `src/keys/{keys.service,key-crypto.service,keys.controller,keys-schemas,supabase-admin.factory,keys.module}.ts`, `src/keys/keys.service.spec.ts`, `.env.example` (`STORAGE_BUCKET`).
- **Próximo paso:** ver entrada del 08/10 — se cambió el fallback de log_access a fail-closed.

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
