# Import the existing Clash of Classes database

**The source ZIP did not contain an SQL dump or migration files.** It contains database screenshots only. This folder is intentionally not populated with a guessed schema. Export your real MariaDB database before the first deployment so the existing tables, data, stored procedures, triggers and events are carried across unchanged.

## 1. Export from your current MariaDB installation

From the project root, use the helper script:

```bash
./scripts/export-existing-db.sh
```

By default it exports database `clash_of_classes` using the local MariaDB `root` account and prompts for a password. If your local root account authenticates through the Unix socket, run:

```bash
SOURCE_DB_USE_SUDO=1 ./scripts/export-existing-db.sh
```

For a different source account/database/connection, set `SOURCE_DB_NAME`, `SOURCE_DB_USER`, and optionally `SOURCE_DB_HOST`, `SOURCE_DB_PORT`, or `SOURCE_DB_SOCKET`. The output is:

```text
database/init/001-existing-database.sql
```

The dump includes schema and data plus stored routines, triggers and events. Keep it private; it can contain real timetable and user data. Do not commit it to a public repository.

## 2. Initialize the Docker database

After creating `.env` and exporting the dump, start the stack from the project root:

```bash
docker compose up -d --build
```

MariaDB imports `.sql` files from this directory in filename order **only when the `mariadb_data` volume is first initialized**. The API connects to the MariaDB service by its Compose DNS name, `db`; it does not use the host's Unix socket.

## 3. If the Docker database volume already exists

Adding an init SQL file later does not re-run initialization. For an intentional import into an existing volume, take a backup first, then import explicitly:

```bash
docker compose exec -T db sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD"' < database/init/001-existing-database.sql
```

Do not run this against a database that already contains the same tables/data unless you have planned the merge/restore; duplicate objects or rows can cause errors.

## Stored procedure definers

The dump preserves routine definitions, including any `DEFINER` clauses. If a routine was created by a non-default MariaDB account, ensure that account exists in the container with the required privileges before relying on the routine. The API collision service continues to call the existing `check_collision` stored procedure; it is not reimplemented in JavaScript.
