# Tareas · Maximiliano (frontend)

**Rol:** app del paciente y del médico, visor con marca de agua, QR y escáner, marca Salua en todo lo visible.
**Respaldo:** Franco.
**Repos:** `hcd_app` (completo, salvo `lib/crypto/` y la integración con la cadena, que son de Franco), `hcd/demo/` (prototipo), ayuda a Rodrigo en `hcd_landing`.

## Archivos y módulos bajo tu responsabilidad

- `hcd_app/app/` — todas las rutas: `(auth)/login/`, `(paciente)/` (inicio, estudios, qr, accesos, linea-de-tiempo), `(medico)/` (escanear, cargar, solicitar, visor/[recordId]), `(clinica)/avalar-medicos`, `(admin)/verificar`.
- `hcd_app/components/` — UI con shadcn/ui: visor, marca de agua, QR, listas.
- `hcd_app/lib/` — `hcd-client/` (cliente Codama, con Franco), `schemas/` (esquemas Zod copiados de `hcd_api`), `supabase.ts`, `privy.ts`, `api.ts`.
- `hcd_app/public/` — iconos de la PWA y manifest; Serwist + Web Push.
- `hcd/demo/` — publicar el prototipo navegable en Vercel con marca Salua.

**No tocar:** `lib/crypto/` (Franco), `programs/` e `idl/` (Misael), `src/` del backend (Matías y Franco), `pitch/` (Rodrigo).

## Plan día por día

### Día 1 · sáb 3/10 (demo + marca)
- Pasos 1 y 2 (Luma + Arena).
- Aplicar la marca Salua al prototipo navegable: logo, colores (#0D2950, #0B91F2, #0FB3AA), tipografía redondeada. Que no quede "HCD" visible.
- Publicar el demo en Vercel desde `hcd/demo` (root directory `demo`, preset Other) y probar el enlace público en incógnito y celular.

### Día 2 · dom 4/10 (base de la app)
- Antes de las 13:00: verificación cruzada del demo con Rodrigo (celular con datos + incógnito).
- `hcd_app` con Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, tema Salua.
- Login con Supabase Auth (email y Google) y layouts por rol (paciente, médico, clínica, admin).

### Día 3 · lun 5/10 (wallet + perfil)
- Integrar Privy (`@privy-io/react-auth`) en modo "custom auth" con el token de Supabase: que cree la wallet embebida de Solana. (Prueba de 1 hora junto a Franco; si falla, plan B de stack.md.)
- Perfil del paciente y pantalla de QR: wallet pública + código corto que vence en 2 minutos.

### Día 4 · mar 6/10 (escáner)
- Escáner de QR del médico (`@yudiel/react-qr-scanner`) y validación del código contra la API.
- Inicio del flujo de carga: formulario del estudio.

### Día 5 · mié 7/10 (carga del estudio) — puerta G3
- Pantalla de carga del médico: usa `lib/crypto/` de Franco para cifrar (AES-256-GCM), calcula el hash, sube el archivo con la URL firmada y pide la transacción `issue_record` para firmarla con Privy.
- Lista de estudios del paciente con sus estados (Active / Disputed / Voided).

### Día 6 · jue 8/10 (solicitudes y aprobaciones)
- Médico: pantalla para pedir acceso con el código del paciente.
- Paciente: solicitudes pendientes, aprobación con duración (1 h, 24 h o 7 días) firmando `grant_access`; permisos activos y revocación (`revoke_access`); botón "no es mío" (`dispute_record`).

### Día 7 · vie 9/10 (visor) — puerta G4
- Visor `visor/[recordId]`: pide la llave, verifica el hash, descifra y muestra el documento (pdf.js en canvas) **sin botón de descarga**, con marca de agua (nombre, matrícula y fecha), datos completos del emisor, origen ("emitido por \<centro\>" / "copia digitalizada por \<médico\>") y tiempo restante del permiso.
- Si el hash no coincide: muestra "Estudio alterado" y no descifra.

### Día 8 · sáb 10/10 (línea de tiempo + pulido)
- Línea de tiempo de accesos del paciente (quién accedió, cuándo, link a la transacción en el explorador).
- Corregir los errores del recorrido anotados por Rodrigo; estados de error en la interfaz.

### Día 9 · dom 11/10 (PWA + congelamiento) — puerta G5
- PWA con `@serwist/next` (instalable, manifest, iconos) y estados de error pulidos.
- Solo corrección de errores; nada de funcionalidad nueva.

### Día 10 · lun 12/10 (entrega) — puerta G6
- Solo errores. Apoyo a la entrega: que la app de producción en Vercel funcione para el jurado.

## Entregables

1. Demo navegable publicado en Vercel con marca Salua (Día 1–2).
2. `hcd_app` con login Supabase Auth + wallet Privy y layouts por rol.
3. Flujo completo del médico: escanear QR → cifrar y cargar estudio → pedir acceso → visor.
4. Flujo completo del paciente: estudios, QR, "no es mío", aprobaciones con vencimiento, revocación, línea de tiempo.
5. Visor con marca de agua, origen del estudio, verificación de hash y sin descarga.
6. PWA instalable funcionando en celular.

## Criterios de aceptación (Definition of Done)

- Login con email/Google crea la wallet embebida de Solana y el usuario queda vinculado.
- El QR del paciente muestra la wallet pública y un código que vence a los 2 minutos.
- El archivo se cifra en el navegador antes de subir; nunca viaja en claro.
- El visor recalcula el hash antes de descifrar: si no coincide, muestra "Estudio alterado".
- Toda vista del documento tiene marca de agua con nombre, matrícula y fecha; no hay descarga.
- Los estados del Record y del permiso se muestran correctamente y la línea de tiempo enlaza a transacciones reales del explorador.
- Funciona en celular (PWA), con estados de error claros; nada de "HCD" visible.
- Funciona en devnet, con prueba manual anotada, revisado y mergeado a `main` por PR.

## Dependencias

- `lib/crypto/` de Franco habilita la carga y el visor.
- `idl/hcd.json` de Misael habilita el cliente Codama (`lib/hcd-client/`).
- Los endpoints de Matías (upload-url, records, access-requests, audit) y `/keys/release` de Franco habilitan cada flujo.
- Los esquemas Zod se copian a mano de `hcd_api` a `lib/schemas/`: si cambia un contrato, hay que recopiar.
