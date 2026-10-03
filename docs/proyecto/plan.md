# Plan del proyecto (v1 + cambios aceptados)

Fuente: [plan-v1.pdf](plan-v1.pdf) ("Historia clínica soberana en Solana", versión 1.0, 3 de octubre de 2026, 13 páginas). Este archivo resume el PDF en texto para que cualquier agente lo pueda leer y **aplica encima los cambios que el equipo aceptó después**. Si este archivo y el PDF no coinciden, **manda este archivo**.

## Cambios aceptados sobre el PDF (2026-10-03)

Vienen del [relevamiento de Franco](../miembros/franco/relevamientos/2026-10-03-fees-wallet-antifalsificacion.md) y están registrados en [decisiones.md](decisiones.md).

| Tema | El PDF decía | Ahora |
|---|---|---|
| Quién carga estudios | Personal de la clínica | **Solo el médico verificado** (con matrícula), firmando con su propia wallet. Se elimina el rol "personal de clínica que carga". |
| Rol de la clínica | Emite estudios | No carga estudios. Avala qué médicos le pertenecen. |
| Estados del Record | Pending → Accepted / Rejected | **Active** al cargarse → **Disputed** (el paciente marca "no es mío") → **Voided** (el emisor lo anula y lo vuelve a emitir) |
| Instrucciones del paciente sobre estudios | `accept_record` / `reject_record` | Solo `dispute_record`. El emisor tiene `void_record`. |
| `grant_access` | Exige Record Accepted | Exige Record **Active** |
| Lectura del emisor | — | El médico emisor puede releer sus estudios sin permiso |
| Edición | — | No existe ninguna instrucción que modifique un Record: el paciente solo lee |
| Fee payer | Backend como fee payer | Igual, y además: el backend **arma la transacción**, el usuario firma y el backend verifica byte a byte antes de co-firmar; rate limit por usuario y organización; presupuesto diario; hot wallet con poco saldo y alerta |
| Llaves del backend | — | Fee payer y autoridad `key_service` en **keypairs distintos** |
| Payer de cuentas | Signer separado del dueño | Igual. Si se cierran cuentas, el rent vuelve al sponsor (`rent_payer` + `close = rent_payer`) |
| Visor | Recalcula el hash | Igual, y es obligatorio: si no coincide, muestra "Estudio alterado" y no descifra |
| Login y wallet | Privy | **Login con Supabase Auth; Privy solo para la wallet** (no Cavos). RLS con `app_user`. |
| Por dónde empezar | Monorepo y programa en paralelo | **Primero el programa Anchor** (todo depende de su IDL) |
| Nombre | Pendiente | HCD · Historial Clínico Digital |
| Estructura | Un monorepo con pnpm | **Cuatro repos:** `hcd` (docs), `hcd_api` (backend + programa Anchor), `hcd_app` (app), `hcd_landing` (landing). Ver sección 11. |
| Backend | Express + Sequelize | **NestJS** + **supabase-js** (sin ORM) |
| Gestor de paquetes | pnpm | **npm** en todos los repos |
| Validación de origen (caso Pepito) | — | El visor muestra el origen del estudio y los datos completos del emisor. Ver sección 8. |

## 1. Resumen

El paciente es dueño de su historia clínica. Los médicos verificados cargan estudios; otros médicos solo los leen si el paciente lo aprueba, por tiempo limitado y con registro de cada acceso. Solana es la fuente de verdad de permisos, prestadores habilitados y auditoría. Los documentos médicos nunca tocan la cadena.

Diferenciación: vencimiento real del acceso (servicio de llaves), un solo cliente primero, interoperabilidad HL7 FHIR (en el MVP, solo una exportación de ejemplo).

Plazo: cierre el 13/10/2026 a las 06:59 UTC = **03:59 del 13/10 en Argentina**. En la práctica, entregar antes de la noche del 12/10.

## 2. Alcance del MVP

