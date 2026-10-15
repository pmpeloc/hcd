# Estado · Misael

**Última actualización:** 2026-10-10

## En qué estoy
Integración del MVP: las cadenas de PRs de la API (#22→#21), la app (#7→#13) y docs quedaron sin conflictos y con los bugs del flujo en vivo arreglados (ver bitácora). API 185/185 tests, app 101/101 e2e.

## Próximo paso
- Aprobaciones y merges en orden; después, smoke E2E en vivo contra devnet (enrolar → subir → emitir → grant → liberar → visor → revocar).
- Confirmar que la migración `20261008000000_tx_stores.sql` (#20) esté aplicada en Supabase; Franco aplicó las de #21.

## Pendientes conocidos (no rompen la demo)
- `records.repository` baja el archivo de hasta 50 MB entero a memoria al registrar (riesgo de OOM con muchos pedidos).
- El indexer solo escucha en vivo: sin backfill, un evento emitido con la API caída se pierde y el estudio queda `pending_chain`.
- Alias `SAL-XXXX` enumerable por un médico verificado (~923k combinaciones, solo frena el throttle).
- La app firma el `tx_base64` que arma la API sin decodificarlo y compararlo con el pedido.
- Carrera al agregar un médico a dos organizaciones; un mismo `issue_record` se puede construir dos veces antes de que el indexer lo active.
- hcd#24 (Archify, Franco) choca con hcd#23 en su bitácora y estado: lo resuelve Franco.

## Bloqueos
Los merges necesitan aprobación desde GitHub (no se pueden hacer desde la sesión del agente).
