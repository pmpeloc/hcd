# Relevamiento: Fees de red, wallet (Privy vs Cavos), antifalsificación y roles en HCD

## Metadatos
- Autor: Franco
- Cargado por: Misael (2026-10-03), a partir de la exportación de la conversación de Franco
- Fecha de la conversación: 2026-10-03
- Herramienta: Claude Desktop (fuera del repo)

## Notas de integración (Misael, 2026-10-03)

> ✅ **2026-10-03: el equipo aceptó todas las "Decisiones sugeridas".** Están en [decisiones.md](../../../proyecto/decisiones.md) y aplicadas en [plan.md](../../../proyecto/plan.md) y [arquitectura.md](../../../proyecto/arquitectura.md). Las cifras se verificaron: ver la sección [Datos verificados](#datos-verificados-2026-10-03) al final.

Cruce con lo que ya estaba en `docs/` antes de la decisión.

**Chocaba con lo que ya teníamos (resuelto a favor de esta propuesta):**
1. **Quién carga estudios.** Franco propone que solo los médicos carguen estudios y que el paciente nunca escriba. En [arquitectura.md](../../../proyecto/arquitectura.md) el paso 2 del flujo dice que carga "la clínica". La propuesta de carga inicial de Misael (médico de cabecera que certifica los papeles) encaja, pero su "nivel C · cargado por el paciente" quedaría descartado.
2. **Aprobación del paciente.** Antes estaba previsto que el paciente co-firmara cada estudio (como CareChain). Franco propone que el estudio quede Active al cargarse y que el paciente solo pueda marcarlo como "no es mío" (Disputed → Voided).
3. **Rol de la clínica.** Franco propone que la clínica no cargue estudios y quede, como mucho, avalando qué médicos le pertenecen.

**Suma a lo que teníamos (no choca):**
- El fee payer del backend y quién paga el rent: el modelo B2B ya decía que paga la clínica o la aseguradora.
- Que el visor verifique el hash antes de descifrar: completa el principio "en la cadena va lo que prueba algo".
- Que el fee payer y la autoridad `key_service` sean keypairs distintos.

**El "plan en PDF"** del que partió Franco ya está en el repo: [plan-v1.pdf](../../../proyecto/plan-v1.pdf), resumido en [plan.md](../../../proyecto/plan.md).

**Pregunta resuelta:** "Dónde se crea el repo". Ya existe: https://github.com/pmpeloc/hcd

---

## Preguntas que se hicieron
1. A partir del plan en PDF y del contexto del proyecto, ¿cómo seguimos y cuál es el próximo paso técnico?
2. ¿Quién paga las comisiones de red (sección de la página 5 del PDF)? Profundizar para defenderlo frente al jurado y a nivel arquitectura.
3. ¿Qué beneficios tiene usar Cavos en vez de Privy?
4. ¿Está contemplado evitar la falsificación de estudios médicos?
5. Requisito: la subida y carga de datos la hace solo el médico; el paciente no puede modificar, solo leer. ¿Cómo impacta en el diseño?
6. Pregunta de diseño: ¿el paciente sigue aprobando y revocando qué médico lee sus estudios?
7. Pregunta de diseño: ¿el paciente puede aceptar o rechazar un estudio nuevo ("este estudio no es mío")?

## Conclusiones
- **Conclusión:** En la máquina del autor hay Node v24 y git, pero no pnpm, Rust, Solana CLI, Anchor ni WSL. Anchor en Windows en la práctica requiere WSL, así que es un bloqueo para empezar el programa.
  - **Respaldo:** comprobado ejecutando comandos en la máquina. Lo de Anchor en Windows es opinión/razonamiento de Claude, sin fuente.
  - **Tema:** tecnología
- **Conclusión:** Conviene empezar por el programa Anchor y no por el monorepo, porque el cliente (Codama), el servicio de llaves y el indexer dependen de su IDL, y el plan exige deploy en devnet el día 4. Solana Playground sirve para avanzar mientras se instala el toolchain local.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** tecnología
- **Conclusión:** En Solana hay dos costos: el fee por firma (casi nada) y el rent o depósito de las cuentas nuevas (el costo real, recuperable al cerrar la cuenta). En HCD, la mayor parte del costo es rent de Record y AccessGrant.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente. Las cifras están en "Datos sin verificar".
  - **Tema:** arquitectura
- **Conclusión:** Paciente y médico nunca necesitan SOL. Paga el cliente B2B (prepaga, obra social o clínica) dentro de la suscripción, y el backend registra los lamports gastados por organización.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** negocio
- **Conclusión:** En el programa, el `payer` de las cuentas nuevas es un signer separado del paciente o autoridad. Así el paciente puede pagar sus propias transacciones si el backend cae: el backend paga, pero no autoriza nada.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** Si se cierran cuentas, el rent tiene que volver al sponsor y no al usuario (guardar `rent_payer` y usar `close = rent_payer`). Si no, se puede vaciar al fee payer creando y cerrando cuentas en loop. Privy advierte este ataque con las ATAs.
  - **Respaldo:** fuente verificada para el ataque con ATAs (https://docs.privy.io/wallets/gas-and-asset-management/gas/solana). La aplicación a HCD es razonamiento de Claude.
  - **Tema:** arquitectura
- **Conclusión:** El backend debería armar él mismo las transacciones según la acción pedida: las arma con `feePayer = backend`, el usuario firma y el backend comprueba byte a byte que sea la misma antes de co-firmar. Además: rate limit por usuario y organización, presupuesto diario, hot wallet con poco saldo y alerta de saldo bajo.
  - **Respaldo:** la co-firma por backend y el rate limit los recomienda Privy (https://docs.privy.io/wallets/gas-and-asset-management/gas/solana). Armar la tx en el servidor es opinión de Claude.
  - **Tema:** arquitectura
- **Conclusión:** El fee payer y la autoridad `key_service` (la que firma `log_access`) deben ser keypairs distintos. Robar el primero cuesta SOL; robar el segundo permite falsificar auditoría.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** Privy tiene sponsorship de gas en Solana de dos formas: un fee payer propio que financia la app, y una opción nativa vía Grid de Squads (`sponsor: true`). No se confirmó que la nativa funcione con programas propios ni en devnet.
  - **Respaldo:** fuente verificada (https://docs.privy.io/wallets/gas-and-asset-management/gas/solana, https://privy.io/blog/introducing-privy-native-gas-sponsorship, https://squads.xyz/blog/privy-enables-gasless-transactions-on-solana-powered-by-grid).
  - **Tema:** tecnología
- **Conclusión:** Cavos soporta Solana, Starknet y Stellar. Se presenta como no custodial ("never hold user keys"), incluye sponsorship y pago de fees en USDC, es gratis hasta 1.000 wallets y después cobra una tarifa plana por organización, sin cobro por usuario activo. En web, las llaves viven en un iframe de Cavos.
  - **Respaldo:** fuente verificada (https://github.com/cavos-labs/kit, https://cavos.xyz/).
  - **Tema:** tecnología
- **Conclusión:** Para el MVP conviene seguir con Privy. El riesgo de Cavos es que su ejemplo muestra `wallet.execute(amount, dest)`, orientado a transferencias, y no se confirmó que firme instrucciones Anchor arbitrarias con un fee payer externo. Con fee payer propio, el sponsorship integrado de Cavos no suma.
  - **Respaldo:** el ejemplo de `execute` sale de la fuente (https://github.com/cavos-labs/kit). La recomendación es opinión de Claude.
  - **Tema:** tecnología
- **Conclusión:** El diseño ya evita que alguien que no es prestador cargue estudios, que se altere el archivo después de cargado (hash on-chain + AES-GCM), la suplantación del emisor, el cambio de fecha (Clock on-chain) y que se niegue la emisión.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** Falta que el visor verifique el hash: debe comparar SHA-256 del archivo cifrado contra el `content_hash` on-chain antes de descifrar. Sin eso, el hash no protege nada.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** Ni el diseño ni la blockchain pueden evitar que un prestador verificado cargue un estudio falso desde el origen. Lo que sí garantizan es quién lo emitió, cuándo, y que nadie lo tocó después.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** producto
- **Conclusión:** Solo el médico (Provider tipo médico verificado, con matrícula) carga estudios, cada uno firmado con su propia wallet. Se elimina el rol "personal de clínica que carga". No existe ninguna instrucción que modifique un Record, y esa ausencia es la garantía de que el paciente no puede editar.
  - **Respaldo:** requisito del autor. El diseño es razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** Los estados del Record pasan a Active (visible al cargarse) → Disputed (el paciente marca "no es mío" con `dispute_record`) → Voided (el emisor lo anula con `void_record` y lo vuelve a emitir). Reemplazan Pending/Accepted/Rejected. `grant_access` exige estado Active.
  - **Respaldo:** elegido por el autor en la conversación. El diseño es razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** El servicio de llaves entrega la DEK solo a tres personas: el paciente titular, el médico emisor, o un médico con AccessGrant activo y vigente. A cualquier otro le niega por defecto.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente.
  - **Tema:** arquitectura
- **Conclusión:** Una firma de wallet no es firma digital legal. La protección legal real contra falsificaciones es la firma digital del profesional en el PDF.
  - **Respaldo:** opinión/razonamiento de Claude, sin fuente (validar con un abogado).
  - **Tema:** legal

## Ideas y propuestas
- Escena de demo: modificar un byte del archivo en el storage y mostrar que el visor lo detecta como "Estudio alterado".
- Mostrar en el visor el emisor, el profesional, la fecha on-chain y el link a la transacción en el explorador.
- Página de "verificar estudio" para copias que circulan por fuera, con un compromiso del archivo en claro (SHA-256(sal ‖ PDF), con la sal guardada junto a la DEK). Para la hoja de ruta.
- Campo `supersedes` en Record para dejar explícitas las correcciones.
- Multisig con Squads para la clave admin, y conexión con el registro de matrículas (REFEPS/SISA).
- Validar la firma digital del PDF (PAdES) al cargarlo. Para la hoja de ruta.
- Prueba de 1 hora con Cavos: firmar una instrucción Anchor propia en devnet con fee payer externo.
- Cerrar los AccessGrant vencidos para recuperar rent.
- Cobrarle a cada organización los lamports que consumió.
- Usar Solana Playground mientras se instala WSL y el toolchain local.
- Frases para el pitch: "El costo on-chain por paciente por año es menor a un café" y "No certificamos que el contenido sea verdadero; certificamos quién lo emitió, cuándo, y que nadie lo tocó después".
- La clínica puede quedar como entidad que avala la pertenencia de un médico, sin cargar estudios.

## Decisiones sugeridas
Son sugerencias de la conversación, no decisiones del equipo. Los puntos marcados como "(elegido por el autor)" los eligió Franco, pero falta validarlos con el equipo.
- Empezar por el programa Anchor y no por el monorepo.
- Usar fee payer propio en el backend, con transacciones armadas por el servidor, en lugar del sponsorship nativo de Privy para el MVP.
- Fee payer y autoridad `key_service` con keypairs separados.
- Payer separado del firmante, para que el paciente pueda pagarse sus propias transacciones.
- Que el rent de las cuentas cerradas vuelva al sponsor.
- Privy en vez de Cavos para el MVP.
- Que el visor verifique el hash antes de descifrar.
- Solo el médico carga estudios, cada uno con su wallet; el paciente no modifica (elegido por el autor).
- El paciente sigue aprobando y revocando accesos (elegido por el autor).
- El paciente solo puede marcar "no es mío"; estados Active/Disputed/Voided (elegido por el autor).
- El médico emisor puede releer sus estudios sin permiso.

## Preguntas abiertas
- ¿El sponsorship nativo de Privy (Grid) funciona con un programa Anchor propio y en devnet? Probarlo.
- ¿Cavos firma instrucciones Anchor arbitrarias y acepta un fee payer externo? Probarlo.
- Tamaño real de las cuentas y su rent. Confirmarlo con `solana rent <bytes>` cuando exista el código.
- Cerrar los AccessGrant para recuperar rent choca con conservarlos para auditoría (`access_count` es la fuente de verdad). Falta decidir.
- Si un médico trabaja en varias organizaciones, ¿cómo se registra la organización del Record?
- ¿Se mantiene algún rol para la clínica (avalar médicos) o se elimina del todo?
- Validez legal de la firma de wallet frente a la firma digital, y requisitos de la Ley 25.506 y la Ley 27.706. Validar con un abogado.
- Quién paga primero, la clínica o la aseguradora. Validar con clientes.
- ~~Dónde se crea el repo~~ (resuelto: https://github.com/pmpeloc/hcd). Quién instala WSL y el toolchain.

## Fuentes
- https://github.com/cavos-labs/kit — SDK de Cavos: wallets embebidas para Solana, Starknet y Stellar. En Solana usa cuentas Ed25519 nativas, tiene modos de fee (la cuenta paga, sponsored o en USDC), soporta devnet y en web guarda las llaves en un iframe de Cavos.
- https://cavos.xyz/ — Sitio de Cavos: multichain, no custodial, gratis hasta 1.000 wallets, tarifa plana por organización, sponsorship de gas.
- https://docs.privy.io/wallets/gas-and-asset-management/gas/solana — Cómo sponsorear transacciones en Solana con Privy usando un fee payer propio y co-firma en el backend. Advierte el ataque de vaciado con ATAs y recomienda rate limit.
- https://privy.io/blog/introducing-privy-native-gas-sponsorship — Anuncio del sponsorship nativo de gas en Privy.
- https://squads.xyz/blog/privy-enables-gasless-transactions-on-solana-powered-by-grid — Privy habilita transacciones sin gas en Solana con Grid de Squads.

## Datos verificados (2026-10-03)

Verificados por Misael el 2026-10-03. Detalle y tabla de costos en [investigacion.md](../../../proyecto/investigacion.md#costos-on-chain-verificados).

| Dato original | Resultado | Cómo se verificó |
|---|---|---|
| Fee de 5.000 lamports por firma | ✅ **Correcto** | [Documentación de fees de Solana](https://solana.com/docs/core/fees) |
| Rent: (128 + bytes) × 6.960 lamports | ❌ **Desactualizado.** La red hoy cobra (128 + bytes) × **5.080** lamports. La documentación todavía dice 6.960. | Consulta `getMinimumBalanceForRentExemption` a mainnet y devnet |
| PatientProfile ~49 bytes / ~0,0012 SOL | ⚠️ Con el esqueleto del plan son **57 bytes / 0,00094 SOL** | Cálculo desde el plan + consulta a la red |
| Provider ~75 bytes / ~0,0014 SOL | ✅ 75 bytes; ❌ el depósito real es **0,00103 SOL** | Ídem |
| Record ~154 bytes / ~0,0020 SOL | ✅ 154 bytes (plan v1); ❌ el depósito real es **0,00143 SOL**. Con `rent_payer` + `supersedes`: 219 bytes / 0,00176 SOL | Ídem |
| AccessGrant ~90 bytes / ~0,0015 SOL | ❌ **Son 118 bytes** (3 Pubkey + i64 + estado + u32 + bump + discriminador) / 0,00125 SOL. Con `rent_payer`: 150 bytes / 0,00141 SOL | Ídem |
| ~0,05 SOL por paciente por año, ~0,03 recuperables | ⚠️ **0,041 SOL (plan v1) o 0,0475 SOL (con campos propuestos).** De eso, solo 0,00071 SOL son comisiones; el resto son depósitos, recuperables solo si se cierran las cuentas (el plan no las cierra, por auditoría) | Cálculo con valores de la red |
| Precio de SOL USD 150 | ❌ Era un supuesto. **USD 119,80** el 2026-10-03 | CoinGecko |
| "Menos que un café por paciente por año" | ⚠️ **Solo vale para las comisiones** (≈ USD 0,09). Con depósitos son USD 5 a 6 | Cálculo anterior |
| Stripe compró Privy en 2025 | ✅ **Correcto**, junio de 2025; Privy sigue como producto independiente | [SiliconANGLE](https://siliconangle.com/2025/06/11/stripe-acquires-crypto-wallet-infrastructure-provider-privy/) |
| Anchor en Windows requiere WSL | ✅ **Correcto**: la guía oficial lo exige | [Guía de instalación de Anchor](https://www.anchor-lang.com/docs/installation) |
| Cavos: P-256 en el sitio vs Ed25519 en el README | ✅ **Resuelto**: en Solana usa Ed25519 derivado de una MasterDEK; el P-256 del sitio se refiere a llaves de dispositivo | [README de Cavos](https://github.com/cavos-labs/kit) y [sitio](https://cavos.xyz/) |
| Riesgo: Cavos solo muestra `execute(amount, dest)` | ⚠️ **Corregido**: el SDK también tiene `executeInstructions(instructions)` para instrucciones arbitrarias. Sigue sin confirmarse el fee payer externo. No cambia la decisión de usar Privy | [README de Cavos](https://github.com/cavos-labs/kit) |
| Clientes de Cavos: Jokers of Neon y CofiBlocks | ✅ Los nombra su sitio | [cavos.xyz](https://cavos.xyz/) |
| PAdES como formato de firma de PDF | ✅ Estándar ETSI EN 319 142 | [PAdES](https://en.wikipedia.org/wiki/PAdES) |
| Ley 25.506 (firma digital) | ✅ Solo es firma digital con certificado de un certificador licenciado. Una firma de wallet es firma electrónica | [InfoLEG](https://servicios.infoleg.gob.ar/infolegInternet/anexos/80000-84999/80733/texact.htm), [Identik](https://identik.me/blog/firma-digital-vs-electronica/) |
| Leyes 25.326, 26.529 y 27.706 | ✅ Verificadas | [investigacion.md](../../../proyecto/investigacion.md#marco-legal-en-argentina) |
| REFEPS/SISA como registro de matrículas | ✅ Verificado | [SISA](https://sisa.msal.gov.ar/sisadoc/docs/050102/refeps_intro.jsp) |
| Cierre 13/10/2026 06:59 UTC | ✅ Verificado | Hub de recursos de Colosseum |
| 248 proyectos de salud, 6 reconocidos; más de 25 de historia clínica sin premio | ✅ Verificado | Datos de Colosseum Copilot |

**Sigue sin verificar:**
- Que instalar WSL, Rust, Solana y Anchor lleve entre 1 y 2 horas. Es una estimación; depende de la máquina y la conexión.
- Los tamaños finales de las cuentas: reconfirmar con `solana rent <bytes>` cuando exista el código.
