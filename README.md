# Inertia/React Powered .Net Core 10

A full-stack web application template combining **ASP.NET Core MVC**, **Inertia.js**, **React**, and **Vite** — with an artisan-style CLI, EF Core multi-provider database support, and a complete test setup.

---

## Architecture Overview

```
Template.sln
├── Template.Web          # ASP.NET Core web application (backend + frontend)
│   ├── Controllers/      # MVC controllers
│   ├── Database/         # Migrations, seeders, and factories
│   ├── Models/           # Domain/view models
│   ├── Requests/         # Request DTOs with co-located validators
│   ├── Store/            # Standardized EF Core CRUD store interfaces/impls
│   ├── Views/            # Razor views (App.cshtml root for Inertia)
│   ├── resources/        # Frontend source (TypeScript, React, CSS)
│   │   ├── js/           # app.tsx entry point, Pages/, components/, lib/
│   │   └── css/          # Tailwind CSS
│   └── wwwroot/          # Static file root; Vite builds to wwwroot/build/
├── Template.Console      # Artisan-style CLI (code generation + DB management)
└── Template.Web.Tests    # xUnit unit tests + Playwright e2e tests
    └── browser/          # Playwright specs
```

### Tech Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| Backend framework | ASP.NET Core 10 MVC        |
| SPA bridge        | Inertia.js (`InertiaCore`) |
| Frontend          | React 19 + TypeScript      |
| CSS               | Tailwind CSS v4            |
| UI components     | shadcn/ui + Radix UI       |
| Build tool        | Vite 7                     |
| ORM               | Entity Framework Core 10   |
| Validation        | FluentValidation 11        |
| Unit tests        | xUnit                      |
| E2E tests         | Playwright                 |

---

## Design Patterns

### MVC + Inertia.js

Controllers return `Inertia.Render("PageName", props)` instead of traditional Razor views. Inertia bridges the server and the React SPA without a separate API: on the first request it renders the full HTML shell (`Views/App.cshtml`); subsequent navigations are handled via XHR, swapping only the React page component.

### Shared App Layout

Frontend pages use a shared layout component (`resources/js/components/layout/app-layout.tsx`) that now includes common top navigation for **Home**, **Privacy**, and **Todos**. This keeps cross-page navigation consistent while each page still controls its own title, description, and actions.

### Store Layer

CRUD operations are standardized behind store interfaces (e.g. `ITodoStore`) with methods like `All/Create/Update/Delete/Save`. Controllers stay small while EF Core remains the underlying persistence mechanism.

### Co-located Validation

Request models carry their FluentValidation validator as a nested class (e.g. `TodoCreateRequest.Validator`). Validators are auto-discovered via `AddValidatorsFromAssemblyContaining<TodoCreateRequest>()` and wired up through `AddFluentValidationAutoValidation()`.

### Database Migrations

Migrations live in `Template.Web/Database/Migrations/`. EF Core is configured with a design-time factory (`AppDbContextFactory`) so `dotnet ef` commands work without running the application. Pending migrations are applied automatically on startup via `db.Database.Migrate()`.

---

## CLI — Template.Console

`Template.Console` provides `dn` commands for code generation and database management. Run it from anywhere inside the solution — it walks up the directory tree to find `Template.sln`.

```bash
dotnet run --project Template.Console -- <command> [args]
```

For the short `dn` command from the web app folder, use the local launcher script:

```bash
cd Template.Web
./dn <command> [args]
```

### Available Commands

| Command                  | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `make:controller <Name>` | Scaffold a controller in `Template.Web/Controllers/`          |
| `make:model <Name>`      | Scaffold a model in `Template.Web/Models/`                    |
| `make:migration <Name>`  | Add an EF Core migration via `dotnet ef`                      |
| `make:request <Name>`    | Scaffold a request in `Template.Web/Requests/`                |
| `make:factory <Name>`    | Scaffold a factory in `Template.Web/Database/Factories/`      |
| `make:seeder <Name>`     | Scaffold a seeder in `Template.Web/Database/Seeders/`         |
| `db:fresh [--seed]`      | Drop the database, re-run all migrations, and optionally seed |
| `help`                   | Print the help message                                        |

### `make:controller` modifiers

| Modifier | Long form    | Scaffolds                                                                                               |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `-R`     | `--resource` | resource controller + store interface + store implementation + create/update requests + DI registration |

### `make:model` modifiers

| Modifier | Long form      | Scaffolds                                                                     |
| -------- | -------------- | ----------------------------------------------------------------------------- |
| `-a`     | `--all`        | model + resource controller + store + requests + factory + seeder + migration |
| `-m`     | `--migration`  | migration                                                                     |
| `-s`     | `--seeder`     | seeder                                                                        |
| `-r`     | `--request`    | `<Model>CreateRequest` + `<Model>UpdateRequest`                               |
| `-R`     | `--resource`   | resource controller + store + requests                                        |
| `-c`     | `--controller` | controller                                                                    |
| `-f`     | `--factory`    | factory                                                                       |

