---
name: commit-docs
description: Antes de cada commit de código, actualiza la bitácora y el archivo de estado del proyecto Salua/HCD para que el hook de pre-commit no rebote. Usar siempre antes de commitear.
---

# commit-docs

Objetivo: que cada commit de código lleve su documentación al día, sin rebotes del hook.

## Pasos
1. Corré `git status` y `git diff --staged` (si no hay nada en stage, `git diff`). Entendé qué cambió y por qué.
2. Abrí la bitácora y el archivo de estado del repo (los que el hook del repo valida; si no estás seguro de cuáles son, mirá el script del hook en `.git/hooks/` o `.husky/`).
3. Bitácora: agregá una entrada con fecha, qué se hizo (1-3 líneas), decisiones tomadas y qué quedó pendiente. Sin relleno.
4. Estado: actualizá solo lo que realmente cambió (módulos terminados, bloqueos, próximos pasos).
5. Hacé `git add` de esos archivos de documentación junto con el código.
6. Proponé el mensaje de commit en formato convencional (`feat:`, `fix:`, `docs:`, `refactor:`) y esperá confirmación antes de commitear.

## Reglas
- No inventes avances: si no está en el diff, no va en la bitácora.
- No toques archivos de código en esta skill; solo documentación.
- Si el hook igual falla, mostrá el mensaje exacto del hook y corregí lo que pide, sin saltearlo (`--no-verify` prohibido).
