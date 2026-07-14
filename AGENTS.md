# AGENTS.md

Guide for AI coding agents (and humans) working in this repo. Read this before making changes.

## What this project is

A capstone web app for tracking weekly learning targets: users pick modules for the week, work through submodules, and build streaks. React/Vite frontend, Express/Postgres (Supabase) backend, two separate `npm` projects in one repo.

## Repo layout

```
/                        frontend (Vite + React 19, root package.json)
  src/
    pages/                route-level screens (Login, DailyCheckin, Profile, SubmoduleContent)
    components/           shared components (CustomAlert)
    api.js                single API client — every backend call goes through here
    *.jsx at src root      Dashboard, Navbar, Sidebar, Leaderboard, ManageSchedule, ProtectedRoute

backend/                  Express API (own package.json, own node_modules)
  server.js               app entry: middleware, route mounting, cron requires, listen
  src/
    routes/                thin express.Router() files, one per resource
    controllers/            route handlers, exported as named functions, do the actual work
    middlewares/            auth.js (JWT check), requireTarget.js
    helpers/                token.js (JWT sign), week.js (week-range/day math), email builders
    cron/                   node-cron jobs (weeklyFeedback, reminder)
    config/                 db.js (pg pool + mysql2-compatible query adapter), mailer.js (nodemailer transport)
  supabase_schema.sql      current Postgres schema + seed data (see Database section)
```

## Tech stack

- Frontend: React 19, Vite (rolldown-vite), Tailwind CSS, React Router DOM 7, plain `fetch` (no axios/react-query).
- Backend: Node.js, Express 5, `pg` (raw SQL via a thin mysql2-compatible adapter in `db.js`, no ORM), `jsonwebtoken`, `nodemailer`, `node-cron`.
- Database: Postgres via Supabase (Session pooler connection), managed via the Supabase SQL editor/dashboard.
- No test framework is configured on either side (`backend` test script is a stub, no frontend test runner).

## Backend conventions

- **Routes are thin.** A route file only wires `router.<method>(path, [middleware], controllerFn)`. All logic lives in the controller.
- **Controllers use raw parameterized SQL** via the `db` pool (`backend/src/config/db.js`), e.g. `db.query('SELECT ... WHERE id = ?', [id])`. Always parameterize — never string-concatenate user input into SQL. `db.js` wraps `pg` behind the same mysql2-shaped API (`?` placeholders, `[rows]` / `[{ insertId }]` return shape) so controller code reads the same as before the Postgres migration.
- **Write Postgres SQL, not MySQL SQL.** No `CURDATE()`/`DAYNAME()`/`DATE_FORMAT()`/`IFNULL()`/`ON DUPLICATE KEY UPDATE`/`INSERT IGNORE` — use `CURRENT_DATE`, `TO_CHAR(x, 'FMDay')`, `TO_CHAR(x, 'YYYY-MM-DD')`, `COALESCE()`, `ON CONFLICT (...) DO UPDATE/DO NOTHING`. For `WHERE col IN (?)` with an array param, use `WHERE col = ANY(?)` instead — the adapter's `?`→`$n` substitution doesn't auto-expand arrays like mysql2 did.
- **Multi-statement writes use an explicit transaction**: `const conn = await db.getConnection(); ... conn.beginTransaction() / commit() / rollback() / release()` in a try/catch/finally (see `targetsController.js:createWeeklyTarget`). Follow this pattern for any new multi-table write.
- **Auth**: `requireAuth` middleware (`src/middlewares/auth.js`) reads `Authorization: Bearer <jwt>`, verifies with `JWT_SECRET`, sets `req.user` (`{ id, email }` from the token payload). Apply it per-route, not globally.
- **Login has no password.** `authController.login` only checks the email exists in `users` and mints a JWT — there is no password field/hash anywhere in the schema. This is a known, deliberate simplification for a capstone project, not a bug to silently "fix" by inventing a password flow — flag it to the user if asked to harden auth.
- **Error handling**: every controller wraps its body in try/catch, logs with `console.error`, and returns `{ error: "..." }` with an appropriate status code. Match this shape for new endpoints (`status: "ok"` on success, `error` string on failure).
- **`console.log` for route registration** (see `server.js:34`) is leftover debug noise — don't copy that pattern for new routes.

## Frontend conventions

- **All backend calls go through `src/api.js`.** Don't call `fetch` directly from a component/page — add a function to `api.js` and import it. It handles the base URL (`VITE_API_URL`), JSON headers, bearer token injection from `localStorage`, and error unwrapping.
- **Auth state lives in `localStorage`** (`authToken`, `user`), synchronized via a custom `authChange` window event (storage events don't fire same-tab). `ProtectedRoute.jsx` gates authenticated routes.
- Styling mixes Tailwind utility classes with a few hand-written `.css` files per page (e.g. `Login.css`, `Navbar.css`) — check for an existing sibling `.css` file before reaching for inline styles.
- ESLint (`eslint.config.js`) is flat-config, React Hooks + React Refresh rules on `**/*.{js,jsx}`. Run `npm run lint` from repo root after frontend changes.

## Database (`backend/supabase_schema.sql`)

- Live database is Postgres on Supabase. `supabase_schema.sql` is the source of truth: `CREATE TABLE` (no FKs yet) → seed `INSERT`s → FK `ALTER TABLE ADD CONSTRAINT`s (added after data load so insert order doesn't need to satisfy them) → `setval()` calls to bump each `SERIAL` sequence past the explicit seed ids.
- MySQL `ENUM` columns became `TEXT` + `CHECK (col IN (...))`. MySQL's `ON UPDATE CURRENT_TIMESTAMP` has no native Postgres equivalent — it's replaced by a shared `set_updated_at()` trigger function attached to every table with an `updated_at` column (see top of the file). If you add a table with `updated_at`, add a matching `CREATE TRIGGER ... EXECUTE FUNCTION set_updated_at()`.
- FK delete behavior is inconsistent across tables (some `ON DELETE CASCADE`, some default `RESTRICT`/no action, `fk_activities_module` cascades module deletion into a user's `activities` history). Check existing FK behavior before adding a new table/relation, and don't assume cascade semantics — verify per table.
- **Do not commit real user data.** The seed data contains ~50 real emails and display names from actual users (see `users` table). Treat this as sensitive: don't add more real PII to it, and prefer a small synthetic seed set for any new sample data you add. If asked to "reset" or "reseed" the database, use synthetic data unless explicitly told otherwise.

## Secrets

- `.env` (root) and `backend/.env` hold real credentials (DB password, SMTP password, `JWT_SECRET`). They are now gitignored — **never re-add them to git**, never print their contents into a commit, PR description, or generated file. Use `.env.example` (root) and `backend/.env.example` as the templates for required keys.
- If you rotate or need to inspect a secret, do it via the local `.env` files directly — don't echo them into chat/logs/committed files.

## Working agreements for AI agents

- This is a small capstone codebase with no test suite — after backend changes, at minimum trace the affected route/controller logic manually (or ask to run the server) rather than assuming correctness from types alone.
- Match existing patterns (thin route → controller → raw SQL, `api.js` wrapper, try/catch/`console.error`/`status+error` JSON shape) over introducing new abstractions (no ORM, no state library, no new HTTP client) unless explicitly asked.
- Don't add authentication/password features, rewrite the SQL dump into migrations, or restructure folders speculatively — this is scoped, ask first if a change goes beyond the request.
- Indonesian-language content in `supabase_schema.sql` (module/submodule text) is real course content — don't translate or alter it as a side effect of unrelated changes.
