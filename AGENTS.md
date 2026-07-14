# AGENTS.md

Guide for AI coding agents (and humans) working in this repo. Read this before making changes.

## What this project is

A capstone web app for tracking weekly learning targets: users pick modules for the week, work through submodules, and build streaks. React/Vite frontend, Express/MySQL backend, two separate `npm` projects in one repo.

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
    config/                 db.js (mysql2 pool), mailer.js (nodemailer transport)
  capstone.sql             full schema + seed/dump data (see Database section)
```

## Tech stack

- Frontend: React 19, Vite (rolldown-vite), Tailwind CSS, React Router DOM 7, plain `fetch` (no axios/react-query).
- Backend: Node.js, Express 5, `mysql2/promise` (raw SQL, no ORM), `jsonwebtoken`, `nodemailer`, `node-cron`.
- Database: MySQL 8, managed via phpMyAdmin locally.
- No test framework is configured on either side (`backend` test script is a stub, no frontend test runner).

## Backend conventions

- **Routes are thin.** A route file only wires `router.<method>(path, [middleware], controllerFn)`. All logic lives in the controller.
- **Controllers use raw parameterized SQL** via the `db` pool (`backend/src/config/db.js`), e.g. `db.query('SELECT ... WHERE id = ?', [id])`. Always parameterize — never string-concatenate user input into SQL.
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

## Database (`backend/capstone.sql`)

- This file is a phpMyAdmin dump: `CREATE TABLE` + `INSERT` seed data + indexes + FK constraints, wrapped in one transaction, `COMMIT`ed near the end.
- `submodule_progress` was hand-appended **after** the `COMMIT` line — it is not part of the machine-generated dump. If you re-export from phpMyAdmin, this table's definition will be lost unless you re-add it after re-export. Prefer editing schema via migrations/manual `ALTER`/`CREATE` statements kept separate from a fresh dump, not by hand-editing inside the dump body.
- FK delete behavior is inconsistent across tables (some `ON DELETE CASCADE`, some default `RESTRICT`, `fk_activities_module` cascades module deletion into a user's `activities` history). Check existing FK behavior before adding a new table/relation, and don't assume cascade semantics — verify per table.
- **Do not commit real user data.** The current dump contains ~50 real emails and display names from actual users (see `users` table). Treat this as sensitive: don't add more real PII to it, and prefer a small synthetic seed set for any new sample data you add. If asked to "reset" or "reseed" the database, use synthetic data unless explicitly told otherwise.

## Secrets

- `.env` (root) and `backend/.env` hold real credentials (DB password, SMTP password, `JWT_SECRET`). They are now gitignored — **never re-add them to git**, never print their contents into a commit, PR description, or generated file. Use `.env.example` (root) and `backend/.env.example` as the templates for required keys.
- If you rotate or need to inspect a secret, do it via the local `.env` files directly — don't echo them into chat/logs/committed files.

## Working agreements for AI agents

- This is a small capstone codebase with no test suite — after backend changes, at minimum trace the affected route/controller logic manually (or ask to run the server) rather than assuming correctness from types alone.
- Match existing patterns (thin route → controller → raw SQL, `api.js` wrapper, try/catch/`console.error`/`status+error` JSON shape) over introducing new abstractions (no ORM, no state library, no new HTTP client) unless explicitly asked.
- Don't add authentication/password features, rewrite the SQL dump into migrations, or restructure folders speculatively — this is scoped, ask first if a change goes beyond the request.
- Indonesian-language content in `capstone.sql` (module/submodule text) is real course content — don't translate or alter it as a side effect of unrelated changes.
