---
name: e2e-smoke
description: Test Salua on devnet with a patient, an issuing doctor and a separate reading doctor. Verify issuance, consent, key release, integrity, audit and revocation.
---

# e2e-smoke · Salua devnet integration

Run only when the user requests the live smoke. Reading this guide is not permission to execute it. Use synthetic documents and dedicated test accounts. Do not commit smoke artifacts or credentials. Mark each step PASS, FAIL or BLOCKED; setup success is not a full E2E pass.

## 0. Prerequisites

- Node.js 24, npm, and code repos nested inside `hcd`. Check local changes before updating staging; never discard another contributor's work.
- App #14 supplies devnet configuration and registration. Its registration recovery review must be addressed or reported as a blocker. API #23 supplies the clinic helper. Verify current merge status rather than assuming either is on staging.
- Obtain API configuration privately. Compare variable names only against `hcd_api/.env.example`: database and Supabase settings, devnet RPC, program ID, distinct fee-payer/key-service secrets, `MASTER_KEY`, `RECORDS_TOKEN_SECRET`, `STORAGE_BUCKET`, and enrollment/CORS origins. Preserve shared encryption secrets; replacing `MASTER_KEY` makes existing wrapped keys unreadable. Enable the indexer.
- App variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_PRIVY_APP_ID`, `NEXT_PUBLIC_API_URL=http://localhost:3001`, `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_PROGRAM_ID`, and `NEXT_PUBLIC_DOCTOR_ORG`. Restart after changes. Disable `NEXT_PUBLIC_DEMO_RECORDS` for live testing. Never put secrets in public variables.
- Confirm API and app use the same Supabase project, program and devnet. Check fee-payer balance without printing its secret. Never operate on mainnet.
- The DB and deployed program are shared. Do not migrate, deploy, rotate keys or change global grants during routine smoke setup. Ask the administrator to confirm migrations and effective privileges.
- **Unresolved dependency:** previous notes mention `20261014_role_privileges.sql`, absent from API staging and API #23 as reviewed on 2026-10-10. Ask Franco/Misael for the committed migration or reviewed equivalent and confirmation of the shared database state. Mark affected steps BLOCKED if privileges cannot be established. Do not invent blanket grants or disable RLS.
- Install locked dependencies if needed. Start the API with `npm run start:dev` inside `hcd_api` and the app with `npm run dev` inside `hcd_app`. Confirm the indexer subscription. Use `http://localhost:3000` directly, not a preview proxy.

## 1. Three identities

| Identity | Purpose | On-chain requirement |
|---|---|---|
| Patient P | Owns the record and signs consent/revocation | PatientProfile |
| Doctor A | Issues the synthetic record | Verified doctor Provider |
| Doctor B | Requests and reads A's record | Separate verified doctor Provider |

Use three distinct Supabase users and wallets, with separate browser profiles. A clinic Provider is an additional organizational account, not a substitute for B. Check the visible identity before every signature.

For each account, log in and approve the Privy enrollment challenge. Confirm matching `app_user.wallet_pubkey` and populated `wallet_verified_at`. Confirm the PatientProfile PDA exists after `register_patient`; wallet enrollment alone is not on-chain registration. Cancelled signatures and RPC errors are not success. Never sign automatically for the user.

If a magic link expires, request a fresh one. Do not silently reset passwords or confirm emails. An administrator-assisted password workaround requires explicit authorization for that dedicated synthetic account; never apply it to teammates' or real users' accounts. Never output session tokens.

### 1.1 Doctor database setup

Confirm the two dedicated doctor user IDs before targeted writes. Enroll them first. Run this template separately for A and B with distinct synthetic license numbers. If the doctor already exists, inspect and reuse the setup instead of rerunning it.

```sql
begin;
with org as (
  insert into organizations (name, kind)
  values ('Synthetic E2E Clinic', 'clinic') returning id
), updated_user as (
  update app_user
  set role = 'doctor', organization_id = (select id from org)
  where id = '<DOCTOR_USER_ID>'::uuid
    and wallet_verified_at is not null and wallet_pubkey is not null
  returning id, organization_id, wallet_pubkey
)
insert into doctors
  (user_id, organization_id, license_number, specialty, wallet_pubkey, verified)
select id, organization_id, '<UNIQUE_SYNTHETIC_LICENSE>', 'Clinico', wallet_pubkey, true
from updated_user;
-- Check exactly one inserted row before choosing COMMIT; otherwise ROLLBACK.
```

Verify the intended user, wallet and organization in both tables. Database verification does not replace on-chain verification. Refresh the profile/session after a role change. The setup template creates one DB organization per doctor; the smoke can use the same on-chain clinic authority for both.

### 1.2 Clinic and doctor Providers

Reuse a known dedicated smoke clinic when possible. Otherwise use `scripts/register-clinic-provider.mts` from API #23 once, from `hcd_api`. It reads the program address from `idl/hcd.json` and currently expects a base58 fee-payer secret; confirm these match the environment. It prints a disposable clinic secret: **never expose raw output in agent logs, chat or recordings**. For a disposable smoke clinic, forward only public evidence in PowerShell:

```powershell
node scripts/register-clinic-provider.mts | Select-String '^(clinic_wallet|provider_pda|signature):'
```

If the authority must be retained, its operator must arrange secure storage separately. Never use a disposable authority for production. Set `NEXT_PUBLIC_DOCTOR_ORG` to `clinic_wallet`, not `provider_pda`, and restart the app.

