# Clash of Classes — implementation plan

## Product direction

The primary workspace is a **class-management Kanban board**. A card represents a course/class (for example CS204 — Data Structures), not one meeting in a timetable. The weekly timetable remains a separate view and is built from scheduled timetable blocks.

## Frontend delivered in this iteration

- Four workflow columns: Planning, Ready, Scheduled, Published.
- Class cards show course code/name, department, instructor, room, semester, enrolment and meeting time.
- Native HTML drag-and-drop between workflow columns.
- Search, department filter and semester filter.
- Create-class modal and class detail drawer.
- Persistent light/dark theme preference in browser local storage.
- API health indicator; the board remains usable as a local preview when the API is unavailable.
- Responsive layout for desktop, tablet and narrow screens.

The current cards are deliberately marked as local preview data. Existing backend endpoints expose courses, teachers, rooms, departments, branch-years, timetable blocks and absences, but they do not yet expose a persistent class workflow state. The frontend must not imply that local drag-and-drop changes are saved to the database.

## Target data model

Keep the existing `courses` entity as the catalog definition. Add a separate offering/section entity for a class delivered in a particular academic year and semester. Suggested fields:

- `class_id` primary key
- `course_id` foreign key
- `branch_year_id` foreign key (or an explicit section/group relation if one offering serves multiple groups)
- `academic_year`, `semester_term`
- `workflow_status` enum: `PLANNING`, `READY`, `SCHEDULED`, `PUBLISHED`
- optional `published_at`, `created_at`, `updated_at`

Keep timetable meeting data in `timetable_blocks` and link each block to its class offering. This avoids treating one course catalog row as a semester-specific class and supports multiple sections of the same course.

Before implementing the migration, compare this proposal with the actual live schema and existing `timetable_block_groups` relationship. The archive contained schema screenshots, not executable DDL, so exact foreign keys and cardinalities still need confirmation.

## API milestones

1. Add migrations and read/write endpoints for class offerings, including list filters and workflow status updates.
2. Add timetable-block read/update/delete operations and class-offering linkage.
3. Keep collision checks on the server. Validate teacher, room, time overlap and group constraints in one transactional operation.
4. Enforce workflow transitions server-side. `PUBLISHED` must require a valid schedule and no unresolved conflicts; a client-side status change is not sufficient.
5. Add audit fields/events for who changed workflow state and when.
6. Add API validation schemas and tests for invalid transitions, collision cases, and cross-semester isolation.

Suggested endpoints:

- `GET /api/classes?academicYear=2026-2027&semesterTerm=1&departmentId=...`
- `POST /api/classes`
- `GET /api/classes/:id`
- `PATCH /api/classes/:id/status`
- `PATCH /api/classes/:id`
- `GET /api/classes/:id/timetable`
- `POST /api/classes/:id/timetable-blocks`

These are proposed endpoints, not currently implemented endpoints.

## Frontend integration milestones

1. Replace sample data with TanStack Query (or a small fetch/query layer initially) calling `/api/classes`.
2. Populate teacher, room, department and branch-year selectors from existing API endpoints.
3. Persist drag/drop with `PATCH /api/classes/:id/status`; optimistically update, then roll back on API errors.
4. Show server-returned conflict details in a blocking dialog; do not allow publishing until resolved.
5. Add a separate weekly timetable grid consuming timetable-block APIs.
6. Add loading, empty, error and permission states; keep demo mode explicit and development-only.

## Deployment delivered in this iteration

- Root Docker Compose stack: MariaDB, Fastify API, Nginx-served React frontend.
- Private Compose network; only the web service is published to the host.
- MariaDB named volume for persistence and health checks for services.
- Nginx same-origin proxy for `/api/*` and `/health`.
- Environment template, `.gitignore`, Dockerfiles and a basic install script.

## Deployment blocker / next requirement

The supplied archive did not include SQL schema/migration files. It contained screenshots of the schema only. The Compose stack can start MariaDB, but a new volume will have an empty database until a real SQL export or migration set is added to `database/init/`. Do not treat the deployment as production-ready until the schema, migrations, backup/restore and secrets handling are completed.

## Suggested release sequence

- **0.2 — UI prototype:** current Kanban frontend and local interactions.
- **0.3 — Data-backed classes:** schema migration, class-offering API, persisted board state.
- **0.4 — Scheduling workflow:** timetable editor, server collision feedback, publication guard.
- **0.5 — Deployment hardening:** schema bootstrap, backups, TLS/reverse proxy guidance, non-root containers, structured logs and tested upgrades.
