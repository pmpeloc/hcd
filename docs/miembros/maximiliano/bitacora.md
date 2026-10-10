# Bitácora · Maximiliano

Una entrada por commit, la más nueva arriba.

## 2026-10-09 · fix(app): use the shared API client and map its errors
- **Qué hice:** correcciones de la review de Franco en hcd_app#11. Borré mi `components/onchain/api-client.ts` y paso a usar el cliente de Mati (`lib/api.ts` + `lib/api-client.ts`, hcd_app#7, que mergeé en la rama): ya trae `redirect: 'error'` (el JWT no viaja en una redirección), `credentials: 'omit'`, origen fijo y sesión leída en cada llamada. `toTxError` ahora lee `ApiError.status`/`.code` en vez de parsear el texto del error; el 410 (`tx_id` vencido o usado) se rearma una vez como el 409; una sesión que no se puede restaurar es 503 ("El servicio no responde"). `BuildResponse` usa los campos reales (`last_valid_block_height`, `expires_in_seconds`). 35 tests de lógica + 14 de transporte en verde.
- **Archivos clave:** `hcd_app/components/onchain/tx-flow.ts`, `e2e/app-logic.spec.ts`; se borró `components/onchain/api-client.ts`.
- **Próximo paso:** correcciones de hcd_app#12 (visor). Orden de merge: #7 → #11 → #12.

## 2026-10-08 · feat(app): add the study viewer with hash check before decrypting
- **Qué hice:** día 7. Visor `visor/[recordId]`: pide la llave a `/keys/release` (con Bearer), descarga el archivo, calcula su SHA-256 y lo compara con la huella firmada **antes** de descifrar; si no coincide muestra "Estudio alterado" y no lo descifra. Si coincide, descifra en el navegador y dibuja el PDF con pdf.js (o la imagen) en canvas, con la marca de agua (nombre, matrícula y fecha) dentro de los píxeles; no hay link, blob ni botón de descarga, se bloquea el clic derecho y la impresión. Muestra el tiempo restante del permiso (al vencer, borra el documento de la pantalla y de memoria), la integridad y el origen. Estados: abriendo por fases, vencido, sin acceso, sesión vencida, Solana caída (con reintento) y archivo que no abre con su llave. "Mis accesos" del médico lista tres estudios de ejemplo (vigente, alterado, vencido) que pasan por el cifrado real. La carga ahora guarda `iv || cifrado` y la huella es de esos bytes (ver ideas).
- **Archivos clave:** `hcd_app/components/viewer/`, `app/(medico)/visor/[recordId]/page.tsx`, `app/(medico)/mis-accesos/page.tsx`, `components/doctor-upload/upload-record.ts`, `e2e/viewer.spec.ts`, `e2e/viewer-logic.spec.ts`.
- **Próximo paso:** acordar con Franco y Mati el formato del archivo guardado; leer la huella del Record on-chain cuando exista el cliente Codama; línea de tiempo del paciente (día 8).

## 2026-10-08 · feat(app): send the session token to the API and explain program errors
- **Qué hice:** `createApiClient` (`components/onchain/api-client.ts`): toda llamada a la API pasa por ahí y lleva `Authorization: Bearer <token>` de Supabase, leído en cada llamada (Supabase lo renueva solo); así nada da 401 cuando entre hcd_api#19. `runTx` ahora traduce los 20 errores del programa (el backend los devuelve como 422 con el nombre del IDL), incluidos los 3 nuevos (`KeyServiceIsAdmin`, `IssuerIsPatient`, `InvalidContentHash`), y el 401 a "Tu sesión venció"; los errores del programa no se reintentan. 9 tests nuevos. El lint (`npm run lint`) pasa limpio: el "circular structure" que vio el equipo sale de no correr `npm ci` después de traer `staging`.
- **Archivos clave:** `hcd_app/components/onchain/api-client.ts`, `components/onchain/tx-flow.ts`, `e2e/app-logic.spec.ts`.
- **Próximo paso:** visor `visor/[recordId]` contra `/keys/release`.

## 2026-10-08 · test(app): cover access screens and the tx flow
- **Qué hice:** 20 tests nuevos. Lógica: `runTx` con una API falsa (orden de fases, rearma una vez ante 409, se rinde al segundo, firma cancelada no envía nada, mensajes para 403/429/503) y los helpers de permisos (tiempo restante, "se cierra hoy/mañana/el dd/mm", vencimiento, progreso, estado vencido). Pantallas: solicitud con 24 h por defecto, cambio de duración, aprobar, rechazar, revocar con cancelar y confirmar, historial; y Pedir acceso sin paciente, envío con motivo y error con reintento. Pasan los 61 tests y el build.
- **Archivos clave:** `hcd_app/e2e/access.spec.ts`, `e2e/app-logic.spec.ts`.
- **Próximo paso:** visor (día 7) contra `/keys/release`; conectar `runTx` cuando Mati sume la firma a `useSaluaWallet`.

## 2026-10-08 · feat(app): add access requests, approvals and revocation
- **Qué hice:** día 6. Paciente (`/accesos`): solicitud pendiente con quién pide (matrícula, centro, motivo), selector 1 h / 24 h / 7 días con número grande y hora de cierre, aprobar o rechazar; permisos activos con tiempo restante, barra y "Revocar" con confirmación; historial de permisos vencidos y revocados. Médico (`/solicitar`): paciente, qué pide (toda la historia, sin descarga, duración que elige el paciente), motivo opcional, enviado y error con reintento. Sumé `runTx` (`components/onchain/tx-flow.ts`): pide la tx a `/tx/build`, la firma con la wallet y la manda a `/tx/submit`, rearma una vez si venció el blockhash y traduce los errores (403, 409, 429, 503, firma cancelada). Los datos siguen siendo ficticios hasta que existan los endpoints de `access` y `records` y la firma en `useSaluaWallet`. También extraje el diálogo de confirmación y el bloque "Primero identificá al paciente".
- **Archivos clave:** `hcd_app/components/access/`, `components/onchain/tx-flow.ts`, `components/confirm-dialog.tsx`, `components/needs-patient.tsx`, `app/(paciente)/accesos/page.tsx`, `app/(medico)/solicitar/page.tsx`.
- **Próximo paso:** tests de las pantallas de accesos y de `runTx`.

## 2026-10-07 · test(app): cover patient and doctor screens with Playwright
- **Qué hice:** 35 tests nuevos con Playwright (el runner que ya usa la app; Vitest no está en el stack del frontend). Lógica: código del QR (formato, ida y vuelta del payload, códigos escritos, cuenta regresiva), búsqueda del escáner, validación de archivos y que el cifrado sea real (la huella es del archivo cifrado y cambia con cada llave). Pantallas: pedir sesión sin login, nombre de la sesión en el shell, Mi QR sin wallet, Mis estudios con filtros y "No es mío", escáner con DNI y errores, y la carga completa con error y reintento. La sesión se simula igual que en los tests de login de Mati. Pasan los 41 tests, también repetidos.
- **Archivos clave:** `hcd_app/e2e/app-logic.spec.ts`, `e2e/app-shell.spec.ts`, `e2e/patient-studies.spec.ts`, `e2e/doctor-flow.spec.ts`, `e2e/support/session.ts`.
- **Próximo paso:** Pedir acceso y solicitudes del paciente (día 6), con sus tests.

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
