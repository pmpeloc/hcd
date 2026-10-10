---
name: e2e-smoke
description: Guía completa del smoke E2E contra devnet para Salua/HCD — levantar api+app, enrolar dos cuentas reales (paciente y médico) y validar el circuito entero: QR → lookup → upload cifrado → issue_record → indexer → grant_access → keys/release → visor "Es el archivo original". Usar cuando alguien pida probar la app de punta a punta en vivo.
---

# e2e-smoke · Prueba de punta a punta en devnet

Corre el circuito real completo del MVP con dos cuentas y devnet. El agente ejecuta los pasos técnicos (SQL, scripts on-chain, verificaciones) y le indica a la persona los pasos en el browser (login, firmas en Privy, uploads). **No commitees nada del smoke** — es una prueba en vivo.

## 0. Prerequisitos

- API corriendo: `cd hcd_api && npm run start:dev` en `:3001`. En el boot buscá `ProgramLogs`/`indexer subscribed` en el log — confirma que el indexer escucha devnet.
- App corriendo: `cd hcd_app && npm run dev` en `:3000`.
- `.env` de la API: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `SOLANA_RPC_URL`, `FEE_PAYER_SECRET`, `KEY_SERVICE_SECRET` (distinta del fee payer), `PROGRAM_ID`, `WALLET_ENROLLMENT_ORIGIN`, `CORS_ORIGIN=http://localhost:3000`.
- `.env` de la app: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_PRIVY_APP_ID`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_PROGRAM_ID`. Si sumás una `NEXT_PUBLIC_*`, **reiniciá `npm run dev`**.
- Migraciones de `hcd_api/supabase/migrations/` aplicadas al Supabase compartido — en particular `20261014_role_privileges` (sin ella, `service_role` recibe "permission denied" en todo).
- Fee payer con SOL en devnet (verificar con `balance.cjs` abajo). Si no alcanza, `solana airdrop` o faucet.
- **La keypair del admin** (`6AdUWfFL…diQ` = upgrade authority, la tiene Misael) o Misael online para correr `set-provider-verified`. Sin eso el médico no puede firmar `issue_record`/`grant_access` (todo lo demás sí funciona).
- Dos cuentas: paciente y médico. Mails distintos; `tu+doctor@gmail.com` funciona si Gmail respeta el alias.

## Scripts helper (recrearlos si no están)

`balance.cjs` en `hcd_api/` — corre con `node`:

```js
const { Connection, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const env = require('fs').readFileSync('.env', 'utf8');
const get = (k) => env.match(new RegExp('^' + k + '=(.*)$', 'm'))[1].trim();
const c = new Connection(get('SOLANA_RPC_URL'), 'confirmed');
const kp = Keypair.fromSecretKey(bs58.decode(get('FEE_PAYER_SECRET')));
c.getBalance(kp.publicKey).then((b) => console.log(kp.publicKey.toBase58(), (b / 1e9).toFixed(4), 'SOL'));
```

`check-pda.cjs` — verifica PatientProfile/Provider por wallet:

```js
const { Connection, PublicKey } = require('@solana/web3.js');
const env = require('fs').readFileSync('.env', 'utf8');
const get = (k) => env.match(new RegExp('^' + k + '=(.*)$', 'm'))[1].trim();
const seed = process.argv[2]; // 'patient' | 'provider'
const wallet = process.argv[3];
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from(seed), new PublicKey(wallet).toBuffer()], new PublicKey(get('PROGRAM_ID')));
new Connection(get('SOLANA_RPC_URL')).getAccountInfo(pda).then((a) =>
  console.log(pda.toBase58(), a ? a.data.length + ' bytes' : 'MISSING'));
```

`clinic-provider.mts` — registra la clínica on-chain (corre con `node` — Node ≥22 corre TS nativo; **no uses `npx tsx`, no está instalado y npx cuelga pidiendo instalar**):

