# AspNetViteTemplate

A full-stack web application template combining **ASP.NET Core MVC**, **Inertia.js**, **React**, and **Vite** — with an artisan-style CLI, EF Core multi-provider database support, and a complete test setup.

---

## Architecture Overview

```
Template.sln
├── Template.Web          # ASP.NET Core web application (backend + frontend)
│   ├── Controllers/      # MVC controllers
│   ├── Data/             # EF Core DbContext and store implementations
│   ├── Database/         # Migrations, seeders, and factories
│   ├── Models/           # Request/response models with co-located validators
│   ├── Services/         # Service interfaces and implementations
│   ├── TagHelpers/       # Custom Razor tag helpers
│   ├── Views/            # Razor views (App.cshtml root for Inertia)
│   ├── resources/        # Frontend source (TypeScript, React, CSS)
│   │   ├── js/           # app.tsx entry point, Pages/, components/, services/
│   │   └── css/          # Tailwind CSS
│   └── wwwroot/          # Static file root; Vite builds to wwwroot/build/
├── Template.Console      # Artisan-style CLI (code generation + DB management)
└── Template.Web.Tests    # xUnit unit tests + Playwright e2e tests
    └── browser/          # Playwright specs
```

### Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | ASP.NET Core 9 MVC |
| SPA bridge | Inertia.js (`InertiaCore`) |
| Frontend | React 19 + TypeScript |
| CSS | Tailwind CSS v4 |
| Build tool | Vite 6 |
| ORM | Entity Framework Core 9 |
| Validation | FluentValidation 11 |
| Unit tests | xUnit |
| E2E tests | Playwright |

---

## Design Patterns

### MVC + Inertia.js
Controllers return `Inertia.Render("PageName", props)` instead of traditional Razor views. Inertia bridges the server and the React SPA without a separate API: on the first request it renders the full HTML shell (`Views/App.cshtml`); subsequent navigations are handled via XHR, swapping only the React page component.

### Service Layer
Business logic is abstracted behind interfaces (e.g. `ITodoStore`). The production implementation (`DatabaseTodoStore`) uses EF Core; the test implementation (`InMemoryTodoStore`) lives in `Template.Web` and is used by unit tests, keeping tests fast and database-free.

### Co-located Validation
Request models carry their FluentValidation validator as a nested class (e.g. `TodoCreateRequest.Validator`). Validators are auto-discovered via `AddValidatorsFromAssemblyContaining<TodoCreateRequest>()` and wired up through `AddFluentValidationAutoValidation()`.

### Database Migrations
Migrations live in `Template.Web/Database/Migrations/`. EF Core is configured with a design-time factory (`AppDbContextFactory`) so `dotnet ef` commands work without running the application. Pending migrations are applied automatically on startup via `db.Database.Migrate()`.

---

## CLI — Template.Console

`Template.Console` provides artisan-style commands for code generation and database management. Run it from anywhere inside the solution — it walks up the directory tree to find `Template.sln`.

```bash
dotnet run --project Template.Console -- <command> [args]
```

### Available Commands

| Command | Description |
|---|---|
| `make:controller <Name>` | Scaffold a controller in `Template.Web/Controllers/` |
| `make:model <Name>` | Scaffold a model in `Template.Web/Models/` |
| `make:migration <Name>` | Add an EF Core migration via `dotnet ef` |
| `db:fresh [--seed]` | Drop the database, re-run all migrations, and optionally seed |
| `help` | Print the help message |

### Examples

```bash
# Create a new controller
dotnet run --project Template.Console -- make:controller Products

# Create a new model
dotnet run --project Template.Console -- make:model Product

# Add a new EF Core migration
dotnet run --project Template.Console -- make:migration AddProductsTable

# Reset the database and seed it with demo data
dotnet run --project Template.Console -- db:fresh --seed
```

---

## Backend Build & Run

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download)

### Restore and build

```bash
dotnet restore
dotnet build
```

### Run the web application

```bash
dotnet run --project Template.Web
```

In development mode the Vite dev server starts automatically (via `Vite.AspNetCore`) and serves assets with HMR on `http://localhost:5173`. The application is available at `https://localhost:7XXX` / `http://localhost:5XXX` (ports printed on startup).

---

## Frontend Build

### Prerequisites
- [Node.js 20+](https://nodejs.org/) and npm

### Install dependencies

```bash
cd Template.Web
npm install
```

### Development (watch mode)

The Vite dev server starts automatically when `dotnet run` is executed in development. To run it standalone:

```bash
cd Template.Web
npm run dev
```

### Production build

Outputs hashed, cache-busted assets to `Template.Web/wwwroot/build/`:

```bash
cd Template.Web
npm run build
```

---

## Running Tests

### Unit tests (xUnit)

```bash
dotnet test
```

Tests in `Template.Web.Tests` cover controllers, models, and the database store using the in-memory store and a real SQLite database (no network required).

### End-to-end tests (Playwright)

E2E tests require Chromium. Install it once:

```bash
cd Template.Web
npx playwright install chromium
```

Then run the full suite (builds the frontend and backend first, then starts the app):

```bash
cd Template.Web
npm run test:e2e
```

The `test:e2e` script runs `vite build && dotnet build && playwright test`. Playwright specs live in `Template.Web.Tests/browser/` and are driven via the config in `Template.Web/playwright.config.ts`.

---

## Configuration — `appsettings.json`

Key settings in `Template.Web/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=app.db"
  },
  "Database": {
    "Provider": "sqlite"
  }
}
```

### `Database:Provider`

Controls which EF Core database provider is used at runtime:

| Value | Provider | Notes |
|---|---|---|
| `sqlite` (default) | Microsoft.EntityFrameworkCore.Sqlite | Uses the file path in `DefaultConnection` |
| `sqlserver` | Microsoft.EntityFrameworkCore.SqlServer | Requires a SQL Server connection string |
| `postgres` | Npgsql.EntityFrameworkCore.PostgreSQL | Note: the key is `postgres`, not `postgresql` |

Override for a specific environment using `appsettings.Production.json` or environment variables:

```bash
# Environment variable override
Database__Provider=postgres
ConnectionStrings__DefaultConnection="Host=localhost;Database=mydb;Username=user;Password=pass"
```

### Environment-specific files

| File | Purpose |
|---|---|
| `appsettings.json` | Base configuration (committed) |
| `appsettings.Development.json` | Local dev overrides — **gitignored**, never committed |
| `appsettings.Production.json` | Production overrides (committed; use environment variables for secrets) |
| `appsettings.Testing.json` | Used by Playwright e2e tests |
