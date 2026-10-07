# Bitácora · Maximiliano

Una entrada por commit, la más nueva arriba.

## 2026-10-05 · fix(skills): replace DNI search with patient QR in salua-ui
- **Qué hice:** la skill `salua-ui` les pedía a los agentes un "buscador por DNI" para el médico, contra el principio del plan "el destino es una wallet, no un DNI". Ahora indica el escáner del QR del paciente (o su código corto de 2 minutos) y prohíbe la búsqueda por DNI.
- **Archivos clave:** `.devin/skills/salua-ui/SKILL.md`.
- **Próximo paso:** tema Salua y layouts de paciente y médico en `hcd_app` (`feat/design-system`) a partir del mockup elegido (Landing K).
