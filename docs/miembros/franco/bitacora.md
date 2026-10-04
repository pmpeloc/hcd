# Bitácora · Franco

Una entrada por commit, la más nueva arriba.

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
