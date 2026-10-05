# Estado · Misael

**Última actualización:** 2026-10-05

## En qué estoy
Programa completo (9 instrucciones, 43 tests) desplegado en devnet (`8FNP6rs3DQ4h6bqWNeD9meHt5mUNEhcaXbrbJxSJniyd`), con el IDL on-chain igual a `idl/hcd.json`. `main` y `staging` protegidas en los 4 repos.

## Próximo paso
- `initialize_config` en devnet: admin = mi wallet de autoridad, `key_service` = pubkey que me pase Franco, duración máxima de permisos a definir.
- Tests negativos contra devnet (puerta G3).

## Bloqueos
- Para `initialize_config` necesito la pubkey de `key_service` (Franco). Una vez creado, la Config no se puede cambiar sin una instrucción nueva.
