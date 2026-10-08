# Ideas · Maximiliano

La más nueva arriba.

## 2026-10-08 · Formato del archivo guardado: `iv || cifrado`
- **Problema:** `/keys/release` devuelve la DEK, la URL firmada y `content_hash`, pero ningún lado guarda el IV del archivo (lo genera `encryptFile` de `lib/crypto`). Sin el IV no se puede descifrar.
- **Propuesta:** el objeto en Storage es `iv(12) || ciphertext+tag`, igual que `records.wrapped_dek` en el servicio de llaves, y `content_hash` (y el `content_hash` de `issue_record`) es el SHA-256 de **esos bytes**. Así lo que se descarga es exactamente lo que se verifica, y no hace falta otra columna.
- **Dónde está:** `hcd_app/components/viewer/sealed-file.ts` (`sealFile`, `openSealed`); lo usan la carga y el visor.
- **A confirmar con:** Franco (dueño de `lib/crypto`, podría moverlo ahí) y Mati (`/records`: no tiene que hacer nada más que guardar los bytes tal cual).