| Dentro del MVP | Fuera del MVP (se documenta, no se construye) |
|---|---|
| Login con email o Google (Supabase Auth) y wallet embebida (Privy) para paciente, médico y admin | Cómputo confidencial con Arcium |
| Alta de clínicas y médicos; verificación manual por el equipo (admin) | Recuperación avanzada con Swig (MVP: recuperación de Privy) |
| Carga de estudios **por el médico** con el QR del paciente, cifrado en el navegador | App nativa con Solana Mobile (MVP: PWA) |
| El paciente puede marcar un estudio como "no es mío" | Acceso de emergencia y contactos de confianza |
| Solicitud de acceso del médico y aprobación del paciente con vencimiento | Carga masiva con Merkle roots |
| Servicio de llaves que niega por defecto | Integración real con registros de matrícula y firma digital legal |
| Visor con marca de agua, verificación de hash, revocación y línea de tiempo de accesos | Borrado criptográfico automatizado (solo diseño) |
| Demo completa en Solana devnet | Mainnet, auditoría del programa, exportación FHIR completa |

## 3. Actores

| Actor | Rol | Cómo entra |
|---|---|---|
| Paciente | Dueño de su historia. Lee sus estudios, marca "no es mío", aprueba o revoca accesos. | PWA, Supabase Auth, wallet embebida de Privy |
| Médico emisor | Carga estudios firmados con su wallet. Puede releer los suyos. | Web, Supabase Auth, wallet de Privy, matrícula verificada por el admin |
| Médico lector | Pide acceso y lee mientras el permiso esté vigente. | Web, Supabase Auth, wallet de Privy, matrícula verificada |
| Clínica | Avala qué médicos le pertenecen. No carga estudios. | Panel web |
| Admin | Habilita clínicas y médicos. En el MVP, el equipo. | Wallet de autoridad del programa |
| Servicio de llaves | Único componente que entrega llaves, solo con permiso vigente. | Backend con keypair propio (autoridad `key_service`) |

## 4. Flujos

**A · Alta del paciente:** abre la PWA, entra con Supabase Auth (email o Google), Privy le crea la wallet embebida y se registra su perfil (`register_patient`). El DNI no se guarda: solo se usa para verificar a la persona en persona.

**B · El médico carga un estudio:**
1. El paciente muestra un QR con su wallet pública y un código corto que vence en 2 minutos.
2. El médico verifica el DNI en persona y escanea el QR. El destino es la wallet, nunca una búsqueda por DNI.
3. El navegador genera una llave AES-256 por estudio (DEK) y cifra el archivo.
4. Sube el archivo cifrado con una URL firmada. La DEK va al servicio de llaves, que la envuelve y guarda solo la versión envuelta.
5. El médico firma `issue_record` con el hash del archivo cifrado. El Record queda **Active**.
6. El paciente recibe una notificación. Si no es suyo, lo marca con `dispute_record` y el emisor lo anula con `void_record`.

**C · Un médico lee un estudio:**
1. El paciente comparte un código o QR. El médico pide acceso (off-chain, para evitar spam y costos).
2. El paciente ve quién pide (matrícula verificada), qué estudios y elige la duración (1 hora, 24 horas o 7 días). Firma `grant_access`.
3. El médico pide la llave. El servicio lee el Record y el permiso en Solana y comprueba que estén activos y sin vencer.
4. Entrega la llave y una URL firmada de 60 segundos, y registra el acceso con `log_access`.
5. El visor verifica el hash, descifra y muestra el estudio sin botón de descarga y con marca de agua (nombre, matrícula y fecha).
6. Al vencer el permiso no se entregan más llaves. El paciente puede revocar antes con `revoke_access`.

Si el paciente no aprueba, no existe el permiso y el servicio niega por defecto: la ausencia de permiso es el bloqueo.

## 5. Principios de diseño

- Nada médico en la cadena, ni siquiera cifrado.
- Negar por defecto.
- Una llave por estudio: un permiso abre un estudio, no toda la historia.
- El destino es una wallet, no un DNI.
- Aislamiento por organización.
- Almacenamiento borrable (nada de Arweave o Irys).
- Honestidad sobre los límites: el servicio de llaves es un punto de confianza y un médico puede copiar lo que ya vio.

