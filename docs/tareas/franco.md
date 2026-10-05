# Tareas · Franco (líder técnico)

**Rol:** arquitectura, servicio de llaves, cifrado e integración entre programa, backend y app. Coordina y desbloquea al equipo.
**Respaldo:** Matías (servicio de llaves).
**Repos:** `hcd_api` (`src/keys/`, `src/tx/`), `hcd_app` (`lib/crypto/` e integración con la API y la cadena), `hcd` (README, decisiones, hooks).

## Archivos y módulos bajo tu responsabilidad

Para no pisarse con el resto, vos tocas esto y nadie más:

- `hcd_api/src/keys/` — servicio de llaves: envoltura de DEK, endpoint `/keys/release`.
- `hcd_api/src/tx/` — armado, verificación byte a byte y co-firma de transacciones; fee payer y sus límites.
- `hcd_app/lib/crypto/` — AES-256-GCM, SHA-256 y utilidades de cifrado/descifrado en el navegador.
- Integración entre el cliente Codama, la API y la app (junto a Matías en `lib/hcd-client/`).
- `hcd/README.md` (con Rodrigo), `docs/proyecto/decisiones.md`, `.githooks/`.
- Revisión cruzada del programa Anchor de Misael (no escribís el programa, lo revisás).

**No tocar:** `programs/`, `tests/`, `idl/` (Misael); `supabase/`, `src/auth|organizations|records|access|indexer` (Matías); pantallas y componentes de `hcd_app` (Maximiliano: `(paciente)`, `(medico)`, `components/`; Matías: `(auth)`, `(clinica)`, `(admin)`, `lib/api|supabase|privy|schemas|hcd-client`, PWA); `pitch/`, `demo/`, landing (Rodrigo).

## Plan día por día

Calendario: Día 1 = sáb 3/10 → Día 10 = lun 12/10. Puertas de control en [Plan_Completo_Salua.pdf](../proyecto/Plan_Completo_Salua.pdf) sección 6.

### Día 1 · sáb 3/10 (preselección)
- Leer completos los formularios de los pasos 3 y 4 y cerrar las respuestas con el kit de textos.
- Liderar el renombrado a Salua en lo visible: README, descripciones de repos, interfaz del demo.
- Completar tus pasos 1 y 2 (Luma + Arena) como todos.

### Día 2 · dom 4/10 (envío + kickoff) — puerta G1
- Enviar el paso 3 y el paso 4 (preselección) **antes de las 13:00**. Guardar capturas de confirmación.
- Kickoff técnico de 1 hora: congelar cuentas del programa (semillas y campos) y contratos de API (endpoints + esquemas Zod). Decidir si `issue_record` exige la firma de `key_service` para cerrar el hueco de carga (ver riesgos del plan completo).
- Confirmar que Misael tiene el esquema de cuentas y Matías el proyecto de Supabase.

### Día 3 · lun 5/10 (diseño de llaves y tx)
- Diseño del servicio de llaves: flujo de `/keys/release`, envoltura de DEK con KEK por organización (HKDF de la llave maestra), tabla `key_releases`.
- Spec del módulo `tx`: el backend arma la transacción, el usuario firma, el backend verifica byte a byte antes de co-firmar como fee payer.
- Acompañar la **prueba de 1 hora** de Privy + Supabase Auth con wallet de Solana (define si sigue el plan A o el plan B de stack.md).

### Día 4 · mar 6/10 (módulo tx y fee payer)
- Implementar `src/tx/`: armado de transacciones con fee payer propio, verificación byte a byte de la transacción firmada por el usuario, co-firma y envío.
- Rate limit por usuario y organización (`@nestjs/throttler`), presupuesto diario y hot wallet con poco saldo.

### Día 5 · mié 7/10 (cifrado en el navegador) — puerta G3
- `hcd_app/lib/crypto/`: generación de DEK por estudio, AES-256-GCM con IV único, SHA-256 del archivo cifrado.
- Integrar con la subida de Maximiliano: cifrar → subir con URL firmada → enviar DEK al servicio de llaves → firmar `issue_record`.

### Día 6 · jue 8/10 (servicio de llaves v0)
- `src/keys/`: guardar la DEK envuelta (nunca en claro), `/keys/release` que lee el Record y el AccessGrant en Solana y entrega DEK + URL firmada de 60 s solo si corresponde (paciente, emisor o grant vigente).
- Cada entrega llama a `log_access` (keypair `key_service`, distinto del fee payer) y escribe en `key_releases`.
- Generar el cliente Codama desde `hcd_api/idl/` para la API y ayudar a Matías con el de la app.

### Día 7 · vie 9/10 (integración de punta a punta) — puerta G4
- Visor: verificación del hash contra el on-chain antes de descifrar; si no coincide, "Estudio alterado".
- Recorrido completo funcionando de punta a punta, aunque sea feo: carga → aprobación por 1 hora → lectura → bloqueo → vencimiento.

### Día 8 · sáb 10/10 (seguridad y correcciones)
- Seguridad básica: secretos solo en `.env` (revisar que ningún repo exponga claves), permisos mínimos del servicio, límites del fee payer funcionando, alerta de saldo.
- Corregir errores de integración encontrados en el recorrido.

### Día 9 · dom 11/10 (congelamiento) — puerta G5
- Congelamiento de funcionalidades: solo se arreglan errores.
- Despliegue final (API en Railway o Render) y revisión completa.

### Día 10 · lun 12/10 (entrega) — puerta G6
- Revisar y entregar antes de las 20:00 con margen hasta las 23:59.
- Verificar que el README apunte a todo y que los enlaces del formulario funcionen.

## Entregables

1. Spec del servicio de llaves y del módulo tx (documento corto en `docs/` o comentarios de diseño en el código).
2. `hcd_api/src/keys/` funcionando: envoltura de DEK y `/keys/release` con verificación on-chain.
3. `hcd_api/src/tx/` funcionando: armado, verificación byte a byte, co-firma como fee payer, rate limit y presupuesto diario.
4. `hcd_app/lib/crypto/` con AES-256-GCM + SHA-256 usado por la carga y el visor.
5. Recorrido de punta a punta demostrable y video de respaldo.
6. Preselección enviada a tiempo (pasos 3 y 4) con capturas guardadas.

## Criterios de aceptación (Definition of Done)

- `/keys/release` entrega la DEK solo al paciente titular, al médico emisor o a un médico con AccessGrant activo y vigente; niega por defecto y después del vencimiento.
- Cada entrega de llave llama a `log_access` (se verifica en un explorador) y deja fila en `key_releases`.
- El fee payer y la autoridad `key_service` son keypairs distintos; la hot wallet tiene poco saldo y hay rate limit por usuario y organización.
- El backend verifica byte a byte la transacción que firmó el usuario antes de co-firmarla; nunca firma una transacción que armó el cliente.
- El visor no descifra si el hash no coincide con el del Record.
- Funciona en devnet, con test o prueba manual anotada, revisado y mergeado a `main` por PR.
- Ningún secreto en el repo; `.env.example` solo con nombres.

## Dependencias

- El IDL de Misael (publicado el lunes 5 a la noche) habilita el cliente Codama de `tx` y `keys`.
- Las tablas y RLS de Matías habilitan `key_releases` y las lecturas por request.
- El programa desplegado en devnet habilita la verificación on-chain de `/keys/release`.
