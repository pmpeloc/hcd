# Arquitectura

> Actualizada el 2026-10-03 con el [plan v1](plan.md) y las [decisiones aceptadas](decisiones.md). El detalle completo (cuentas, instrucciones, endpoints, tablas) está en [plan.md](plan.md).
>
> 📊 Diagrama visual (diapositiva 5) y flujo (diapositiva 6) en la [presentación](https://claude.ai/artifact/KoaaYCW2DJJAyeZpHPSB5S), actualizadas el 2026-10-03 con las decisiones de Franco. Si algo no coincide, manda este archivo.

## Principio de diseño

**Nada médico en la cadena, ni siquiera cifrado.**

- La Ley 25.326 trata la salud como dato sensible, con derecho a rectificar y suprimir. Una cadena no borra.
- Un cifrado de hoy puede romperse en 20 años, y lo publicado en la cadena queda para siempre.
- En la cadena va solo lo que prueba algo: identidad, permisos, hashes, firmas y registro de accesos.

## Capas

| Capa | Componente | Responsabilidad |
|---|---|---|
| Usuarios | Paciente · Médico · Clínica | PWA · web (carga y lectura) · panel web (avala médicos) |
| Aplicación | Frontend Next.js (PWA) + Privy | Login y wallet embebida. Cifra y descifra en el navegador (WebCrypto). Escaneo de QR. |
| Servicios | API Node.js (Express + Sequelize) | Lógica de la SaaS. Arma las transacciones y co-firma como fee payer. |
| Servicios | Servicio de llaves | Entrega la DEK solo al paciente, al médico emisor o a un médico con permiso vigente. Keypair `key_service` propio. |
| Servicios | Indexer de eventos | Escucha el programa y guarda la línea de tiempo en Postgres |
| Datos | PostgreSQL (Supabase, con RLS) | Usuarios, organizaciones y metadatos. Nunca datos médicos en claro. |
| Datos | Almacenamiento (Supabase Storage o R2) | Solo archivos cifrados. Borrable. |
| Datos | Solana devnet · programa Anchor | Perfiles, prestadores, Records (hash, emisor, estado), permisos y auditoría |

## Quién hace qué

| Acción | Quién |
|---|---|
| Cargar un estudio | **Solo el médico verificado**, con su wallet |
| Editar un estudio | **Nadie.** No existe esa instrucción. |
| Marcar "no es mío" | El paciente (`dispute_record`) |
| Anular un estudio | El médico emisor (`void_record`), y lo reemite |
| Dar o revocar acceso | El paciente |
| Leer un estudio | El paciente, el médico emisor, o un médico con permiso vigente |
| Avalar médicos de una organización | La clínica |
| Verificar médicos y clínicas | El admin (en el MVP, el equipo) |

## Estados de un estudio (Record)

```
Active ──(paciente: "no es mío")──▶ Disputed ──(emisor anula)──▶ Voided
```

Active desde que se carga. Solo un Record Active puede compartirse con `grant_access`.

## Cifrado y vencimiento real del acceso

Una vez que el médico descifró un estudio, ya lo tiene. El vencimiento en la cadena solo controla las **próximas** entregas de llaves. Por eso:

1. Cada estudio se cifra con su propia llave (DEK).
2. El servicio de llaves guarda la DEK envuelta con una llave de la organización.
3. Antes de entregarla, revisa el permiso en la cadena. Cada entrega queda registrada con `log_access`.
4. El visor recalcula el SHA-256 del archivo cifrado y lo compara con el `content_hash` on-chain. Si no coincide, muestra "Estudio alterado" y no descifra.

Borrado: destruir la DEK envuelta y borrar el archivo ("borrado criptográfico").

## Quién paga la red

- Paciente y médico **nunca necesitan SOL**. El backend es fee payer y el costo lo absorbe el cliente B2B.
- El backend arma la transacción, el usuario firma y el backend verifica byte a byte antes de co-firmar.
- Rate limit por usuario y organización, presupuesto diario, hot wallet con poco saldo y alerta.
- Fee payer y `key_service` son keypairs distintos: robar el primero cuesta SOL; robar el segundo permitiría falsificar la auditoría.
- Si se cierran cuentas, el rent vuelve al sponsor (`close = rent_payer`).
- Costos verificados: ver [investigacion.md](investigacion.md#costos-on-chain-verificados).

## Qué garantiza y qué no

- **Garantiza:** quién emitió cada estudio, cuándo (reloj de la red) y que nadie lo alteró después.
- **No garantiza:** que el contenido sea verdadero. Un médico verificado puede cargar un estudio falso desde el origen.
- La firma de wallet no es firma digital legal (Ley 25.506): ver [investigacion.md](investigacion.md#marco-legal-en-argentina).

## Flujo de uso

1. **Alta:** el paciente entra con email o Google vía Privy; se crea su perfil en Solana.
2. **Carga:** el médico escanea el QR del paciente presente, el estudio se cifra en el navegador, va al almacenamiento y el médico firma `issue_record`.
3. **Revisión:** el paciente recibe la notificación; si no es suyo, lo marca y el médico lo anula.
4. **Pedido de acceso:** otro médico pide acceso con el código del paciente (off-chain).
5. **Permiso:** el paciente aprueba y elige la duración; se crea el permiso en Solana.
6. **Acceso:** el servicio de llaves verifica el permiso, entrega la llave y registra el acceso; el visor verifica el hash y muestra el estudio.
7. **Vencimiento:** pasado el plazo no se entregan más llaves; el acceso queda registrado.