## 6. Stack

El listado detallado, con versiones y repo por repo, está en **[stack.md](stack.md)**. Resumen:

- **Programa:** Rust + Anchor, cliente con Codama y `@solana/kit`. En Windows, Anchor requiere WSL.
- **App y landing:** Next.js + React + TypeScript + Tailwind + shadcn/ui; Supabase Auth para login, Privy para la wallet; WebCrypto para cifrar.
- **Backend:** NestJS + supabase-js (sin ORM) + Zod; aislamiento entre organizaciones con RLS.
- **Datos:** PostgreSQL y Storage en Supabase; Solana devnet con RPC de Helius.
- **Hosting:** Vercel (app y landing), Railway o Render (API), Supabase (datos).
- **Paquetes:** npm en todos los repos.

## 7. Programa de Solana

**Cuentas (PDAs):**

| Cuenta | Semillas | Campos |
|---|---|---|
| Config | `["config"]` | admin, key_service, duración máxima de permisos |
| Provider | `["provider", authority]` | authority, tipo (clínica o médico), verified, organización |
| PatientProfile | `["patient", authority]` | authority, next_record_id, creado |
| Record | `["record", patient, record_id]` | patient, issuer, content_hash (SHA-256 del archivo cifrado), storage_ref, status (**Active, Disputed, Voided**), created_at; propuestos: `rent_payer`, `supersedes` |
| AccessGrant | `["grant", record, doctor]` | patient, doctor, record, expires_at, status (Active o Revoked), access_count; propuesto: `rent_payer` |

**Instrucciones:**

| Instrucción | Quién firma | Qué hace |
|---|---|---|
| `initialize_config` | Admin | Configuración global y autoridad del servicio de llaves |
| `register_provider` / `set_provider_verified` | Prestador / Admin | Alta del prestador; solo el admin lo verifica |
| `register_patient` | Paciente | Crea el perfil con contador de estudios |
| `issue_record` | **Médico verificado** | Crea el Record en estado **Active** |
| `dispute_record` | Paciente | Active → Disputed ("no es mío") |
| `void_record` | Médico emisor | Disputed → Voided; se reemite con un Record nuevo |
| `grant_access` | Paciente | Crea el permiso. Exige Record Active, vencimiento futuro y menor al máximo |
| `revoke_access` | Paciente | Pasa el permiso a Revoked. No se cierra la cuenta, para conservar auditoría |
| `log_access` | Servicio de llaves | Incrementa access_count y emite evento. Exige permiso Active y vigente |

Eventos: RecordIssued, RecordDisputed, RecordVoided, AccessGranted, AccessRevoked, AccessLogged. El contador `access_count` es la fuente de verdad (los logs pueden truncarse).

**Seguridad:** validar signers, semillas y bump con restricciones de Anchor; comparar el vencimiento contra `Clock`, nunca contra un valor del cliente; no guardar nombres, diagnósticos, DNI ni rutas legibles; probar casos negativos (médico sin permiso, permiso vencido o revocado, estudio en disputa, prestador sin verificar); solo devnet sin auditoría externa.

## 8. Cifrado y servicio de llaves

- **Archivo:** AES-256-GCM en el navegador, DEK aleatoria por estudio, IV único.
- **Integridad:** SHA-256 del archivo cifrado en el Record. El visor lo recalcula antes de descifrar.
- **Envoltura:** la DEK viaja por TLS al servicio de llaves, que la envuelve con una KEK de la organización (HKDF de una llave maestra). En el MVP, la llave maestra es un secreto de entorno; en producción, un KMS.
- **Quién recibe la DEK:** el paciente titular, el médico emisor, o un médico con AccessGrant activo y vigente. Nadie más.
- **Entrega:** DEK y URL firmada de 60 segundos. Opcional: sellar la DEK con una clave efímera X25519 del navegador del médico.
- **Auditoría:** cada entrega llama a `log_access`, más una tabla `key_releases` en Postgres.
- **Borrado:** destruir la DEK envuelta y borrar el archivo. En la cadena queda solo un hash.
- **Origen y emisor en el visor (caso Pepito, MVP):** el visor muestra quién cargó el estudio (nombre, matrícula, especialidad), la fecha on-chain y el link a la transacción. Además indica el origen: **"emitido por \<centro\>"** si lo cargó un médico del centro que hizo el estudio, o **"copia digitalizada por \<médico\>"** si lo cargó otro médico. Así quien lee puede desconfiar de, por ejemplo, una radiografía cargada por un médico de cabecera.

