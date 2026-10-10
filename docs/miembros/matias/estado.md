# Estado · Matías

**Última actualización:** 2026-10-08

## En qué estoy
Primera entrega de records en feat/records-storage: carga cifrada, reserva autorizada por código temporal, DEK envuelta e IV, listado RLS y estado pending_chain. Contrato compartido en app feat/records-contract. Plan por entregas en [plan-integracion.md](plan-integracion.md).

## Validación
Migración de IV/pending_chain probada en PostgreSQL 18 local con datos sintéticos, rollback y servidor detenido; no aplicada a Supabase. Suite API de 70 pruebas aprobada. Ver PRs para comprobaciones finales de compilación y lint.

## Próximo paso
Revisión con Franco del contrato records → tx: hoy se devuelve build_request, no transacción armada. Antes de cofirmar debe comprobarse el registro autorizado persistido. Luego enrolamiento seguro de wallet y firma Privy; después access/indexer y E2E, sin implementar todo junto.

## Bloqueos y límites
Esta entrega no emite en Solana ni completa el visor. Necesita revisión, migración IV, secreto de tokens y bucket privado con límite de tamaño; el binding inicial de #19 requiere prueba de propiedad de wallet. Coordinar IV con Maxi y servicio de llaves de Franco. tx_stores ya fue aplicada a Supabase en el trabajo anterior (docs #25), y el cliente Bearer está en app #7. Ninguna de estas tareas equivale al smoke E2E real.
