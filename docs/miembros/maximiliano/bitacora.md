# Bitácora · Maximiliano

Una entrada por commit, la más nueva arriba.

## 2026-10-07 · feat(app): add patient studies list with "not mine" dispute
- **Qué hice:** pantalla Mis estudios (`/estudios`) con el diseño «Salua · App C»: lista con estado (Activo, En disputa, Anulado) y origen de cada estudio ("Emitido por" o "Copia digitalizada por"), filtros por estado con contador, número grande de estudios activos, y el botón "No es mío" con confirmación que deja el estudio en disputa. Tiene estados de carga, error, vacío y filtro sin resultados. Los datos y la disputa son ficticios (`getMyStudies`, `disputeStudy`) hasta que exista `GET /patients/me/records` y se firme `dispute_record` con `/tx`.
- **Archivos clave:** `hcd_app/components/patient-studies/`, `app/(paciente)/estudios/page.tsx`.
- **Próximo paso:** Pedir acceso y solicitudes del paciente (día 6).

## 2026-10-07 · feat(app): connect patient and doctor shells to the real session
- **Qué hice:** los layouts de paciente y médico ahora usan la sesión de Supabase y la wallet de Privy que integró Mati (PR #4). El shell muestra el nombre real y lleva a `/login` desde la cuenta; sin sesión pide iniciar sesión. Mi QR usa la wallet real del paciente, con estados para "preparando tu cuenta" y error. Si Supabase no está configurado queda un modo demo con datos de ejemplo y un aviso (sin Supabase, el puente de Privy rompía la página). Los saludos de Inicio y del panel salen de la sesión. Arreglé el único error de lint del escáner.
- **Archivos clave:** `hcd_app/components/app-shell/session-shell.tsx`, `app/(paciente)/layout.tsx`, `app/(medico)/layout.tsx`, `components/patient-qr/`.
- **Próximo paso:** lista de estudios del paciente.

## 2026-10-06 · feat(app): add doctor study upload with in-browser encryption
- **Qué hice:** pantalla Cargar estudio (`/cargar`) con el diseño «Salua · App C». Llega con el paciente desde el escáner (`?paciente=SAL-XXXX`); sin paciente pide escanear primero. Tiene pasos, tipo de estudio con sugerencias, fecha, origen ("Emitido por" o "Copia digitalizada por"), zona para arrastrar el archivo con validación de formato y tamaño (50 MB), resumen antes de confirmar y progreso grande por fases. El cifrado ya es real: usa `lib/crypto` de Franco (AES-256-GCM en el navegador y SHA-256 del archivo cifrado). La subida, el depósito de la llave y la firma de `issue_record` son ficticios hasta que exista la API; un archivo con "error" en el nombre muestra el estado de error.
- **Archivos clave:** `hcd_app/components/doctor-upload/`, `app/(medico)/cargar/page.tsx`.
- **Próximo paso:** conectar la subida a la API cuando Mati la tenga; seguir con Pedir acceso y las solicitudes del paciente.

## 2026-10-06 · feat(app): add doctor QR scanner with in-person ID check
- **Qué hice:** escáner del médico (`/escanear`) con `@yudiel/react-qr-scanner` y el diseño «Salua · App C». Lee el QR de Mi QR con `parseQrPayload` o acepta el código escrito a mano (normaliza "4f7k" a `SAL-4F7K`). Muestra el paciente en grande con la cuenta regresiva del código, y "Cargar estudio" y "Pedir acceso" se habilitan recién con el interruptor "Verifiqué el DNI en persona". Tiene estados para código vencido, no encontrado, QR que no es de Salua, código mal escrito y cámara sin permiso o no disponible. Corregí que la librería exigía cámaras de 640 px de alto o más (rechazaba webcams de 480p). La búsqueda del paciente es ficticia (`lookupPatient`) hasta que exista la API; `SAL-VVVV` y `SAL-NNNN` muestran los estados de error en la demo. Lo probé de punta a punta con una cámara falsa que muestra un QR real.
- **Archivos clave:** `hcd_app/components/doctor-scanner/`, `app/(medico)/escanear/page.tsx`, `components/patient-qr/qr-session.ts`, `app/globals.css`.
- **Próximo paso:** formulario de carga del estudio (`/cargar`), recibiendo el paciente desde el escáner.

## 2026-10-06 · feat(app): add patient QR screen with 2-minute one-time code
- **Qué hice:** pantalla Mi QR (`/qr`) del paciente con el diseño «Salua · App C»: QR vectorial con un código corto de un solo uso (`SAL-XXXX`), cuenta regresiva grande de 2 minutos con barra, aviso cuando quedan 30 segundos, estado vencido con el QR desenfocado y "Generar uno nuevo", estados de carga y error, y el identificador de la cuenta abreviado con botón para copiar. La sesión del código es ficticia (`createQrSession`) hasta que estén Privy y la API de Mati; dejé `parseQrPayload` para el escáner del médico.
- **Archivos clave:** `hcd_app/components/patient-qr/`, `app/(paciente)/qr/page.tsx`, `components/big-number.tsx`, `components/progress-track.tsx`.
- **Próximo paso:** escáner del médico (`/escanear`) con `@yudiel/react-qr-scanner`, leyendo el QR con `parseQrPayload`.

## 2026-10-06 · feat(app): apply bento layout from Salua App C to home screens
- **Qué hice:** pasé a `hcd_app` el diseño «Salua · App C» de Claude Design (exportado en `design/app-c/`): bloques bento (blanco, cielo, menta, navy), un número grande por pantalla para el tiempo restante y barras con el degradé de marca. Rehice el Inicio del paciente y el `/panel` del médico, sumé buscador y "Mostrar mi QR" arriba para el paciente, contador en Accesos y punto de notificaciones. Entre 1024 y 1180 px la lista pasa a ancho completo para que los bloques chicos no queden estirados.
- **Archivos clave:** `hcd_app/app/globals.css`, `components/tile.tsx`, `components/big-number.tsx`, `components/app-shell/`, `app/(paciente)/inicio/page.tsx`, `app/(medico)/panel/page.tsx`.
- **Próximo paso:** pantalla Mi QR con la cuenta regresiva de 2 minutos y el número grande, siguiendo `design/app-c/PacienteQR.html`.

## 2026-10-05 · feat(app): add Salua design system and patient/doctor app shells
- **Qué hice:** en `hcd_app` pasé a código el sistema y el esqueleto del prototipo «Salua · App» de Claude Design: tema shadcn/ui con la paleta oficial más tonos AA (`#0A6FC2`, `#0B7A74`, `#5F6B80`), Poppins + Inter con `next/font`, botones pill, chips de estado, selector 1 h / 24 h / 7 días, y shells de paciente (sidebar + barra inferior mobile) y médico (sidebar). Agregué `/panel` y `/mis-accesos` para el médico. Versiones fijadas y de más de 7 días, salvo `shadcn` 4.21.1 (la de `stack.md`).
- **Archivos clave:** `hcd_app/app/globals.css`, `app/layout.tsx`, `components/app-shell/`, `components/ui/`, `components/status-chip.tsx`, `components/duration-selector.tsx`.
- **Próximo paso:** pantalla Mi QR del paciente (wallet pública + código de 2 minutos) con la lógica del prototipo; que el equipo apruebe los tonos AA.

## 2026-10-05 · fix(skills): replace DNI search with patient QR in salua-ui
- **Qué hice:** la skill `salua-ui` les pedía a los agentes un "buscador por DNI" para el médico, contra el principio del plan "el destino es una wallet, no un DNI". Ahora indica el escáner del QR del paciente (o su código corto de 2 minutos) y prohíbe la búsqueda por DNI.
- **Archivos clave:** `.devin/skills/salua-ui/SKILL.md`.
- **Próximo paso:** tema Salua y layouts de paciente y médico en `hcd_app` (`feat/design-system`) a partir del mockup elegido (Landing K).
