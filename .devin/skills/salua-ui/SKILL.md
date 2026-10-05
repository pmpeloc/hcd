---
name: salua-ui
description: Guía de diseño visual para las pantallas de Salua (paciente y médico): paleta azul/turquesa, tipografía, componentes y accesibilidad. Usar al crear o mejorar cualquier pantalla o componente de UI.
---

# salua-ui

Salua es una app de salud: tiene que transmitir **confianza, calma y claridad**. Nada de efectos recargados.

## Identidad
- Logo: una S con cruz médica en azul y turquesa. Respetar su espacio libre y no deformarlo.
- Paleta oficial (ya definida en `hcd_app/app/globals.css` como tokens `salua-navy`/`salua-blue`/`salua-turquoise` — usarlos siempre, no hardcodear hex):
  - Azul marino: `#0D2950` (`salua-navy`)  · Azul: `#0B91F2` (`salua-blue`)  · Turquesa: `#0FB3AA` (`salua-turquoise`)
  - Fondo: `#F7FAFC`  · Superficie/tarjeta: `#FFFFFF`  · Texto: `#0F172A`  · Texto secundario: `#64748B`
  - Estados: éxito `#16A34A`, alerta `#F59E0B`, error `#DC2626`
- Mapear los estados de Record: Active = verde, Disputed = ámbar, Voided = gris/rojo. Siempre con texto o ícono además del color.

## Tipografía y espacio
- Una sola familia sans-serif legible (Inter o similar), 16px mínimo en cuerpo.
- Escala: 12 / 14 / 16 / 20 / 24 / 32. Espaciado en múltiplos de 4 u 8.
- Bordes redondeados 12px en tarjetas, 8px en botones e inputs; sombras suaves.

## Patrones clave
- Paciente: pantalla de inicio con "Mis historiales" y una bandeja visible de **solicitudes de acceso** con botones grandes Aprobar / Rechazar.
- Médico: buscador por DNI, estado de la solicitud (pendiente / aprobada / rechazada) y vista de lectura limpia.
- Mostrar siempre quién emitió cada estudio y su verificación (badge "Médico verificado").
- Acciones de la wallet/firma: explicar en lenguaje simple qué se va a firmar antes de abrir Privy.
- Estados vacíos, cargando y error en TODAS las pantallas, con mensajes humanos.

## Accesibilidad y móvil
- Contraste AA mínimo, foco visible, `aria-label` en íconos, objetivos táctiles de 44px.
- Diseñar mobile-first; probar a 360px de ancho.

## Antes de entregar
Revisá: ¿se entiende en 5 segundos qué hacer? ¿hay estados vacío/error? ¿colores consistentes con la paleta? Si hay duda de diseño, avisá en el grupo: las pantallas son territorio de Maxi.
