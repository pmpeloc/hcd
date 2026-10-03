# Bitácora · Misael

Una entrada por commit, la más nueva arriba.

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
