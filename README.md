# zerei 🎮

> *"Zerei"* is Brazilian Portuguese slang for **beating a game** — from *zerar* ("to zero out"), as in clearing every last bit of it. This is a shelf for tracking every game you've zerado (and every one you haven't, yet).

Your game shelf. Log everything you've played — any platform, replays included — and see your history as stats.

A "Letterboxd/Goodreads for games", focused on **logging your own history** (not just a backlog, not just reviews): each game can have multiple **playthroughs** (platform, month/year, hours, status), and your profile rolls it all up into stats — hours played, completions, platinums, favorite platform/genre, most-played ranking, and a shareable "Wrapped" recap.

Built to run **locally**, on your own machine — no need to deploy anything.

## Screenshots

| Home | Library | Game detail |
|---|---|---|
| ![Home](docs/screenshot-home.jpg) | ![Library](docs/screenshot-biblioteca.jpg) | ![Game detail](docs/screenshot-jogo.jpg) |

## Stack

| Layer | Tech |
|---|---|
| Backend | **.NET 8** (ASP.NET Core, EF Core, JWT, BCrypt) |
| Database | **PostgreSQL** (native service — not containerized) |
| Frontend | **React 19** (Vite, TypeScript) + **Mantine** + **TanStack Query** |
| Local orchestration | **.NET Aspire** (optional — telemetry dashboard) |
| Catalog | **RAWG API** (optional — covers, Metacritic, community rating, DLCs, similar games) |

## Running it

**Prerequisites:** [.NET 8 SDK](https://dotnet.microsoft.com/download), [Node 18+](https://nodejs.org), PostgreSQL on `localhost:5432` (user `postgres` / password `postgres` — or adjust the connection string in `backend/appsettings.json`)

```bash
git clone https://github.com/rafael-ventura/zerei.git
cd zerei
```

**1. Backend** (`backend/`):
```bash
cd backend
dotnet ef database update   # creates the "zerei" database and applies migrations
dotnet run --urls http://localhost:5192
```
On startup, the backend runs a **seed** (genres/platforms + ~50 well-known games, idempotent — safe to run again). It also creates a demo account: **`demo` / `demo1234`**, with a handful of games already tracked, so there's something to look at right away.

**2. Frontend** (`frontend-react/`, in another terminal):
```bash
cd frontend-react
npm install
npm run dev
```
Open **http://localhost:5173**, log in with the demo account (or sign up fresh) and start logging your games.

**Tests:** `dotnet test` from the repo root.

### RAWG (optional, but recommended)

Without a key, the app still works off the seeded catalog (covers show as colored placeholders). With one, search auto-imports any game — cover, Metacritic, community rating, DLCs, and even a "similar games" section.

1. Grab a free key at **[rawg.io/apidocs](https://rawg.io/apidocs)** (just identifies who's calling their API, no cost).
2. Set it **locally**, never directly in `appsettings.json`:
   ```bash
   cd backend
   dotnet user-secrets init
   dotnet user-secrets set "Rawg:ApiKey" "your-key-here"
   ```
3. Restart the backend.

## Project structure

```
backend/
  Api/             controllers, auth
  Application/     services, DTOs, business rules
  Domain/          entities, enums
  Infrastructure/  DbContext, seed data, RAWG client, migrations
backend.Tests/     xUnit tests
frontend-react/
  src/
    api/           TanStack Query hooks (auth, library, catalog, profile)
    components/    Layout, JogoCard, StatusIcon
    pages/         login, onboarding, home, library, game detail,
                    public profile (/u/:username), wrapped
```

## Ideas / roadmap

Tracked as [issues](../../issues) rather than a list here, so discussion stays in one place:

- [User-made game lists](../../issues/1) — public/private, shareable via image/CSV
- [Internationalize the UI](../../issues/6) (English)
- [Monthly history timeline](../../issues/3)
- [Real per-platform achievements](../../issues/4) (Steam first)
- [PWA / installable on mobile](../../issues/5)

Got an idea or found a bug? Open a new [issue](../../issues).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the commit convention, pre-commit checks, and secret-handling rules.

This project started from a simple itch: wanting something that felt good to fill in, built exactly the way I wanted to use it. It's open to collaboration — feel free to open an issue, suggest something, or send a PR.
