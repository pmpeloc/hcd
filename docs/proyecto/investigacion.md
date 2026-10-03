# Investigación (2026-10-03)

Hecha con Colosseum Copilot, documentación oficial y búsqueda web. Presentación: https://claude.ai/artifact/KoaaYCW2DJJAyeZpHPSB5S

## Herramientas recomendadas

Todas figuran en el [hub oficial de recursos de Colosseum](https://colosseum.com/worldsfair/resources?track=solana).

| Necesidad | Herramienta | Por qué |
|---|---|---|
| Programa en la cadena | [Anchor](https://www.anchor-lang.com/docs) | Cuentas para paciente, prestador, permiso y estudio |
| Clientes tipados | [Codama](https://github.com/codama-idl/codama) | Genera el cliente TypeScript desde el IDL de Anchor |
| Entrar sin Phantom | [Privy](https://docs.privy.io/basics/react/quickstart) | Email o Google; el médico no instala nada |
| Permisos y recuperación | [Swig](https://build.onswig.com/) | Si el paciente pierde la llave, pierde su historia |
| Usar datos cifrados | [Arcium](https://docs.arcium.com/developers) | Según su documentación, está en mainnet |
| App móvil | [Solana Mobile](https://docs.solanamobile.com/) | Solo para Android nativo; si no, PWA con cámara |

## Lo que no conviene

- **Token Extensions:** casi no aplican. `NonTransferable` podría ser la credencial del médico, pero un registro en Anchor es más simple. Las transferencias confidenciales ocultan montos, no documentos.
- **cNFTs:** no para estudios: el contenido es público y no necesitamos algo transferible.
- **Arweave / Irys:** el almacenamiento permanente choca con el derecho a suprimir datos de salud.

## Precedentes en Colosseum

- 248 proyectos en "Salud, fitness y hábitos" en 5 hackatones (Frontier 74, Breakout 51, Cypherpunk 49, Radar 48, Renaissance 26). Solo 6 recibieron premio o mención, y **ninguno era una historia clínica** (datos de Colosseum Copilot, categoría principal).
- Mismo flujo que el nuestro, sin premio:
  - [LuminaCare](https://colosseum.com/projects/explore/luminacare): permisos con vencimiento, QR y Privy.
  - [CareChain](https://colosseum.com/projects/explore/carechain): la mejor referencia de arquitectura. Repo: https://github.com/Yosxxx/carechain-portal
  - [BioVault](https://colosseum.com/projects/explore/biovault) y [Panarogya](https://colosseum.com/projects/explore/panarogya).
- Ganadores cercanos para estudiar:
  - [Chakra Drive](https://colosseum.com/projects/explore/chakra-drive): Irys + Lit.
  - [Humanship ID](https://colosseum.com/projects/explore/humanship-id): identidad con cNFT.
  - [CHRO+](https://colosseum.com/projects/explore/chro+): datos de salud de wearables.
  - [Encifher](https://colosseum.com/projects/explore/encifher): TEE y llaves distribuidas.

## Cómo diferenciarnos

1. **Vencimiento real del acceso:** el servicio de llaves que ningún precedente construyó.
2. **Un solo cliente primero:** una prepaga u obra social evitando estudios duplicados, no "todas las clínicas".
3. **Interoperabilidad:** mostrar el estándar HL7 FHIR.

## Marco legal en Argentina

- **Ley 26.529:** el paciente es titular de su historia clínica.
- **Ley 25.326:** la salud es dato sensible; hay derecho a rectificar y suprimir.
- **Ley 27.706:** historia clínica digital única, con firma digital del profesional responsable.
- **Ley 25.506 (firma digital):** solo es "firma digital" la que usa un certificado emitido por un certificador licenciado; tiene presunción de autoría e integridad. Todo lo demás es "firma electrónica": vale, pero en un juicio quien la presenta tiene que probarla. **Una firma de wallet Solana es firma electrónica, no digital.** Igual conviene validarlo con un abogado.
- **Ley 26.529, art. 14:** el paciente puede pedir copia autenticada de su historia clínica y el centro tiene 48 horas para entregarla.
- **Matrículas:** REFEPS (Red Federal de Registros de Profesionales de la Salud) se consulta en [SISA](https://sisa.msal.gov.ar/sisadoc/docs/050102/refeps_intro.jsp) por matrícula, DNI o nombre.
- **PAdES:** estándar europeo de firmas avanzadas en PDF ([ETSI EN 319 142](https://en.wikipedia.org/wiki/PAdES)). Sirve para validar la firma digital de un PDF al cargarlo (hoja de ruta).

Fuentes: [Abeledo Gottheil](https://abeledogottheil.com.ar/comentarios-a-la-ley-27-706-unificacion-de-historias-clinicas-electronicas-en-argentina/) · [Beccar Varela](https://beccarvarela.com/novedades/ley-n27-706-historia-clinica-digital/) · [Derecho Fácil, mi historia clínica](https://www.argentina.gob.ar/justicia/derechofacil/aplicalaley/mi-historia-clinica) · [Ley 25.506 en InfoLEG](https://servicios.infoleg.gob.ar/infolegInternet/anexos/80000-84999/80733/texact.htm) · [Firma digital vs. electrónica](https://identik.me/blog/firma-digital-vs-electronica/)

## Costos on-chain verificados

Verificado el 2026-10-03 consultando la red con `getMinimumBalanceForRentExemption` (mainnet y devnet devuelven lo mismo) y la [documentación de fees de Solana](https://solana.com/docs/core/fees).

- **Fee por firma:** 5.000 lamports.
- **Depósito (rent) por cuenta:** hoy la red cobra **(128 + bytes) × 5.080 lamports**. La [documentación de cuentas](https://solana.com/docs/core/accounts) todavía dice 3.480 × 2 = 6.960 lamports por byte, pero la red real cobra menos: usar `solana rent <bytes>` o el RPC, no la fórmula vieja.
- **El depósito no es un gasto:** vuelve al cerrar la cuenta (Anchor `close = destino` envía los lamports al destino). Pero el plan **no cierra** los AccessGrant ni los Records, para conservar la auditoría, así que en la práctica queda inmovilizado.

| Cuenta | Bytes (con discriminador de 8) | Depósito |
|---|---|---|
| PatientProfile | 57 | 939.800 lamports (0,00094 SOL) |
| Provider | 75 | 1.031.240 (0,00103 SOL) |
| Record (plan v1) | 154 | 1.432.560 (0,00143 SOL) |
| Record + `rent_payer` + `supersedes` | 219 | 1.762.760 (0,00176 SOL) |
| AccessGrant (plan v1) | 118 | 1.249.680 (0,00125 SOL) |
| AccessGrant + `rent_payer` | 150 | 1.412.240 (0,00141 SOL) |

**Por paciente por año** (escenario: 10 estudios, 20 permisos, 40 accesos; cada transacción con 2 firmas, fee payer + usuario):

| | Plan v1 | Con los campos propuestos |
|---|---|---|
| Comisiones (gasto real) | 0,00071 SOL ≈ **USD 0,09** | igual |
| Depósitos (inmovilizados, recuperables al cerrar) | 0,0403 SOL ≈ USD 4,82 | 0,0468 SOL ≈ USD 5,61 |
| Total | 0,0410 SOL ≈ USD 4,91 | 0,0475 SOL ≈ USD 5,69 |

Precio de SOL: USD 119,80 según CoinGecko el 2026-10-03. Los bytes salen del esqueleto de cuentas del plan; hay que reconfirmarlos con el código real.

**Para el pitch:** "Las comisiones de red cuestan menos de 10 centavos de dólar por paciente por año" es correcto. Con los depósitos, el total por paciente es de unos USD 5 a 6, así que **"menos que un café" solo vale si se habla de comisiones**.

## Wallet y proveedores

- **Privy:** [Stripe lo compró en junio de 2025](https://siliconangle.com/2025/06/11/stripe-acquires-crypto-wallet-infrastructure-provider-privy/) y sigue operando como producto independiente.
- **Cavos:** según su [README](https://github.com/cavos-labs/kit), en Solana usa llaves Ed25519 derivadas de una MasterDEK. El "P-256" de su [sitio](https://cavos.xyz/) habla de llaves de dispositivo. Además del `execute(amount, dest)`, el SDK tiene `executeInstructions(instructions)` para instrucciones arbitrarias. Su README no documenta firmar transacciones armadas afuera ni usar un fee payer propio (solo su relayer), ni verificar usuarios en el backend: ver [por qué Privy y no Cavos](stack.md#por-qué-privy-y-no-cavos). Clientes que nombra su sitio: Jokers of Neon y CofiBlocks. Gratis hasta 1.000 wallets, después tarifa plana por organización.
- **Anchor en Windows:** la [guía oficial](https://www.anchor-lang.com/docs/installation) exige WSL.

## Plazos

Entrega de Crypto World's Fair (evento actual de Colosseum): **13 de octubre de 2026, 06:59 UTC**. Confirmar las fechas propias de Superteam Argentina.
