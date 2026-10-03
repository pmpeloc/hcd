# HCD · Historial Clínico Digital

Patient-owned health records on Solana. Doctors get time-bound access via QR consent; records stay encrypted off-chain with signed hashes on-chain.

Built for the Superteam Argentina hackathon (Road to Colosseum).

📊 **Pitch deck (Spanish):** https://claude.ai/artifact/KoaaYCW2DJJAyeZpHPSB5S — idea, architecture diagram, user flow, Solana stack, prior Colosseum projects and legal framework.

> 🚧 Early stage: the repository currently holds the team's rules and project docs. Code is coming.

## Team

| Member | Role |
|---|---|
| Misael | Developer |
| Maximiliano | Developer |
| Franco | Developer |
| Matías | Founder (also developer) |
| Rodrigo | Founder |

## Onboarding (every team member, once per computer)

**1. Clone the repo**

```sh
git clone https://github.com/pmpeloc/hcd.git
cd hcd
```

**2. Turn on the team's git hooks**

```sh
git config core.hooksPath .githooks
```

**3. Tell git who you are** (use your own slug: `misael`, `matias`, `maximiliano`, `franco` or `rodrigo`)

```sh
git config hcd.member rodrigo
```

**4. Check it works**

```sh
git config hcd.member          # should print your slug
git config core.hooksPath      # should print .githooks
```

**5. Read the rules:** [`AGENTS.md`](AGENTS.md) and [`docs/README.md`](docs/README.md).

If you use an AI coding agent (Claude Code, Codex, Cursor, Devin, Copilot, Gemini…), it reads `AGENTS.md` and follows these rules on its own. Just ask it to work and commit as usual.

## Rules in short

- **English everywhere** (code, comments, commits, PRs). Only `docs/` is in Spanish.
- **Commit messages:** [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(consent): add time-bound access grant`. No accents or ñ.
- **Every commit that touches code also updates your docs:** `docs/miembros/<you>/bitacora.md` (one entry per commit, newest first) and `estado.md` (what you are working on). Ideas go in `ideas.md`.
- The hooks block commits that break these rules. **Never use `--no-verify`.**
- **No medical data on-chain, and never real patient data in the repo.**

## Project docs (Spanish)

- [Vision](docs/proyecto/vision.md) · [Architecture](docs/proyecto/arquitectura.md) · [Research](docs/proyecto/investigacion.md) · [Decisions](docs/proyecto/decisiones.md)
- [Team and status of each member](docs/equipo.md)
