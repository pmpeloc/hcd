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
- **A validar con un abogado:** una firma de billetera Solana probablemente no sea "firma digital" en sentido legal.

Fuentes: [Abeledo Gottheil](https://abeledogottheil.com.ar/comentarios-a-la-ley-27-706-unificacion-de-historias-clinicas-electronicas-en-argentina/) · [Beccar Varela](https://beccarvarela.com/novedades/ley-n27-706-historia-clinica-digital/)

## Plazos

Entrega de Crypto World's Fair (evento actual de Colosseum): **13 de octubre de 2026, 06:59 UTC**. Confirmar las fechas propias de Superteam Argentina.
