# Prueba: Privy custom auth (token de Supabase) + wallet embebida de Solana

Spike de 1 hora · 2026-10-05. Responde el pendiente #2 de [stack.md](stack.md).

## Veredicto

**Plan A confirmado.** Privy soporta login con JWT externo ("JWT-based auth") y crea wallets
embebidas de Solana para esos usuarios. Hay receta oficial de Supabase+Privy. Y la verificación
de JWKS ya se corrió (2026-10-05): `GET $SUPABASE_URL/auth/v1/.well-known/jwks.json` devuelve
una clave real `ES256`/`P-256` (`kid: 5acf4b02-…`) — el proyecto de Supabase ya firma los access
tokens con clave asimétrica. No hace falta migrar ni rotar nada.

## Evidencia

- Receta oficial Supabase+Privy: <https://docs.privy.io/recipes/authentication/using-supabase-for-custom-auth>
  — exige JWKS asimétrico y da el provider React completo.
- Config de JWT auth en el dashboard: <https://docs.privy.io/authentication/user-authentication/jwt-based-auth/setup>
  — JWKS endpoint o clave pública + claim de usuario (`sub`). Ojo: hay que **pedir acceso** a
  Custom Auth en Integrations > Plugins.
- SDK: `useSubscribeToJwtAuthWithFlag` / `useSyncJwtBasedAuthState` suscriben al proveedor externo:
  <https://docs.privy.io/authentication/user-authentication/jwt-based-auth/usage>
- Wallets de Solana para el usuario autenticado: `useCreateWallet` y `useWallets` desde
  `@privy-io/react-auth/solana` (<https://docs.privy.io/wallets/wallets/create/create-a-wallet>).
  Server-side: `/v1/users` con `linked_accounts:[{type:"custom_auth", custom_user_id}]` +
  `wallets:[{chain_type:"solana"}]` y `/v1/wallets_with_recovery`.
- **Firmar sin enviar (lo que necesitamos):** `useSignTransaction` / `wallet.signTransaction`
  firman una transacción armada afuera y devuelven la serializada firmada, sin broadcast:
  <https://docs.privy.io/wallets/using-wallets/solana/sign-a-transaction>. Confirma el flujo
  "backend arma con su fee payer → usuario firma → backend co-firma y envía".
- Versión actual: `@privy-io/react-auth` **3.47.0** (publicada 2026-10-02). En v3
  `useSolanaWallets` fue reemplazado por `useWallets`/`useCreateWallet` del entrypoint `/solana`;
  peer dep: `@solana/kit` (ya está en el stack).
- Signing keys de Supabase: <https://supabase.com/docs/guides/auth/signing-keys> — el proyecto
  puede migrar del JWT secret legado a clave asimétrica sin downtime (Migrate → Rotate).

## Verificación del JWKS (resuelta 2026-10-05)

```sh
curl "$SUPABASE_URL/auth/v1/.well-known/jwks.json"
```

Devolvió `{"keys":[{"alg":"ES256","crv":"P-256","kty":"EC","use":"sig","kid":"5acf4b02-660f-477d-92ed-7e40321eb2a0",…}]}`
→ firma asimétrica activa → **plan A, configurar Privy**. (El `alg:HS256` de la anon key es
formato legado de esa key en particular, no del signing del proyecto.)

## Pasos para Mati (plan A)

1. ~~Supabase: verificar JWKS~~ — ya verificado, firma ES256 activa; no hay que rotar nada.
2. Privy dashboard (app `cmutcaaq...`, la del `.env`): Integrations > Plugins → pedir Custom Auth;
   luego User management > Authentication > JWT-based auth: origen **client-side**, JWKS URL
   `$SUPABASE_URL/auth/v1/.well-known/jwks.json`, claim de usuario **`sub`**.
3. `hcd_app/.env`: `NEXT_PUBLIC_PRIVY_APP_ID` (el mismo app id) — el secret solo va en la API.
4. Config del provider (`lib/privy.ts`): `SupabaseProvider` afuera, `PrivyProvider` adentro, y un
   componente con `useSubscribeToJwtAuthWithFlag({isAuthenticated: !!session, isLoading,
   getExternalJwt: async () => session?.access_token})` usando `supabase.auth.getSession()`.
   **No** llamar `useLogin`/`login` de Privy: el login lo hace Supabase.
5. Crear la wallet explícitamente: `createOnLogin` automático solo dispara con el modal de Privy
   (logins whitelabel quedan fuera). Tras autenticar: `const {wallets} = useWallets()` (entrypoint
   `/solana`) y si está vacío `await useCreateWallet().createWallet()`.
6. Firma: backend arma la tx con fee payer → `useSignTransaction({transaction, wallet})` →
   devolver `signedTransaction` al backend para co-firmar y enviar.

## Plan B (si el plan A falla)

Login directo con Privy (email/Google). El backend recibe el access token de Privy, lo verifica
con `PRIVY_APP_ID`/`PRIVY_APP_SECRET` (o JWKS de Privy), obtiene el `sub`/wallet y canjea por un
JWT firmado con la clave de Supabase (`sub` = id de `app_user`, `role: authenticated`) para que
RLS aplique. Con HS256 legado se firma con el JWT secret; con signing keys se importa una clave.
Referencia: <https://supabase.com/docs/guides/auth/jwts>.

## Prueba funcional real (pendiente)

Login Supabase en `hcd_app` → Privy autentica vía custom auth → `createWallet` crea wallet Solana
→ firmar una tx devnet armada por la API con su fee payer → backend co-firma y envía.
