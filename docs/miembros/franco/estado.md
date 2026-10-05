# Estado · Franco

**Última actualización:** 2026-10-05

## En qué estoy
Redistribuí `hcd_app` entre Maxi y Mati (decisión registrada en `decisiones.md`): Maxi queda con las rutas de paciente/médico y `components/`; Mati suma la plomería (login, Privy, `lib/api`, schemas, `hcd-client`, clínica/admin, PWA). Antes: demo navegable con logo, toggle ES/EN y tipografía legible; base de los tres repos de código; skills de Devin (`/review`, `/commit-docs`, `/anchor-check`, `/salua-ui`) publicadas en `.devin/skills/`.

## Próximo paso
- Día 1 del plan: diseño del servicio de llaves (`/keys/release`, DEK/KEK con HKDF, `key_releases`) + spec del módulo `tx` + prueba de 1 hora de Privy.
- Mergear la PR de skills y esta de tareas; que el equipo confirme la reasignación.
- Deploy del `demo/` en Vercel para el "enlace al producto en vivo" de la entrega.

## Bloqueos
- La reasignación de tareas necesita el OK de Mati y Maxi antes de mergear.
- `lib/hcd-client/` espera el IDL v0 de Misael (lunes 5 a la noche).
