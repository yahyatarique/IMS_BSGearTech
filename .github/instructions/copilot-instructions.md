## Purpose
Short, focused instructions to help an AI code agent be productive in this repository.

## High-level architecture (what to know first)
- This is a Next.js (App Router) TypeScript frontend and API in one repo (see `app/` and `api/`).
- Server-side data layer uses Sequelize + Postgres. DB connection helper: `db/connection.ts`.
- Models live under `db/models/` (e.g. `db/models/User.ts`) and use Sequelize model hooks (password hashing) and `associate()` for relationships.
- Validation uses Zod (`schemas/*.ts`). JWTs are generated with `jose` in `api/auth/login/route.ts` and stored as httpOnly cookies.
- Client-side API wrapper is `axios/index.ts` (centralized interceptors and token refresh queue). Front-end endpoints are defined in `services/auth.ts`.

## Key files to reference (quick links)
- App entry and layout: `app/page.tsx`, `app/layout.tsx`.
- API routes (examples): `api/auth/login/route.ts`, `api/users/route.ts`, `api/refresh-token/route.ts`.
- DB: `db/connection.ts`, `db/models/*` (e.g. `db/models/User.ts`), `db/migrations/`, `db/seeders/`.
- Validation schemas: `schemas/user.schema.ts` (CreateUserSchema, LoginSchema).
- Role enums: `enums/users.enum.ts` (roles are string values: `'0'|'1'|'2'`).
- Front-end HTTP client: `axios/index.ts` (with token refresh behavior).

## Project-specific conventions and patterns
- Role values are string enums: `'0'` = super/admin, `'1'` = admin/manager, `'2'` = user. See `enums/users.enum.ts`.
- Passwords are hashed inside the Sequelize model via `beforeCreate` / `beforeUpdate` hooks (see `db/models/User.ts`). Password validation uses an alphanumeric regex in `schemas/user.schema.ts`. Note: Model-level password validation was removed to allow bcrypt hashed passwords (which contain special characters).
- DB calls commonly call `testConnection()` (in `db/connection.ts`) at the start of API handlers to ensure DB reachable.
- **Database transactions**: When mutating the database (INSERT, UPDATE, DELETE operations), ALWAYS use Sequelize transactions to ensure data consistency and enable rollback on errors. Wrap all mutation operations in a transaction block.
- Authorization checks are sometimes implemented using request headers (example: `x-user-role` checked in `api/users/route.ts`). When editing auth, update all routes that rely on that header.
- **Tokens are stored ONLY in httpOnly cookies**: API routes (e.g., `api/auth/login/route.ts`) set `accessToken` and `refreshToken` as httpOnly cookies. Client-side code does NOT store tokens in localStorage. The axios instance (`axios/index.ts`) uses `withCredentials: true` to automatically send cookies with requests and implements a refresh queue for concurrent 401s.
- **Remember Me functionality**: Login supports "Remember Me" checkbox. When checked, refresh token expiry extends from 7 days to 30 days. Access token remains 15 minutes regardless.

## Build / dev / DB workflows (concrete commands)
- Start dev: `npm run dev` (Next dev server). `package.json` contains `dev`, `build`, `start`, and `lint` scripts.
- Sequelize (local/migration) helper scripts (run from project root):
  - `npm run db:migrate` — run migrations
  - `npm run db:seed` — seed all
  - `npm run db:reset` — undo all migrations then migrate + seed
  - `npm run db:setup` — migrate then seed
- Environment variables you must set locally for auth and DB to work:
  - `DATABASE_URL` (Postgres connection string)
  - `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
  - `NEXT_PUBLIC_BASE_URL` (used by client axios; defaults to http://localhost:3000)

## Editing guidance (concrete examples)
- To add a new API route that uses the DB, follow the pattern in `api/auth/login/route.ts`:
  1. Call `await testConnection()` at the top.
  2. Validate request body using Zod schemas from `schemas/`.
  3. For any database mutations (create, update, delete), wrap operations in a Sequelize transaction:
     ```typescript
     const transaction = await sequelize.transaction();
     try {
       // perform database operations
       await transaction.commit();
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
     ```
  4. Use models from `db/models` (e.g. `User`) and return `NextResponse.json(...)`.
  5. When issuing tokens, follow the `jose` pattern in `api/auth/login/route.ts` and set cookies with `response.cookies.set(...)`.
- To modify role logic: update `enums/users.enum.ts` and adjust checks in routes that read `x-user-role` header (search for `x-user-role` to find all places).
- When changing a model shape, update corresponding migration in `db/migrations/` and run `npm run db:migrate` (or create a new migration).

## Integration points & external dependencies
- Postgres accessed through `Sequelize` (`sequelize` package). Migrations use `sequelize-cli`.
- `jose` is used for JWT signing.
- `@supabase/supabase-js` is present in deps (check `db/supabase.ts`) — may be used for secondary services/storage.
- Axios client (`axios/index.ts`) centralizes token handling and is the place to update refresh-handling logic.

## Gotchas & quick checks
- The project uses Next.js App Router (Next 13+/app directory) — use server components and route handlers (route.ts) appropriately.
- Cookies are set as httpOnly in server routes; client code also duplicates tokens in localStorage/cookies — keep these consistent when changing token format.
- `db/connection.ts` enables SSL in dialectOptions; local Postgres setups must support the configured `DATABASE_URL` and SSL flags.
- No test runner configured in `package.json` — add tests carefully and wire a script if you add unit/integration tests.

## Where to look for more context
- Migrations: `db/migrations/` — look at timestamped migration files to understand table schema evolution.
- Seeders: `db/seeders/` — default data and admin user creation.
- Example API handlers: `api/auth/*`, `api/users/route.ts` for patterns on authorization and error handling.

If anything specific feels missing or you want examples adapted for a new task (e.g., adding a specific API, changing auth lifetime, or wiring a new model), tell me which area and I will expand or adjust these instructions.
