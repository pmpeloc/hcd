# Ideas · Franco

La más nueva arriba.

## 2026-10-03 · Del relevamiento de fees, wallet y antifalsificación
Detalle y contexto en [relevamientos/2026-10-03-fees-wallet-antifalsificacion.md](relevamientos/2026-10-03-fees-wallet-antifalsificacion.md).

**Diseño (aceptado por el equipo el 2026-10-03, ver [decisiones.md](../../proyecto/decisiones.md)):**
- Solo el médico verificado carga estudios, con su propia wallet; el paciente solo lee.
- Estados del estudio: Active → Disputed (paciente: "no es mío") → Voided (lo anula el emisor y lo vuelve a emitir).
- La clínica no carga estudios; como mucho avala qué médicos le pertenecen.
- El fee payer lo pone el backend (paga el cliente B2B), separado de la autoridad `key_service`.
- El visor verifica el hash del archivo contra el que está on-chain antes de descifrarlo.
- Campo `supersedes` en Record para dejar explícitas las correcciones.

**Demo y pitch:**
- Escena: modificar un byte del archivo y mostrar que el visor marca "Estudio alterado".
- Mostrar emisor, profesional, fecha on-chain y link al explorador.
- "No certificamos que el contenido sea verdadero; certificamos quién lo emitió, cuándo, y que nadie lo tocó después."
- "Las comisiones de red cuestan menos de 10 centavos de dólar por paciente por año." (Verificado. "Menos que un café" solo vale para las comisiones, no para los depósitos: ver [costos](../../proyecto/investigacion.md#costos-on-chain-verificados).)

**Hoja de ruta:**
- Página para verificar copias de un estudio que circulan por fuera.
- Validar la firma digital del PDF (PAdES) al cargarlo.
- Multisig con Squads para la clave admin; conexión con REFEPS/SISA.
- Cobrarle a cada organización los lamports que consumió.
- Prueba de 1 hora con Cavos: firmar una instrucción Anchor propia en devnet con fee payer externo.
