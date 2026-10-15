# Ideas · Misael

La más nueva arriba.

## 2026-10-05 · Cada `log_access` del servicio de llaves tiene que ser una transacción única
En los tests contra devnet, dos `log_access` seguidos del mismo permiso dejaron **una sola** transacción en la cadena y `access_count` sumó 1 en vez de 2, aunque las dos llamadas devolvieron éxito. Las dos transacciones son idénticas (mismo firmante, cuentas y datos); si toman el mismo blockhash, tienen la misma firma y la red descarta la segunda. Si el servicio de llaves entrega la misma DEK dos veces seguidas, la auditoría subcuenta.
- **Propuesta para Franco (`src/keys`, `src/tx`):** agregar a cada `log_access` una instrucción Memo con el id de la fila de `key_releases`. Hace única cada transacción y además enlaza el registro on-chain con la base de datos. Alternativa mínima: una instrucción de compute budget distinta en cada llamada (es lo que hacen los tests).
- No cambia el programa ni el IDL.
- **Aceptada por Franco el 2026-10-06:** cada `log_access` llevará `Memo(<key_releases.id>)` cuando se implemente `src/keys`. Registrado en [decisiones.md](../../proyecto/decisiones.md).

## 2026-10-03 · Caso Pepito: médico cómplice que carga un estudio falso
Pepito es adicto y un amigo médico sube una radiografía falsa de una pierna rota para que le receten analgésicos. HCD no puede impedirlo (tampoco el papel), pero puede dejar al médico identificado y alertar a quien lee. El "no es mío" no sirve porque Pepito es cómplice.
- **MVP (aceptado):** el visor muestra el origen ("emitido por el centro" o "copia digitalizada por el médico") y los datos completos del emisor (nombre, matrícula, especialidad, fecha on-chain, transacción).
- **Próxima etapa:** alerta cuando el que carga es el mismo que consulta o receta; suspender prestadores con advertencia "emisor suspendido" en todos sus estudios; exportar la auditoría como evidencia para el colegio médico; centros de imágenes como emisores directos; detección de patrones.
- Límite: la receta y la dispensa de controlados las deciden el médico y la farmacia, no HCD.
Registrado en [decisiones.md](../../proyecto/decisiones.md) y en la [hoja de ruta](../../proyecto/plan.md#15-hoja-de-ruta-después-del-mvp).

## 2026-10-03 · Diferenciarnos de los precedentes
Ya hay al menos 25 proyectos de historia clínica en hackatones de Colosseum y ninguno ganó. Propuestas:
- Construir el servicio de llaves que hace que el acceso venza de verdad.
- Empezar por un solo cliente (una prepaga u obra social) con el caso de estudios duplicados.
- Mostrar interoperabilidad con HL7 FHIR.

## 2026-10-03 · Validar quién paga
Antes de sumar funcionalidades, hablar con una prepaga u obra social para ver si pagaría por evitar estudios duplicados.