For A and B, open `/panel`, activate the professional account and approve `register_provider`. Check Provider authority, type, organization and verification status. Reuse an existing account rather than registering it twice.

Send Misael both doctor authority wallets, optionally with their PDAs as evidence. From `hcd_api` in the admin's environment, the actual command is:

```sh
node scripts/set-provider-verified.mts <DOCTOR_AUTHORITY_WALLET> true
```

The script derives the PDA and requires the boolean. The signer must match current `Config.admin`; do not assume a historical upgrade authority still holds that role. Keep the admin key with its owner. Confirm both Providers have `verified=true`. Otherwise mark issuance/grant steps BLOCKED.

## 2. One consuming action per QR

The short `SAL-XXXX` alias and signed token share a nonce. Lookup does not consume it; `POST /records/upload-url` and `POST /access-requests` do. Generate a **new code per consuming action**, even before the two-minute expiry. Failed uploads may already have consumed a code/reservation; obtain fresh authorization instead of replaying it. Do not publish active codes.

## 3. Ordered circuit

1. **Issue (A + P).** P generates a fresh QR. A resolves it and uploads a synthetic PDF without first choosing “Pedir acceso” with that code. The browser seals AES-256-GCM output as `iv || ciphertext || tag`. Upload through `/records/upload-url`, register through `/records`, and approve `issue_record` as A. `storage_ref` must be the lowercase `records.id` UUID. Record public transaction signature and Record PDA only.
2. **Index.** Confirm the transaction, `records.status='active'`, `record_pda` and the `record_issued` audit event. `pending_chain` is not completed issuance. Wait with a bounded timeout and diagnose the indexer if it does not advance.
3. **Deny before consent (B).** Make an authenticated `POST /keys/release` for that `record_id` as B. Expect 403 and no DEK/download URL. Do not use A: the issuer can reread without a grant. Keep credentials and response secrets out of output.
4. **Request (B + P).** P generates another fresh QR. B resolves it and requests access. Confirm the pending request belongs to B and P. This consumes the second code.
5. **Grant (P).** Approve B's request in `/accesos`, choose a duration and sign every `grant_access` for the existing covered records. Confirm Record PDA, B's wallet and expiry on-chain; API request status alone does not prove every signature completed.
6. **Read (B).** Open A's record. `/keys/release` must validate the grant and confirm `log_access` before releasing keys. The service unwraps the DEK, not the wallet. The browser compares SHA-256 of the **sealed encrypted bytes** with the on-chain hash before decryption. Confirm chain-hash retrieval succeeded instead of relying on the API-hash fallback. Expect the original synthetic document and integrity indicator.
7. **Audit.** Confirm B's key-release row has `role='doctor'`, `log_access_status='confirmed'` and the matching signature. Confirm `access_logged` and the grant's incremented `access_count`. Correlate by this run's Record/Grant PDAs and signature, not the latest global row. Verify patient timeline evidence and devnet explorer links.
8. **Revoke (P), deny (B).** Sign `revoke_access`, wait for confirmation and inspect grant state. Make a **new** key-release request as B: expect 403 without DEK/URL. Closing an already-open viewer is not this test. Revocation cannot erase previously received files or keys.
9. **Expiry.** Create another grant using the API's shortest supported duration: 3600 seconds (one hour; the other options are 24 hours and seven days). Confirm a permitted release before expiry, then wait until on-chain expiry and request again as B: expect 403. Do not alter clocks or shared configuration. If time prevents this check, report BLOCKED rather than PASS.
10. **Owner/issuer controls.** P and A can request keys for their active record without B's grant. Expect `role='patient'` / `role='issuer'`, `log_access_status='skipped'` and no new `log_access`. These reads do not validate third-party consent.

## 4. Troubleshooting

| Symptom | Response |
|---|---|
| Postgres permission denied | Confirm role and exact missing privilege with the administrator; resolve section 0's migration dependency. No broad grants. |
| Privy missing RPC configuration | Check #14's devnet RPC and signing chain; restart after environment changes. |
| Enrollment succeeds but PatientProfile is absent | Check cancelled signing/RPC errors and registration confirmation; use the corrected retry UI. |
| Used/expired QR | Generate a fresh code for that operation. Request and upload cannot share a nonce. |
| Provider unverified | Ask the current admin to verify the correct authority wallet using section 1.2. |
| No access_logged | Check reader is B, not P/A, and inspect the correlated release role. |
| Key release 503 | Fail-closed: no keys without confirmed access log. Retry after recovery; do not interrupt shared RPC services for fault injection. |
| Expired transaction | Rebuild and request a new signature; never replay expired bytes. |
| Expired OTP / disabled Google | Request a fresh supported login method. No automatic credential changes. |
| Dev-server lock/port busy | Identify process and directory; stop only this smoke's process, never unrelated processes. |
| Revoked grant still visible | Compare confirmed on-chain state and a fresh release response. Report stale UI/indexer state separately. |

## 5. Evidence and completion

For each step report expected/actual result, PASS/FAIL/BLOCKED and reproducible errors. Include only public test wallets, PDAs, signatures, scoped row IDs/statuses and synthetic screenshots. Transaction links: `https://explorer.solana.com/tx/<signature>?cluster=devnet`. No environment values, passwords, bearer tokens, DEKs, private keys, active codes or signed download URLs.

List exact repo commits, unresolved prerequisites and unexecuted steps. A full pass requires B's authorized access plus denial before consent, after revocation and after expiry, with corresponding audit evidence. Never label a two-account issuer read a successful third-party E2E smoke.
