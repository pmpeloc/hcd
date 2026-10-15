---
name: review
description: Revisa el diff antes de commitear o abrir un PR en Salua/HCD, buscando bugs, fallas de seguridad (sobre todo cripto y permisos) y problemas de estilo. Usar antes de cada commit grande o PR.
---

# review

Revisá el diff actual (`git diff` o `git diff main...HEAD`) y reportá en este orden de prioridad.

## 1. Seguridad (bloqueante)
- Llaves privadas, seeds, tokens o `.env` en el diff o en logs.
- Datos clínicos en texto plano: todo dato de salud debe cifrarse del lado cliente antes de salir; en la blockchain/DB solo hash o ciphertext.
- Cripto casera: se usan solo primitivas estándar (libsodium / WebCrypto), nonces únicos, nada de reutilizar IV.
- Verificación de hash antes de entregar un historial; manejo de fallo si no coincide.
- Control de acceso: el médico solo lee con aprobación vigente del paciente; el paciente puede revocar; solo médico verificado carga estudios.
- Estados de Record (Active / Disputed / Voided) respetados en cada transición.
- En Anchor: validar signers, owners de cuentas, seeds de PDA, y overflow.

## 2. Bugs
Errores de lógica, casos borde (aprobación vencida, historial vacío, DNI duplicado), promesas sin await, manejo de errores ausente.

## 3. Estilo y mantenimiento
Nombres, duplicación, tipos TypeScript flojos (`any`), funciones demasiado largas, tests faltantes para lo nuevo.

## Formato de salida
Lista corta: `[BLOQUEANTE] / [IMPORTANTE] / [MENOR]` + archivo:línea + qué pasa + cómo arreglarlo. Si no hay problemas, decilo en una línea. No reescribas código salvo que se pida.
