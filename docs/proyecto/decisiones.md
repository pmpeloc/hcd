# Decisiones del equipo

Una entrada por decisión, la más nueva arriba. Formato: fecha · decisión · quién la propuso · por qué.

## 2026-10-03 · El repo va en inglés, salvo `docs/` · Misael
Código, comentarios, commits y PRs en inglés para que los jueces lo lean. `docs/` queda en español porque es la memoria interna del equipo. Lo hacen cumplir [AGENTS.md](../../AGENTS.md) y el hook `commit-msg`.

## 2026-10-03 · `docs/` como segundo cerebro, actualizado en cada commit · Misael
Cada integrante tiene su carpeta en `docs/miembros/` y la actualiza en el mismo commit que su código. Así cualquier agente puede responder "¿en qué está trabajando X?". Lo hace cumplir el hook `pre-commit`.

## 2026-10-03 · Nombre del proyecto: HCD · Historial Clínico Digital · Misael

## 2026-10-03 · Nada médico en la cadena · propuesta de la investigación
En Solana solo van identidad, permisos, hashes, firmas y registro de accesos. Los documentos van cifrados en almacenamiento que se pueda borrar. Ver [arquitectura.md](arquitectura.md).
