# Clash of Classes

A timetable and class-clash management project. This repository contains the existing Fastify API, a React/Vite frontend, and a Docker Compose deployment with MariaDB and Nginx.

> **Deployment note:** The included class-board UI is currently a frontend prototype with local sample cards. The existing API is packaged and exposed through the Nginx `/api/` proxy, but the board has not yet been connected to load and save timetable records. The deployment does not replace your database schema, API routes, stored procedures, or collision-detection implementation.

## Repository layout

```text
.
├── clientside/                 # React + Vite frontend and Dockerfile
├── clash-of-classes-api/       # Existing Fastify API, routes and collision service
├── database/
│   └── init/                   # Place your existing database dump here (not committed)
├── deployment/                 # Nginx reverse-proxy configuration
├── scripts/                    # Database export and setup helpers
├── docker-compose.yml
├── .env.example
├── .dockerignore
└── README.md
```

## Existing functionality and preservation

- Existing Fastify route modules and route prefixes are retained.
- The timetable route continues to use the existing `checkCollision()` service.
- The collision service continues to call the existing MariaDB stored procedure `check_collision`; the API's conflict response remains HTTP `409` with conflict details.
- Your existing schema, records, routines, triggers, and events are migrated from a dump of your current database. This repository does not generate a replacement schema.
- The API database connection supports either an explicitly configured `DB_SOCKET` or TCP (`DB_HOST`/`DB_PORT`). Docker Compose uses TCP to reach the `db` service.

## Requirements

- Docker Engine
- Docker Compose v2 (`docker compose`)
- Access to the existing MariaDB database for the initial export

## Deploy with Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/hi-iiam-Dishant/ClashOfClasses
cd COC
```

### 2. Export your existing database

The original project archive did not include a database SQL dump. Export your current database so the deployment can retain the actual schema, data, and stored procedures.

From the project root, run:

```bash
./scripts/export-existing-db.sh
```

If your local MariaDB root account uses Unix-socket authentication:

```bash
SOURCE_DB_USE_SUDO=1 ./scripts/export-existing-db.sh
```

The script writes the dump to:

```text
database/init/001-existing-database.sql
```

Read [`database/init/README.md`](database/init/README.md) for export options and import behavior. **Do not commit this SQL file**: it can contain private application data and is excluded by `.gitignore`.

### 3. Configure secrets

```bash
cp .env.example .env
```

Edit `.env` and set unique, strong values for `DB_PASSWORD` and `DB_ROOT_PASSWORD`. Keep `.env` private; never push it to GitHub.

### 4. Build and start

```bash
docker compose up -d --build
```

Open [http://localhost:8080](http://localhost:8080). Change `APP_PORT` in `.env` if port 8080 is already in use.

### 5. Check the containers

```bash
docker compose ps
docker compose logs -f db api web
```

## Useful Docker commands

```bash
# Stop containers; preserve the database volume
docker compose down

# Restart the API
docker compose restart api

# Follow all service logs
docker compose logs -f

# Stop containers AND DELETE the MariaDB volume (destructive)
docker compose down -v
```

MariaDB initialization scripts in `database/init/` run only when the named database volume is first created and empty. If the volume has already been initialized, adding or changing the SQL dump will **not** automatically re-import it. Back up the database before performing a manual import or resetting a volume.

## Database backup

Create a logical backup from the running MariaDB container:

```bash
docker compose exec -T db sh -c 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --databases "$MARIADB_DATABASE" --routines --triggers --events --single-transaction' > backup-clash-of-classes.sql
```

The backup file is ignored by Git. Store backups securely outside the repository as well.

## API and networking

- The browser accesses the frontend through Nginx.
- Nginx proxies `/api/` and `/health` to the Fastify API container.
- MariaDB is available to the API on the private Compose network as `db:3306`.
- MariaDB's port is not published to the host by default.

The existing API source is in [`clash-of-classes-api/`](clash-of-classes-api/). Review its route modules for the exact endpoints and request/response contracts.

## Frontend status and next integration step

The current board demonstrates the class-oriented Kanban interface using local sample data. To make it fully data-driven, connect the frontend to the existing timetable and CRUD endpoints and group the returned timetable records client-side (for example by room, course, branch/year, or teacher). Changing the grouping should reorganize the same fetched records; it should not require new database tables or duplicate collision logic.

## Security checklist before publishing

- [ ] Confirm `.env` is not tracked (`git status --short` and `git check-ignore .env`).
- [ ] Confirm no SQL dumps, database backups, credentials, tokens, or private production data are staged.
- [ ] Replace all example passwords in your local `.env`.
- [ ] Rotate any credentials that may have been included in an older shared archive or commit.
- [ ] Do not publish MariaDB port `3306` to the public internet.
- [ ] Keep database backups in a secure location outside this Git repository.

## License

No license has been selected for this repository yet. Add a `LICENSE` file before allowing others to reuse, modify, or distribute the project under explicit terms.
# ClashOfClasses
# ClashOfClasses
# ClashOfClasses