```ts
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const anchor = require('@anchor-lang/core');
const { AnchorProvider, Program, Wallet, web3 } = anchor;
const { Connection, Keypair, PublicKey, SystemProgram } = web3;
const bs58 = require('bs58');
const env = readFileSync('.env', 'utf8');
const get = (k: string) => env.match(new RegExp('^' + k + '=(.*)$', 'm'))![1].trim();
const feePayer = Keypair.fromSecretKey(bs58.decode(get('FEE_PAYER_SECRET')));
const clinic = Keypair.generate();
const conn = new Connection(get('SOLANA_RPC_URL'), 'confirmed');
const program = new Program(JSON.parse(readFileSync('idl/hcd.json', 'utf8')),
  new AnchorProvider(conn, new Wallet(clinic), { commitment: 'confirmed' }));
const tx = await program.methods
  .registerProvider({ clinic: {} }, clinic.publicKey)
  .accountsPartial({
    payer: feePayer.publicKey, authority: clinic.publicKey,
    provider: PublicKey.findProgramAddressSync([Buffer.from('provider'), clinic.publicKey.toBuffer()], program.programId)[0],
    systemProgram: SystemProgram.programId,
  }).transaction();
tx.feePayer = feePayer.publicKey;
tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
tx.sign(clinic, feePayer);
const sig = await conn.sendRawTransaction(tx.serialize());
await conn.confirmTransaction(sig, 'confirmed');
console.log('clinic_wallet:', clinic.publicKey.toBase58()); // guardar: es el `organization` del médico
console.log('signature:', sig);
```

SQL útil (psql por el pooler, password de `DATABASE_URL`):

```sql
-- usuarios y enrolamiento
select id, role, left(wallet_pubkey,10) as wallet, wallet_verified_at is not null as verified from app_user;

-- convertir cuenta en médico verificado (user_id + wallet de la query anterior)
with org as (insert into organizations (name, kind) values ('Clinica E2E','clinic') returning id),
upd as (update app_user set role='doctor', organization_id=(select id from org) where id='<USER_ID>' returning id)
insert into doctors (user_id, organization_id, license_number, specialty, wallet_pubkey, verified)
select '<USER_ID>', org.id, 'MN 99.001', 'Clinico', u.wallet_pubkey, true from org, app_user u where u.id='<USER_ID>';

-- verificación de cada paso
select code, patient_wallet, expires_at > now() as valid from patient_codes;
select status, reason, created_at from access_requests;
select id, title, status, record_pda from records;
select event_type, tx_signature from audit_events order by created_at desc;
```

## 1. Paciente

1. **Login** en `http://localhost:3000/login` (browser directo, no preview/proxy — los WebSockets y locks de Supabase fallan por proxy). Magic link o Google si está habilitado.
   - *Si Gmail se come el OTP* (scanner consume el link de un solo uso, error `otp_expired`): generá sesión por admin API — `PUT /auth/v1/admin/users/<id>` con `{"password":"<temp>","email_confirm":true}`, luego `POST /auth/v1/token?grant_type=password` con la anon key, y pegá el JSON de sesión en `localStorage["sb-<project-ref>-auth-token"]` en consola. O simplemente pedí el link y abrilo lo antes posible.
2. **Enrolamiento**: la app crea la wallet Privy, pide firmar el challenge en el modal (acción del usuario, nunca automática) y verifica. Verificar: `app_user` con `wallet_verified_at` seteado.
3. **`register_patient`**: la app firma el alta on-chain solo si el PatientProfile PDA no existe (chequeo previo, no pide firma de nuevo). Verificar: `node check-pda.cjs patient <wallet>` → ~57 bytes.
4. **Mi QR** (`/qr`): código `SAL-XXXX` real, vence a los 2 min. Verificar: fila en `patient_codes` ligada a la wallet del paciente. **Generá uno fresco justo antes del lookup** — vence rápido.

## 2. Médico

1. Segunda cuenta (incógnito): login + enrolamiento + `register_patient` igual que el paciente.
2. **Setup DB** (el agente, SQL de arriba): org + `app_user.role='doctor'` + `doctors` row con `verified=true`, `license_number`, `wallet_pubkey`.
3. **Clínica on-chain**: `node clinic-provider.mts` una vez; guardá `clinic_wallet`. Ponelo en `hcd_app/.env` como `NEXT_PUBLIC_DOCTOR_ORG=<clinic_wallet>` y reiniciá el dev.
4. **Provider del médico**: en `/panel` aparece "Activá tu cuenta profesional" → "Registrar en la cadena" → firma. Verificar: `node check-pda.cjs provider <wallet>` → 90 bytes.
5. **Verificación on-chain** (el paso que necesita al admin): `scripts/set-provider-verified.mts <providerPda>` firmado por `6AdUWfFL…`. Si no tenés la keypair, pasale el PDA a Misael.

