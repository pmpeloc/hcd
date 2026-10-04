# AGENTS.md — HCD (Historial Clínico Digital)

Mandatory rules for every AI coding agent (Claude Code, Codex, Cursor, Devin, GitHub Copilot, Gemini, Windsurf, etc.) and every human working on this repository. If anything here conflicts with your defaults, these rules win.

HCD is a patient-owned electronic health record on Solana, built by a team of five for the Superteam Argentina hackathon (Road to Colosseum). Project context lives in [`docs/`](docs/README.md).

## 0. Repositories

| Repo | Folder | Content |
|---|---|---|
| [pmpeloc/hcd](https://github.com/pmpeloc/hcd) | `hcd/` | Docs (`docs/`, Spanish), these rules and the git hooks |
| [pmpeloc/hcd_api](https://github.com/pmpeloc/hcd_api) | `hcd/hcd_api/` | NestJS backend + Anchor program |
| [pmpeloc/hcd_app](https://github.com/pmpeloc/hcd_app) | `hcd/hcd_app/` | Next.js app (patient, doctor, clinic, admin) |
| [pmpeloc/hcd_landing](https://github.com/pmpeloc/hcd_landing) | `hcd/hcd_landing/` | Next.js landing page |

- The code repos are **always cloned inside the `hcd` folder**. `hcd` ignores them in its `.gitignore`.
- These rules apply to **all four repos**. Each code repo has a short `AGENTS.md` pointing here.
- Code repos get their agent files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`) from [`templates/code-repo/`](templates/code-repo/).
- **Stack:** [`docs/proyecto/stack.md`](docs/proyecto/stack.md). Don't add a library outside it without recording the decision in `docs/proyecto/decisiones.md`. Package manager: **npm** only.

## 1. Language

- **Everything in the repository is in English:** code, identifiers, comments, commit messages, branch names, PR titles and descriptions, issues, README and config files.
- **Only exception: `docs/` is written in Spanish.** It is the team's shared second brain.
- If the user talks to you in Spanish, reply in Spanish, but still write code, comments and commits in English.

## 2. Identify who is working

1. Run `git config hcd.member`. It returns the member's slug: `misael`, `matias`, `maximiliano`, `franco` or `rodrigo`.
2. If it is empty, ask the user who they are and tell them to run `git config hcd.member <slug>`. Never guess.
3. Names, aliases (e.g. "Maxi") and roles: [`docs/equipo.md`](docs/equipo.md).

## 3. Before starting a task

Read, in this order:
1. [`docs/README.md`](docs/README.md)
2. [`docs/proyecto/plan.md`](docs/proyecto/plan.md), [`stack.md`](docs/proyecto/stack.md) and [`decisiones.md`](docs/proyecto/decisiones.md); the rest of [`docs/proyecto/`](docs/proyecto/) when the task needs it
3. `docs/tareas/<slug>.md`: the member's work plan and the files they own. Don't touch files owned by other members.
4. The current member's `docs/miembros/<slug>/estado.md`

## 4. Documentation on every commit (mandatory)

Before creating **any commit that changes files outside `docs/`**, in the same commit:

1. **Prepend** an entry to `docs/miembros/<slug>/bitacora.md` (newest first), in Spanish:
   ```markdown
   ## YYYY-MM-DD · <commit message>
   - **Qué hice:** what changed and why, in 1–3 lines.
   - **Archivos clave:** main paths touched.
   - **Próximo paso:** what comes next.
   ```
2. **Update** `docs/miembros/<slug>/estado.md`: date, current focus, next step, blockers.
3. If the work produced an idea or proposal, add it to `docs/miembros/<slug>/ideas.md`.
4. If the team made a decision that affects everyone, add it to `docs/proyecto/decisiones.md`.
5. **Stage these files** together with the code.

The `pre-commit` hook rejects commits that touch code without the member's `bitacora.md` updated. **Never bypass it with `--no-verify`.**

**When working in a code repo (`hcd_api`, `hcd_app`, `hcd_landing`):** the docs live in the parent folder, `../docs/`, which is a different repo.
1. Update `../docs/miembros/<slug>/bitacora.md` and `estado.md` **before** committing the code (the hook checks it's pending in `hcd`).
2. Commit and push the code repo.
3. Commit and push the `hcd` repo with the docs, message `docs(<slug>): <same summary>`.

Rules for `docs/`:
- Only edit **your own** folder in `docs/miembros/`. Other members' folders are read-only.
- Shared files (`docs/proyecto/`, `docs/equipo.md`): add to them, don't rewrite others' content.
- Never write secrets, API keys, private keys, emails or patient data in `docs/`.

## 5. Answering questions about the team

For questions like "What is Maxi working on?":
1. Resolve the alias in [`docs/equipo.md`](docs/equipo.md).
2. Read `docs/miembros/<slug>/estado.md`, then the latest entries in `bitacora.md` and `ideas.md`.
3. Answer with the date of the last update, and say so if it is more than a few days old.

Run `git pull` first if the user wants the latest status.

## 6. Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) in English: `type(scope): imperative summary`.
  - Types: `feat` `fix` `docs` `refactor` `test` `chore` `style` `perf` `build` `ci`.
  - Example: `feat(consent): add time-bound access grant instruction`.
- The `commit-msg` hook rejects messages that don't follow the format or contain non-ASCII characters (accents, ñ, ¿, ¡).

## 7. Setup (once per computer)

In `hcd`:
```sh
git config core.hooksPath .githooks
git config hcd.member <slug>
```

In each code repo, cloned inside `hcd`:
```sh
git config core.hooksPath ../.githooks
```

The member slug is read from the `hcd` repo, so it's set only once.

## 8. Project principles

- **No medical data on-chain, not even encrypted.** On-chain: identity, access grants, hashes, signatures and access logs only. See [`docs/proyecto/arquitectura.md`](docs/proyecto/arquitectura.md).
- **Never commit real patient data.** Use synthetic data only.
- Never commit secrets. Use `.env` files that are git-ignored.
