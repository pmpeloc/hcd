# Estado · Misael

**Última actualización:** 2026-10-14

## En qué estoy
Deploy de producción: API en Railway, app y landing en Vercel, todo desde `main`. Supabase al día (9 migraciones aplicadas). Arreglo del build de Railway (`railpack.json` fuerza Node).

## Próximo paso
- Redeploy de la API en Railway y cargar las variables de entorno; después la app en Vercel con `NEXT_PUBLIC_API_URL`.
- Arreglar el lint de hcd_api#25 (Franco) para que entre antes del smoke; hcd_api#24 (permisos, Matías) después del deploy.

## Pendientes conocidos (no rompen la demo)
- `records.repository` baja el archivo de hasta 50 MB entero a memoria al registrar (riesgo de OOM con muchos pedidos).
- El indexer solo escucha en vivo: sin backfill, un evento emitido con la API caída se pierde y el estudio queda `pending_chain`.
- Alias `SAL-XXXX` enumerable por un médico verificado (~923k combinaciones, solo frena el throttle).
- La app firma el `tx_base64` que arma la API sin decodificarlo y compararlo con el pedido.
- Carrera al agregar un médico a dos organizaciones; un mismo `issue_record` se puede construir dos veces antes de que el indexer lo active.
- hcd#24 (Archify, Franco) choca con hcd#23 en su bitácora y estado: lo resuelve Franco.

## Bloqueos
Los merges necesitan aprobación desde GitHub (no se pueden hacer desde la sesión del agente).
