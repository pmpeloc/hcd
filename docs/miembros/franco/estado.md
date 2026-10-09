# Estado · Franco

**Última actualización:** 2026-10-08 (tarde)

## En qué estoy
Convergencia con el enrolamiento de Mati (#22) completa: `/tx/build` (#19) ya no bindea el primer signer ni acepta `wallet_proof` — exige `signer === app_user.wallet_pubkey` y `wallet_verified_at` no nulo. `/keys/release` (#17) igual: solo la wallet verificada del `app_user` habilita grants; `doctors.wallet_pubkey` pelado no basta. Error de lectura de identidad → 503 (fail closed), no 403 — punto de Mati, cubierto en ambos módulos. Review de API #22 hecha en dos rondas: bloqueante de phishing (mensaje sin identificador legible) resuelto por Mati con email del JWT en el mensaje → aprobada con comentarios menores. Aprobadas también app#10 y hcd#28.

## Próximo paso
- Smoke E2E contra devnet: enroll → build → firma Privy → submit → release.
- Cuando Mati conecte la firma de mensajes Privy, probar el circuito completo.
- Fix pendiente mío: links de solscan simulados en `demo/app.js`.

## Bloqueos
- Orden de merge obligatorio: **#22 + migración `wallet_enrollment` + `WALLET_ENROLLMENT_ORIGIN` primero**, después #17 → #18 → #19 → #20. Mis consumidores exigen `wallet_verified_at`; si entran antes que la migración, todo da 403.
- Mati duplicó `supabase-admin.factory.ts` en `src/auth/` (docstring viejo de keys) — consolidar una sola copia en el segundo merge.
- Migraciones pendientes de aplicar en Supabase: `wallet_enrollment` (y `record_encryption_iv` de la rama de records).
- PRs propias en cola: `hcd_api` #17/#18/#19/#20, `hcd` #23/#24.
