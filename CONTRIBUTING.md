# Contributing

Personal project, but open to ideas and PRs. A few conventions to keep the history readable.

## Before committing

- **Backend:** `dotnet test` (repo root) must pass.
- **Frontend:** `npx tsc --noEmit` (inside `frontend-react/`) must come back clean.
- If the change touches UI, test it manually in the browser before calling it done — automated tests don't cover that.

## Never commit secrets

- The RAWG key (`Rawg:ApiKey`) **never** goes into `appsettings.json` or any versioned file — only via `dotnet user-secrets` (lives outside the repo, under `%APPDATA%`/`~/.microsoft/usersecrets`).
- Before a `git add -A` or `git commit`, glance at `git status`/`git diff` — especially if you touched `appsettings*.json` or added a new config file.
- If a secret gets committed by accident: **rotate it first**, clean up the history after — the commit alone isn't enough once it's already been pushed.

## Commit messages

Format: `type(scope): short imperative description`

Types used in this project: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.

```
feat(catalog): similar games section on the game detail page
fix(front): fix review text disappearing from a race condition
refactor(library): encapsulate completion-flags business rule
```

- Short subject line (no trailing period) saying **what**.
- Optional body (blank line after the subject) explaining **why** — only when the reason isn't obvious from the diff itself. Don't narrate the diff line by line.

## Branches and PRs

Small/own changes: straight to `master`. External contributions: fork → descriptively-named branch → PR against `master`, following the same commit convention above.

## Where to propose ideas

Feature ideas and suggestions go in GitHub [issues](../../issues), not the README — keeps the main docs focused and centralizes discussion in one place.
