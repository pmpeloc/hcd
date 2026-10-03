# Docs de HCD · segundo cerebro del equipo

Esta carpeta es la memoria compartida del proyecto **HCD · Historial Clínico Digital**. Es lo único del repo que está en español; código, comentarios y commits van en inglés (ver [AGENTS.md](../AGENTS.md)).

📊 **Presentación del proyecto:** https://claude.ai/artifact/KoaaYCW2DJJAyeZpHPSB5S
Idea, diagrama de arquitectura, flujo de uso, herramientas de Solana, precedentes en Colosseum y marco legal. Es la mejor forma de entender el proyecto en 10 minutos; el contenido también está en texto en [`proyecto/`](proyecto/).

Se puede abrir como bóveda de Obsidian (abrir la carpeta `docs/` como vault). Los links son relativos para que también funcionen en GitHub.

## Cómo funciona

- Cada integrante tiene su carpeta en [`miembros/`](miembros/) con tres archivos:
  - `estado.md`: en qué está ahora, qué sigue y qué lo bloquea. Siempre al día.
  - `bitacora.md`: una entrada por commit, la más nueva arriba.
  - `ideas.md`: ideas y propuestas que va dejando.
  - `relevamientos/` (opcional): investigaciones largas, por ejemplo conversaciones con IA hechas fuera del repo. Un archivo por tema: `AAAA-MM-DD-tema.md`.
- Con cada commit que toca código, el agente (o la persona) actualiza su `bitacora.md` y su `estado.md` en el mismo commit. El hook `pre-commit` no deja commitear si falta.
- Las decisiones que afectan a todos van en [`proyecto/decisiones.md`](proyecto/decisiones.md).
- Cada uno edita solo su carpeta. En los archivos compartidos se agrega, no se reescribe lo de otros.

## Mapa

| Archivo | Qué tiene |
|---|---|
| [equipo.md](equipo.md) | Integrantes, alias, roles y carpeta de cada uno |
| [proyecto/vision.md](proyecto/vision.md) | Qué es HCD, para quién y modelo de negocio |
| [proyecto/arquitectura.md](proyecto/arquitectura.md) | Arquitectura propuesta: capas, servicios, datos y flujo |
| [proyecto/investigacion.md](proyecto/investigacion.md) | Herramientas de Solana, precedentes en Colosseum y marco legal |
| [proyecto/decisiones.md](proyecto/decisiones.md) | Registro de decisiones del equipo |

## Onboarding (una vez por compu)

```sh
git clone https://github.com/pmpeloc/hcd.git
cd hcd
git config core.hooksPath .githooks   # activa los hooks del equipo
git config hcd.member <tu-slug>       # misael, matias, maximiliano, franco o rodrigo
```

Para verificar: `git config hcd.member` tiene que mostrar tu slug y `git config core.hooksPath` tiene que mostrar `.githooks`. Detalle completo en el [README del repo](../README.md).

## Recursos

- Presentación del proyecto: https://claude.ai/artifact/KoaaYCW2DJJAyeZpHPSB5S
- Repo: https://github.com/pmpeloc/hcd
- Recursos del evento Colosseum: https://colosseum.com/worldsfair/resources