Short modifiers can be combined, e.g. `-msr` is the same as `-m -s -r`.

### Examples

```bash
# Create a new controller
cd Template.Web
./dn make:controller Products

# Create a full resource controller + store scaffold
./dn make:controller Products -R

# Create a new model
./dn make:model Product

# Create a model + migration + seeder
./dn make:model Product -m -s

# Laravel-style "all" scaffold
./dn make:model Product -a

# Create model + full resource stack explicitly
./dn make:model Product -R

# Create only request classes for the model
./dn make:model Product -r

# Add a new EF Core migration
./dn make:migration AddProductsTable

# Create a request, factory, or seeder separately
./dn make:request ProductRequest
./dn make:factory Product
./dn make:seeder Product

# Reset the database and seed it with demo data
./dn db:fresh --seed
```

Optional shell alias (Linux/macOS) so you can run `dn ...` without `./`:

```bash
echo "alias dn='$(pwd)/Template.Web/dn'" >> ~/.bashrc
source ~/.bashrc
```

---

## Backend Build & Run

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Restore and build

```bash
dotnet restore
dotnet build
```

### Run the web application

```bash
dotnet run --project Template.Web
```

For local development, use the launch profile so `ASPNETCORE_ENVIRONMENT=Development` is applied:

```bash
dotnet run --project Template.Web --launch-profile https
```

In development mode the Vite dev server starts automatically (via `Vite.AspNetCore`) and serves assets with HMR on `http://localhost:5173`. The app listens on `https://localhost:7001` and `http://localhost:5000` by default.

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

### Script quick reference

| Script           | Command                | Purpose                                              |
| ---------------- | ---------------------- | ---------------------------------------------------- |
| Dev server       | `npm run dev`          | Starts the Vite development server                   |
| Production build | `npm run build`        | Builds frontend assets to `wwwroot/build/`           |
| Browser e2e      | `npm run test:browser` | Runs `vite build && dotnet build && playwright test` |
| Playwright only  | `npm run playwright`   | Runs Playwright tests directly                       |
| Preview build    | `npm run preview`      | Serves the latest built frontend bundle locally      |

---

## Running Tests

### Unit tests (xUnit)

```bash
dotnet test
```

Tests in `Template.Web.Tests` cover controllers, models, and store behavior. Store tests run against EF Core's in-memory provider.

### End-to-end tests (Playwright)

E2E tests require Chromium. Install it once:

```bash
cd Template.Web
npx playwright install chromium
```

Then run the full suite (builds the frontend and backend first, then starts the app):

```bash
cd Template.Web
npm run test:browser
```

The `test:browser` script runs `vite build && dotnet build && playwright test`. To run Playwright directly (without the build steps), use `npm run playwright`. Playwright specs live in `Template.Web.Tests/browser/` and are driven via the config in `Template.Web/playwright.config.ts`.

---

## Configuration — `appsettings.json`

Key settings in `Template.Web/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=Database/app.db"
  },
  "Database": {
    "Provider": "sqlite"
  }
}
```

### `Database:Provider`

Controls which EF Core database provider is used at runtime:

| Value              | Provider                                | Notes                                         |
| ------------------ | --------------------------------------- | --------------------------------------------- |
| `sqlite` (default) | Microsoft.EntityFrameworkCore.Sqlite    | Uses the file path in `DefaultConnection`     |
| `sqlserver`        | Microsoft.EntityFrameworkCore.SqlServer | Requires a SQL Server connection string       |
| `postgres`         | Npgsql.EntityFrameworkCore.PostgreSQL   | Note: the key is `postgres`, not `postgresql` |

Override for a specific environment using environment variables (or additional `appsettings.{Environment}.json` files if you add them):

```bash
# Environment variable override
Database__Provider=postgres
ConnectionStrings__DefaultConnection="Host=localhost;Database=mydb;Username=user;Password=pass"
```

### Notes

- This repository currently ships with a single config file: `Template.Web/appsettings.json`.
- Playwright e2e uses environment variables from `playwright.config.ts` (`ASPNETCORE_ENVIRONMENT=Testing`, `ASPNETCORE_URLS=http://localhost:5000`) and does not require a dedicated `appsettings.Testing.json` file.

---

## Routes

| Route      | Source                   | UI Page            |
| ---------- | ------------------------ | ------------------ |
| `/`        | `HomeController.Index`   | `Home/Index.tsx`   |
| `/privacy` | `HomeController.Privacy` | `Home/Privacy.tsx` |
| `/todos`   | `TodosController.Index`  | `Todos/Index.tsx`  |