## 3. El circuito

En este orden (los grants cubren estudios existentes — el upload va **antes** de aprobar):

1. **Médico** `/escanear` → tipea el `SAL-XXXX` (o escanea el QR) → resuelve nombre y cantidad de estudios → **Pedir acceso**. Verificar `access_requests` `pending`.
2. **Médico** `/cargar?code=SAL-XXXX` (o desde la resolución) → subí un PDF sintético → la app cifra en el browser (AES-256-GCM, `iv‖ct+tag`), pide `upload-url`, hace PUT del blob y firma `issue_record`. Necesita el Provider verificado (paso 2.5). Verificar `records` `pending_chain`.
3. **Indexer**: en ~10-30 s baja el evento `RecordIssued` → `records.status='active'` con `record_pda`, y aparece una fila en `audit_events`. Si no baja: el log del API muestra el error de `onLogs`.
4. **Paciente** `/accesos` → la solicitud lista el estudio nuevo → aprobar 24 h → firma un `grant_access` por cada estudio cubierto (un modal por firma). Verificar PDA de grant on-chain y `access_requests.status='approved'`.
5. **Médico** abre el estudio → `POST /keys/release` (autorizado solo con grant vigente on-chain) → unwrap de la DEK con la wallet → descarga → visor muestra **"Es el archivo original"** (SHA-256 del blob descifrado == hash on-chain).
6. **Paciente** `/linea-de-tiempo` → eventos `record_issued`, `access_granted` y el `access_logged` de la apertura del médico, con links al explorer.

## Problemas ya vistos (chequeá antes de debuggear)

| Síntoma | Causa | Fix |
|---|---|---|
| `permission denied for table app_user` | Migraciones aplicadas como `postgres` por el pooler → faltan default privileges | Migración `20261014_role_privileges.sql` |
| Modal de firma "Something went wrong" | Blockhash expirado (modal abierto >90 s) | Retry o recargar — el build rehace la tx |
| Firma pedida en cada navegación | `register_patient` se reintentaba siempre | La app ya chequea el PDA on-chain antes de pedir firma |
| `No RPC configuration found for chain solana:mainnet` | Privy 3.x exige `config.solana.rpcs` + `chain` explícito | Provider configurado con `solana:devnet` |
| `otp_expired` al abrir el magic link | Scanner de Gmail consume el OTP | Sesión por admin API (paso 1.1) o abrir el link al instante |
| `provider is not enabled` en Google | Google OAuth deshabilitado en el proyecto Supabase | Usar magic link o habilitarlo en el dashboard |
| `/login` u otra ruta da 404 en dev | `.next` corrupto tras matar el dev a medias | `rm -rf .next && npm run dev` |
| `next dev` "existing server" | PID viejo sostiene el lock | `taskkill /PID <pid> /F` (en cmd, o `cmd //c` desde git-bash) |
| `npx tsx` cuelga | tsx no instalado, npx espera el prompt | `node archivo.mts` (Node ≥22 strip-types nativo) |
| "Restoring your session…" infinito en el preview | `navigator.locks` + proxy | Usar `localhost:3000` directo en Chrome |
| `issue_record`/`grant_access` rechazado on-chain | Provider del médico sin `verified` | `set-provider-verified` con la wallet admin |

## Reporte esperado

Tabla por paso: OK / falló (con error exacto y paso para reproducir). Evidencia: pubkeys (patient/provider/record/grant PDAs), firmas de tx en `explorer.solana.com/?cluster=devnet`, filas DB (`patient_codes`, `access_requests`, `records`, `audit_events`), y screenshot del visor con "Es el archivo original". Limitación conocida: un grant revocado sigue listándose activo hasta su expiración natural (el indexer no actualiza `access_requests`).
