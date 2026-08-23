# Zerei 🎮

> Your game shelf. Track everything you've played — any platform, replays included — and see your gaming history as stats.

A "Letterboxd / Goodreads for video games", focused on **logging your own history** (not just a backlog or reviews): each game can have multiple **playthroughs** (platform, year, hours, status), and your profile aggregates it all into stats.

## Stack

| Layer | Tech |
|---|---|
| Backend | **.NET 8** (ASP.NET Core, EF Core, JWT, BCrypt) |
| Database | **PostgreSQL** |
| Frontend | **Angular 19** (standalone, signals) + **PrimeNG 19** (Aura dark theme) |
| Catalog | **RAWG API** (optional — enriches covers/metadata) |

## Data model

```
Jogo            global catalog (name, year, cover, genres, RAWG id)
 └─ UsuarioJogo user↔game link (overall status, rating, favorite, review)
     └─ Jogatina  each playthrough (platform, year, hours, status, replay?)
```

The same game can have **multiple playthroughs** — e.g. *Final Fantasy X* beaten on PS2 in 2005 **and** replayed on Switch in 2026, each with its own hours and platform.

## How to run

**Prerequisites:** .NET 8 SDK · Node 18+ · PostgreSQL on `localhost:5432` (user `postgres` / password `postgres`)

```bash
cd backend
dotnet ef database update   # creates the "zerei" database and applies migrations
dotnet run --urls http://localhost:5192
```
> On startup, the backend applies migrations and runs the **seed** (19 genres, 26 platforms, ~50 well-known games). Idempotent.

```bash
cd frontend
npm install
npm start                   # ng serve on http://localhost:4200
```

Test account: `rafael` / `teste123` (comes with a few games already tracked), or sign up and go through onboarding.

**Tests:** `dotnet test` from the repo root (26 unit tests covering auth, library, and stats logic).

**RAWG (optional):** without a key the app works fine off the seeded catalog (covers show as colored placeholders). Get a free key at rawg.io/apidocs, set it in `backend/appsettings.json` → `Rawg.ApiKey`, and restart — it backfills missing covers on startup.

Swagger at `http://localhost:5192/swagger` (Development mode).

## Structure

```
backend/
  Api/            controllers, middleware
  Application/    services, JWT auth, DTOs
  Domain/         entities, enums
  Infrastructure/ DbContext, seed data, RAWG client, migrations
backend.Tests/    xUnit — auth, library, stats
frontend/
  src/app/
    core/         models, status, services, auth (guard/interceptor)
    shared/       layout (topbar), game card
    pages/        login, signup, onboarding, library, game detail, profile
```

## Roadmap

- [ ] Gaming Wrapped — shareable yearly recap (Spotify Wrapped-style)
- [ ] Social — follow friends, activity feed
- [ ] Public curated lists ("Best PS2 RPGs")
- [ ] Monthly history timeline
- [ ] Real per-platform achievements (Steam first)
- [ ] Public profile page (`/u/:username`)
- [ ] PWA / mobile
