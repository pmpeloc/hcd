# Arquitectura propuesta

> Propuesta inicial (2026-10-03). Si se cambia algo, registrarlo en [decisiones.md](decisiones.md).

## Principio de diseño

**Nada médico en la cadena, ni siquiera cifrado.**

- La Ley 25.326 trata la salud como dato sensible, con derecho a rectificar y suprimir. Una cadena no borra.
- Un cifrado de hoy puede romperse en 20 años, y lo publicado en la cadena queda para siempre.
- En la cadena va solo lo que prueba algo: identidad, permisos, hashes, firmas y registro de accesos.

## Capas

| Capa | Componente | Responsabilidad |
|---|---|---|
| Usuarios | Paciente · Médico · Clínica/aseguradora | App móvil o PWA · escaneo de QR · panel web |
| Aplicación | Frontend Next.js (PWA) | App del paciente, vista del médico y panel. Cifra cada estudio en el navegador antes de subirlo. |
| Servicios | API backend (Node.js) | Lógica de la SaaS |
| Servicios | Servicio de llaves | Entrega la llave de un estudio solo si el permiso está vigente en Solana |
| Servicios | Privy | Alta e inicio de sesión con email o Google; crea la billetera sin que el usuario sepa de cripto |
| Datos | PostgreSQL (ej. Supabase) | Usuarios, clínicas y metadatos. Nunca datos médicos en claro. |
| Datos | Almacenamiento de objetos (S3 o R2) | Documentos cifrados. Tiene que poder borrarse. |
| Datos | Solana · programa Anchor | Identidad del paciente, registro de prestadores, permisos con vencimiento, hash y firma por estudio, registro de accesos |
| Datos | Arcium (opcional) | Cálculos sobre datos cifrados, ej. que la aseguradora verifique un estudio sin ver el resultado |

## Cuentas del programa Anchor (borrador)

- `Patient`: identidad del paciente.
- `Provider`: prestador verificado.
- `Grant`: `{ grantee, scope, expires_at }`. El vencimiento se valida contra el reloj de la red.
- `RecordRef`: `{ hash, storage_uri, provider_signature }`.
- Eventos de acceso para auditoría.

## Cifrado y vencimiento real del acceso

Una vez que el médico descifró un estudio, ya lo tiene. El vencimiento en la cadena solo controla las **próximas** entregas de llaves. Por eso:

1. Cada estudio se cifra con su propia llave.
2. Esa llave se cifra para el paciente y para cada médico autorizado (CareChain lo implementó así).
3. Un servicio de llaves revisa el permiso en la cadena antes de entregarla: uno propio, Arcium o Lit.

Borrado: destruir la llave ("borrado criptográfico") y borrar el archivo del almacenamiento.

## Flujo de uso

1. **Alta:** entra con email o Google vía Privy; se crea su identidad en Solana.
2. **Carga de un estudio:** se cifra en el navegador, va al almacenamiento y su hash firmado, a Solana.
3. **QR en la consulta:** el paciente muestra un QR y el médico lo escanea.
4. **Permiso:** el paciente aprueba y se crea en Solana un permiso con vencimiento.
5. **Acceso:** el servicio de llaves verifica el permiso y el médico ve el estudio.
6. **Vencimiento:** pasado el plazo no se entregan más llaves; el acceso queda registrado.
