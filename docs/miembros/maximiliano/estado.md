# Estado · Maximiliano

**Última actualización:** 2026-10-06

## En qué estoy
Quedó en PR la base visual de `hcd_app` (`feat/design-system`): tema Salua sobre shadcn/ui, tipografías, componentes (botones, chips de estado, tarjetas, campos, selector de duración) y los shells de paciente y médico, copiados del prototipo «Salua · App» de Claude Design. Encima apliqué el diseño «Salua · App C» (bloques bento y número grande) al Inicio del paciente y al panel del médico. En la rama `feat/patient-qr` (sale de `feat/design-system`) hice la pantalla Mi QR con datos ficticios, y en `feat/doctor-scanner` (sale de esa) el escáner del médico con la verificación del DNI. Las demás páginas tienen el shell y su título; el contenido de cada pantalla sigue el plan día por día. La landing K queda en pausa (es de Rodrigo).

## Próximo paso
- Conectar Mi QR a la wallet real (Privy) y a la API cuando Mati las suba.
- Formulario de carga del estudio (`/cargar`), día 4–5.
- Conectar el escáner a la API de Mati para validar el código.
- Reemplazar el usuario fijo del shell por la sesión real cuando Mati tenga la plomería.

## Bloqueos
- El equipo tiene que aprobar los tonos AA sumados a la paleta (`#0A6FC2`, `#0B7A74`, `#5F6B80`).
- `npm run lint` en `hcd_app` falla al cargar `eslint.config.mjs` ("circular structure"); viene del scaffold.
