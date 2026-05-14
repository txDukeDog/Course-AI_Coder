# Database

SQLite, managed via Entity Framework Core 9. The file is created automatically on first run if it does not exist.

## Schema

### users
Stores credentials. `password_hash` holds a BCrypt hash. `username` is unique.
One user maps to one board in the MVP; the schema supports multiple boards per user for future expansion.

### boards
One board per user for the MVP. `name` defaults to "My Project" on seed.

### columns
Five columns per board, ordered by `position` (0-based integer). `position` is the display order; gaps are allowed and re-ordering is done by updating integers, not by inserting.

### cards
Cards belong to a column. `position` is the display order within the column, same convention as columns. `details` is `NOT NULL DEFAULT ''` so the application never has to handle null.

## Relationships

```
users (1) ──< boards (1) ──< columns ──< cards
```

All foreign keys use SQLite's default deferred enforcement. EF Core is configured with `PRAGMA foreign_keys = ON` at connection open time.

## Migrations

EF Core migrations are applied automatically at startup via `dbContext.Database.MigrateAsync()`. On first run against a new file this creates the schema and runs the seed. Subsequent runs are no-ops if the schema is current.

The SQLite file path is read from configuration key `Database:Path`, defaulting to `kanban.db` in the working directory. In Docker this resolves to `/app/kanban.db`.

## Seed data

Applied once via a migration or an idempotent seed check on startup:
- One user: username `user`, password `password` (BCrypt hash stored)
- One board: "My Project"
- Five columns: Backlog (0), Todo (1), In Progress (2), Review (3), Done (4)
- Two sample cards per column (10 total)
