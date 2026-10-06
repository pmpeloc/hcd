# Estado · Maximiliano

**Última actualización:** 2026-10-06

## En qué estoy
Quedó en PR la base visual de `hcd_app` (`feat/design-system`): tema Salua sobre shadcn/ui, tipografías, componentes (botones, chips de estado, tarjetas, campos, selector de duración) y los shells de paciente y médico, copiados del prototipo «Salua · App» de Claude Design. Encima apliqué el diseño «Salua · App C» (bloques bento y número grande) al Inicio del paciente y al panel del médico. Las demás páginas tienen el shell y su título; el contenido de cada pantalla sigue el plan día por día. La landing K queda en pausa (es de Rodrigo).

## Próximo paso
- Pantalla Mi QR del paciente: wallet pública + código corto con cuenta regresiva de 2 minutos, según `design/app-c/` (día 3, atrasado).
- Escáner del médico con el tilde de "Verifiqué el DNI en persona" (día 4).
- Reemplazar el usuario fijo del shell por la sesión real cuando Mati tenga la plomería.

## Bloqueos
- El equipo tiene que aprobar los tonos AA sumados a la paleta (`#0A6FC2`, `#0B7A74`, `#5F6B80`).
- `npm run lint` en `hcd_app` falla al cargar `eslint.config.mjs` ("circular structure"); viene del scaffold.
