---
name: anchor-check
description: Corre anchor build y anchor test en WSL sobre el programa Solana de Salua/HCD y reporta errores de forma resumida. Útil para revisar el trabajo del compañero que escribe el programa Anchor.
---

# anchor-check

## Pasos
1. En Windows el programa se compila en WSL, pero NO sobre `/mnt/d` (falla por permisos si falta `options = "metadata"` en `/etc/wsl.conf`). Trabajar sobre una copia en el home de WSL:
   `wsl -e bash -lc "rsync -a --delete --exclude node_modules --exclude target --exclude .git --exclude dist /mnt/d/hackathon/hcd/hcd_api/ ~/hcd_api/"`
2. Ejecutar dentro de WSL: `wsl -e bash -ic "cd ~/hcd_api && anchor build"` (`-i` carga nvm para tener `node`).
3. Si compila, `wsl -e bash -ic "cd ~/hcd_api && anchor test"`.
4. Si hay un IDL generado (`target/idl/*.json`), compararlo con el IDL que usa el cliente (`lib/hcd-client/`) e informar diferencias en nombres de instrucciones, cuentas y argumentos.

## Reporte
- Resultado: OK / falla en build / falla en test.
- Máximo 15 líneas: primer error real (no todo el log), archivo:línea, causa probable.
- Advertencias de seguridad que veas en el código (signers sin validar, PDAs mal derivadas).
- No modifiques el programa; solo reportá. Los arreglos los hace quien lo escribió.

## Notas
- Si falta la toolchain en WSL (rustc, solana, anchor), listá qué falta y el comando de instalación; no instales sin avisar.
