# Zerei 🎮

> Your game shelf. Track everything you've played — any platform, replays included — and see your gaming history as stats.

A "Letterboxd / Goodreads for video games", focused on **logging your own history** (not just a backlog or reviews): each game can have multiple **playthroughs** (platform, year, hours, status), and your profile aggregates it all into stats.

## Stack

| Layer | Tech |
|---|---|
| Backend | **.NET 8** (ASP.NET Core, EF Core, JWT, BCrypt) |
| Database | **PostgreSQL** (native service — not containerized) |
| Frontend | **React 19** (Vite, TypeScript) + **Mantine** + **TanStack Query** |
| Orchestration | **.NET Aspire** (AppHost + ServiceDefaults — local telemetry dashboard) |
| Catalog | **RAWG API** (optional — enriches covers, Metacritic, playtime, platforms, genres, DLCs) |

## Data model

```
Jogo            global catalog (name, year, cover, genres, Metacritic, platforms, DLCs, RAWG id)
 └─ UsuarioJogo user↔game link (overall status, rating, favorite, review)
     └─ Jogatina  each playthrough (platform, year, hours, status, replay?)

Usuario ↔ Seguidor  follow / followers
```

The same game can have **multiple playthroughs** — e.g. *Final Fantasy X* beaten on PS2 in 2005 **and** replayed on Switch in 2026, each with its own hours and platform.

## How to run

**Prerequisites:** .NET 8 SDK · Node 18+ · PostgreSQL on `localhost:5432` (user `postgres` / password `postgres`)

```bash
cd backend
dotnet ef database update   # creates the "zerei" database and applies migrations
dotnet run --urls http://localhost:5192
```
> On startup, the backend applies migrations and runs the **seed** (genres/platforms bootstrap + ~50 well-known games). Idempotent. Genres/platforms/Metacritic/DLCs also get created dynamically from RAWG as you search — the seed is just the offline fallback.

```bash
cd frontend-react
npm install
npm run dev                 # Vite dev server on http://localhost:5173
```

Or run everything (backend + telemetry dashboard) with Aspire:
```bash
cd Zerei.AppHost
dotnet run
```

Test account: `rafael` / `teste123` (comes with games already tracked), or sign up and go through onboarding.

**Tests:** `dotnet test` from the repo root (32 unit tests covering auth, library, stats, and social/follow logic).

**RAWG (optional):** without a key the app works fine off the seeded catalog (covers show as colored placeholders). Get a free key at rawg.io/apidocs, then set it locally with:
```bash
cd backend
dotnet user-secrets init
dotnet user-secrets set "Rawg:ApiKey" "your-key-here"
```
Restart the backend — it backfills missing covers/metadata via `POST /api/catalogo/sincronizar-capas` and enriches new games automatically on search. **Never commit the key** to `appsettings.json`.

Swagger at `http://localhost:5192/swagger` (Development mode).

## Structure

```
backend/
  Api/            controllers, middleware
  Application/    services, JWT auth, DTOs
  Domain/         entities, enums
  Infrastructure/ DbContext, seed data, RAWG client, migrations
backend.Tests/    xUnit — auth, library, stats, follow
Zerei.AppHost/        .NET Aspire orchestration (backend + telemetry dashboard)
Zerei.ServiceDefaults/ shared OpenTelemetry/health-check wiring
frontend-react/
  src/
    api/          TanStack Query hooks (auth, biblioteca, catalogo, perfil, seguidor)
    components/   Layout, JogoCard, StatusIcon, ProtectedRoute
    context/      AuthContext
    pages/        login, signup, onboarding, home (dashboard), library,
                  game detail, public profile (/u/:username), wrapped
```

## Roadmap

- [x] Gaming Wrapped — shareable yearly recap (Spotify Wrapped-style)
- [x] Social — follow friends
- [x] Public profile page (`/u/:username`)
- [ ] Activity feed
- [ ] Public curated lists ("Best PS2 RPGs")
- [ ] Monthly history timeline
- [ ] Real per-platform achievements (Steam first)
- [ ] "Forgot password" flow (needs an email provider)
- [ ] PWA / mobile
