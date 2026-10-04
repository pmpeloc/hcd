# Tareas · Rodrigo (producto y pitch)

**Rol:** producto, validación con clínicas y prepagas, pitch, consulta legal, datos de prueba, landing y video.
**Respaldo:** Maximiliano (demo).
**Repos:** `hcd` (`docs/`, `pitch/`, `demo/`, `assets/`, README con Franco) y `hcd_landing` (con ayuda de Maximiliano).

## Archivos y módulos bajo tu responsabilidad

- `hcd/pitch/` — `deck.pdf` (8 diapositivas), `guion.md`, `video.md` (enlace no listado).
- `hcd/assets/` — logo PNG/SVG, paleta, capturas.
- `hcd/demo/` — contenido del prototipo navegable (lo publica Maximiliano).
- `hcd/docs/` — documentación en español (compartida: agregar, no reescribir lo de otros).
- `hcd_landing/` entero — sitio estático (Next.js `output: 'export'`).
- Datos de prueba sintéticos que usa el equipo (pacientes, médicos, clínicas, estudios de ejemplo).
- `hcd/README.md` junto con Franco.

**No tocar:** código de `hcd_api` ni de `hcd_app` (salvo ajustes de marca coordinados con Maximiliano).

## Plan día por día

### Día 1 · sáb 3/10 (preparativos)
- Pasos 1 y 2: anotarte en el Luma de Argentina y registrarte en Colosseum Arena con el email del equipo.
- Armar la carpeta de materiales: logo en PNG con fondo transparente, descripciones, enlaces, paleta de marca.
- Con Franco: abrir los formularios de los pasos 3 y 4 y copiar todos sus campos a una lista.
- Grabar el video de respaldo del prototipo navegable.

### Día 2 · dom 4/10 (preselección) — puerta G1
- 12:00–13:00: revisión final de las respuestas y del demo desde un celular y otra computadora (con Maximiliano).
- Franco envía los pasos 3 y 4 antes de las 13:00; vos comprobás los correos de confirmación y que Arena muestre el equipo completo.
- Contactar una clínica o prepaga para validar la hipótesis de quién paga primero (si hay contacto en Jujuy, pedir 15 minutos).
- Deck v1: las 8 diapositivas del plan completo (portada, problema, solución, demo, cómo funciona, por qué Solana, límites, siguiente paso).

### Día 3 · lun 5/10 (datos y legal)
- Datos de prueba 100% sintéticos: pacientes, médicos con matrícula, dos clínicas (para probar el aislamiento), estudios de ejemplo.
- Pedir la consulta legal inicial: firma digital (Ley 25.506 — la firma de wallet no la cumple), conservación de la historia (Ley 26.529) y dato sensible (Ley 25.326).

### Día 4 · mar 6/10 (pitch)
- Deck v2 y guion del demo de 4:30 con quién habla en cada tramo (Franco 0:00 y 2:30, Maximiliano 0:30 y 1:30, Rodrigo 3:15 y 4:00).
- Redactar los textos largos del formulario de entrega final (qué construimos, qué tiene que ser cierto, riesgos).

### Día 5 · mié 7/10 (mensaje)
- Pulir la narrativa: "Tu historia clínica, bajo tu control". Qué garantiza (quién emitió, cuándo, que nadie lo alteró) y qué no (verdad clínica).
- Revisar que el demo y los materiales no digan "HCD" en ninguna parte.

### Día 6 · jue 8/10 (landing v0)
- `hcd_landing`: estructura del sitio estático — hero, problema, cómo funciona, seguridad, equipo, enlace al demo. Marca Salua aplicada.

### Día 7 · vie 9/10 (ensayo 1) — puerta G4
- Ensayo del pitch 1 con cronómetro, con el recorrido completo funcionando.
- Revisar las frases legales y de seguridad: nada de "100% seguro" ni "certifica la historia clínica".

### Día 8 · sáb 10/10 (landing + video)
- Terminar la landing y publicarla en Vercel.
- Guion del video final (2:30–3:00): problema → demo del recorrido → límites y siguiente paso.

### Día 9 · dom 11/10 (ensayo 2 + video) — puerta G5
- Ensayo del pitch 2.
- Probar el recorrido completo de punta a punta y anotar todas las fallas para el equipo.
- Grabar el video final y subirlo a YouTube "No listado" (o Drive con acceso por enlace). Verificar en incógnito.

### Día 10 · lun 12/10 (entrega) — puerta G6
- Pegar textos y enlaces en el formulario final; confirmar el envío con Franco antes de las 20:00.
- Dejar el README y el repo ordenados para el jurado.

## Entregables

1. Deck de 8 diapositivas exportado a PDF en `hcd/pitch/deck.pdf`.
2. Video del pitch (2:30–3:00) subido como no listado, con el enlace verificado en incógnito.
3. Landing de Salua publicada en Vercel.
4. Paquete de datos de prueba sintéticos para el equipo y el demo.
5. Kit de textos para los formularios (descripción corta, problema, solución, tecnología, límites, equipo).
6. Registro de la validación: al menos una conversación con clínica/prepaga y una consulta legal inicial (o el intento documentado).

## Criterios de aceptación (Definition of Done)

- El deck tiene las 8 diapositivas acordadas, marca Salua y exporta a PDF sin errores.
- El video muestra el recorrido completo sin depender de internet en vivo y se abre sin iniciar sesión.
- La landing abre sin cuenta, en celular, y enlaza al demo.
- Ningún material afirma algo que no existe ("desplegado en devnet", "llaves funcionando") si todavía no es así.
- No queda "HCD" visible en demo, deck, video, landing ni README.
- Los datos de prueba son sintéticos: nada de pacientes ni datos de salud reales.
- Cada enlace que se entrega se probó en ventana de incógnito y desde un celular con datos móviles.

## Dependencias

- Maximiliano publica el demo y aplica la marca en la app; sin eso no hay enlace de demo.
- El recorrido de punta a punta (todo el equipo) habilita el video final y el ensayo real.
- Franco envía los formularios; vos proveés los textos y los materiales.