## 9. Backend

Módulos de NestJS: `auth` (guard que verifica el token de Supabase Auth), `organizations`, `records`, `access`, `keys`, `tx` (arma transacciones y fee payer), `indexer`.

| Endpoint | Quién | Para qué |
|---|---|---|
| `POST /records/upload-url` | Médico | URL firmada para subir el archivo cifrado |
| `POST /records` | Médico | Guarda DEK envuelta y metadatos; devuelve la transacción `issue_record` |
| `GET /patients/me/records` | Paciente | Lista de estudios y estados |
| `POST /access-requests` | Médico | Pide acceso con el código del paciente |
| `GET /access-requests/mine` | Paciente | Solicitudes pendientes |
| `POST /keys/release` | Paciente o médico | Entrega DEK y URL firmada si corresponde |
| `GET /audit/:recordId` | Paciente | Línea de tiempo de accesos |
| `POST /admin/providers/:id/verify` | Admin | Verifica clínica o médico |

Tablas: `users` (sin DNI), `organizations`, `staff_members`, `doctors`, `records`, `access_requests`, `audit_events`, `key_releases`.

Aislamiento: `organization_id` en cada fila con RLS (ver [patrón multi-organización](stack.md#patrón-multi-organización-con-rls)), y rutas de almacenamiento y llaves envolventes por organización.

## 10. Frontend

- **Paciente (PWA):** estudios, QR, marcar "no es mío", solicitudes de acceso, permisos activos y revocación, línea de tiempo.
- **Médico:** escáner de QR y carga de estudios; solicitar acceso; visor con marca de agua y tiempo restante.
- **Clínica:** avalar médicos.
- **Admin:** verificar clínicas y médicos (puede ser un script).

Librerías: `@privy-io/react-auth`, TanStack Query, React Hook Form + Zod, `qrcode` y `@yudiel/react-qr-scanner`, `pdf.js`, Serwist o next-pwa con Web Push.

## 11. Estructura de repositorios

Cuatro repos en la cuenta `pmpeloc`. Los tres de código se clonan **dentro** de `hcd`, y `hcd` los ignora en su `.gitignore`.

```
hcd/                 github.com/pmpeloc/hcd          Documentación (docs/ en español), reglas y hooks
├── hcd_api/         github.com/pmpeloc/hcd_api      Backend NestJS + programa Anchor
│   ├── programs/hcd/   Programa Anchor (Rust) + tests
│   ├── idl/            IDL publicado, del que hcd_app genera su cliente
│   └── src/            API NestJS
├── hcd_app/         github.com/pmpeloc/hcd_app      Next.js: paciente, médico, clínica y admin
└── hcd_landing/     github.com/pmpeloc/hcd_landing  Next.js estático: landing
```

- **Cliente del programa:** `hcd_api` publica el IDL en `idl/`. Cada repo que lo necesita (`hcd_api` y `hcd_app`) genera su cliente con Codama a partir de ese archivo.
- **Esquemas Zod compartidos:** sin monorepo no hay paquete compartido. Para el MVP, los esquemas de los endpoints se copian de `hcd_api` a `hcd_app`. Si se vuelve un problema, se publica un paquete.
- **Documentación y hooks:** todos los repos usan los hooks de `hcd/.githooks` y documentan en `hcd/docs/`. Ver [AGENTS.md](../../AGENTS.md).

## 12. Riesgos principales

Estudio vinculado a la persona equivocada (mitigación: QR presente + "no es mío"), paciente sin celular (fuera del MVP), pérdida de cuenta (recuperación de Privy), médico falso (verificación manual de matrícula), servicio de llaves comprometido, copia de lo ya descifrado, abuso del fee payer (rate limit y tope diario), spam de solicitudes, caída de devnet (RPC de respaldo y video grabado), bug de permisos (tests negativos y revisión cruzada).

## 13. Plan de 10 días

| Días | Solana | Backend | Frontend | Producto y pitch |
|---|---|---|---|---|
| 1–2 (3 y 4/10) | Cuentas, reglas, esqueleto, config, prestadores | Repos, base, auth con Supabase + wallet Privy (prueba de 1 hora primero) | Next.js, login, layouts por rol | Alcance, flujo y guion |
| 3–4 (5 y 6/10) | issue, dispute, void, grant, revoke, log_access con tests negativos. **Deploy en devnet** | Cliente Codama, módulos tx y fee payer | QR y escáner, perfil | Datos de prueba |
| 5–6 (7 y 8/10) | Revisión cruzada | Servicio de llaves, storage, indexer | Carga y cifrado, lista de estudios | Diapositivas del pitch |
| 7–8 (9 y 10/10) | Soporte a integración | Solicitudes, notificaciones, aislamiento | Solicitud, aprobación, visor, línea de tiempo | Probar el recorrido |
| 9 (11/10) | Congelar el programa | Rate limits, logs, deploy | Pulido, PWA | Video de respaldo |
| 10 (12/10) | Buffer | Buffer | Buffer | Entrega, README y repo ordenado |

**Definición de terminado del MVP:**
- Un paciente se registra y un médico le carga un estudio.
- Un médico pide acceso, el paciente aprueba por 1 hora y el médico ve el estudio.
- Después del vencimiento, el servicio de llaves le niega.
- Un segundo médico sin aprobación es bloqueado.
- La línea de tiempo muestra quién accedió y cuándo, con firma verificable en un explorador.
- Dos clínicas distintas no ven los datos de la otra.
- Un archivo alterado en el storage se detecta como "Estudio alterado".

## 14. Demo (4:30 minutos)

0:00 problema · 0:30 el médico carga un estudio con el QR · 1:30 otro médico pide acceso y el paciente aprueba por 1 hora · 2:30 el paciente niega a un segundo médico y vence el permiso del primero · 3:15 línea de tiempo verificable y diferenciación · 4:00 límites y hoja de ruta.

Hipótesis a validar: ¿quién paga primero, la clínica o la aseguradora? Si alguien tiene un contacto en una clínica de Jujuy, pedirle 15 minutos antes del cierre.

## 15. Hoja de ruta (después del MVP)

Del plan v1:
- Reducir la confianza en el servicio de llaves con Arcium o Lit.
- Recuperación de cuenta con Swig, recuperación social y contactos de confianza.
- Acceso de emergencia con doble confirmación, registro inmediato y aviso al paciente.
- Interoperabilidad: exportar e importar HL7 FHIR (Patient, DiagnosticReport, Observation).
- Aseguradoras: verificar que un estudio existe sin ver su contenido, para evitar duplicados.
- Escala: importación masiva con Merkle roots, KMS por organización, auditoría externa y mainnet.
- Validación legal con un abogado especializado en datos de salud y firma digital.

Del caso Pepito (médico cómplice que carga un estudio falso):
- **Alerta de conflicto:** marcar cuando el médico que cargó un estudio es el mismo que después pide acceso o receta en base a él.
- **Suspender prestadores:** si se descubre un fraude, el admin le quita la verificación (`suspend_provider` o `set_provider_verified` en `false`) y todos sus estudios se muestran con la advertencia "emisor suspendido".
- **Auditoría como evidencia:** exportar el registro firmado de un médico para presentarlo ante el colegio médico.
- **Centros de imágenes como emisores directos**, para que sus estudios figuren como "emitido por el centro".
- **Detección de patrones:** un médico de cabecera que carga muchas imágenes, o muchos estudios para un mismo paciente.

Del relevamiento de Franco: página para verificar copias que circulan por fuera, validar firma digital del PDF (PAdES), multisig con Squads para la clave admin, conexión con REFEPS/SISA y cobro por organización de los lamports consumidos.
