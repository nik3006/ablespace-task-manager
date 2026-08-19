# Ablespace Task Manager Repository Context

This file is the working context for agents contributing to this repository.

## Repository Overview

Ablespace Task Manager is a private npm workspace containing two applications:

- `apps/api`: NestJS REST API backed by PostgreSQL through Prisma.
- `apps/web`: Next.js App Router frontend using React and Tailwind CSS.

The repository root is an npm workspace. Workspace packages are discovered through `apps/*`.

## Technology Stack

### Root

- Node.js and npm
- npm workspaces
- Root dependencies: `lucide-react`, `@hugeicons/react`, `@hugeicons/core-free-icons`

### API

- NestJS 11
- TypeScript 5.x
- Prisma 7 with the generated client in `apps/api/generated/prisma`
- PostgreSQL
- Passport and Google OAuth
- JWT support
- Express, cookie-parser, class-validator, and class-transformer
- Jest and Supertest
- ESLint and Prettier

### Web

- Next.js 16 App Router
- React 19
- TypeScript 5.x
- Tailwind CSS 4 through PostCSS
- ESLint with `eslint-config-next`
- `next/font/google` currently provides Geist and Geist Mono
- Lucide and Hugeicons are available for interface icons

## Directory Map

```text
.
|-- package.json                 Root npm workspace and cross-app scripts
|-- cookies.txt                  Local cookie/test artifact; do not expose secrets
|-- apps/
|   |-- api/
|   |   |-- package.json
|   |   |-- prisma/
|   |   |   |-- schema.prisma    Database schema
|   |   |   `-- migrations/      Applied Prisma migrations
|   |   |-- generated/prisma/    Generated Prisma client; do not hand-edit
|   |   |-- src/
|   |   |   |-- auth/             Guest, Google OAuth, JWT guard/strategy
|   |   |   |-- common/           Decorators, filters, interceptors, pipes
|   |   |   |-- database/         Prisma module and service
|   |   |   |-- user/             User profile and avatar operations
|   |   |   |-- workspace/         Workspace and membership operations
|   |   |   |-- project/           Project operations
|   |   |   |-- task/              Task and task membership operations
|   |   |   |-- subtask/            Subtask operations
|   |   |   |-- label/              Label and task-label operations
|   |   |   `-- task-update/        Task comment/update operations
|   |   `-- test/                  API e2e tests
|   `-- web/
|       |-- app/                  Next.js routes and layouts
|       |   |-- page.tsx           Main task board
|       |   |-- login/page.tsx     Login screen
|       |   |-- profile/page.tsx   Profile screen
|       |   |-- projects/page.tsx  Project list
|       |   |-- projects/[projectId]/page.tsx
|       |   `-- tasks/[taskId]/page.tsx
|       |-- components/            UI, shell, profile, project, task components
|       |-- hooks/                 Shared client hooks
|       |-- lib/api.ts             API base URL and fetch wrapper
|       |-- lib/api/               API-specific client helpers
|       |-- lib/theme/             Theme utilities
|       |-- types/                 Frontend types
|       |-- public/                Static assets
|       |-- AGENTS.md              Next.js-generated local agent guidance
|       `-- CLAUDE.md              Points contributors to `AGENTS.md`
```

Do not treat `apps/api/generated/prisma` as source code. Regenerate it through Prisma commands when the schema changes.

## Domain Model

The Prisma schema contains these core entities:

- `User`: identity, profile, avatar, task reporting, memberships, updates, and project leadership.
- `Workspace`: top-level container for projects, tasks, labels, and members.
- `WorkspaceMember`: joins users to workspaces with `OWNER`, `MEMBER`, or `GUEST` roles.
- `Project`: belongs to a workspace, may have a lead and due date, and contains tasks.
- `Task`: belongs to a workspace and optionally a project; supports status, priority, due date, reporter, subtasks, members, updates, and labels.
- `Subtask`: task child item with completion and priority.
- `Label`: workspace-scoped named color label.
- `TaskLabel`: composite join between tasks and labels.
- `TaskMember`: composite-unique task/user membership join.
- `TaskUpdate`: task comment/update authored by a user.

Task statuses are `TODO`, `DOING`, `COMPLETED`, and `ON_HOLD`.
Task priorities are `NO_PRIORITY`, `URGENT`, `HIGH`, `MEDIUM`, and `LOW`.

## API Runtime And Requests

The API bootstrap in `apps/api/src/main.ts`:

- Loads dotenv configuration.
- Enables CORS for `http://localhost:3000` with credentials.
- Enables cookie parsing.
- Applies a global `ValidationPipe` with whitelist, forbidden-property rejection, and transformation.
- Listens on port `4000`.

Uploaded files are served from `apps/api/uploads` at `/uploads` through Nest's static-file module. Avatar uploads are stored under `uploads/avatars`.

The frontend API wrapper is `apps/web/lib/api.ts`:

- Uses `NEXT_PUBLIC_API_URL` when set.
- Defaults to `http://localhost:4000`.
- Sends credentials by default.
- Adds `Content-Type: application/json` for non-FormData request bodies when absent.

### Main API Routes

- `/auth`: guest login, current session, logout, Google OAuth, Google callback.
- `/users`: current user profile and avatar upload.
- `/workspaces`: workspace CRUD, available guest workspaces, members, role changes, and leave operation.
- `/workspaces/:workspaceId/projects`: project CRUD.
- `/workspaces/:workspaceId/tasks`: task CRUD and task members.
- `/workspaces/:workspaceId/tasks/:taskId/subtasks`: subtask CRUD.
- `/workspaces/:workspaceId/labels`: label CRUD.
- `/workspaces/:workspaceId/tasks/:taskId/labels`: attach/detach labels.
- `/workspaces/:workspaceId/tasks/:taskId/updates`: task update CRUD.

Check the controller and service for the exact DTOs, authorization rules, and response shapes before changing a contract.

## Frontend Structure And Behavior

The root web route renders `AppShell` and `TaskBoard`. The task board supports board/list views, task filtering/search, visible-field controls, task creation/editing/deletion, and navigation to task details. The frontend is client-heavy where interactions require state or browser APIs.

Existing layout components include:

- `AppShell`: authenticated application frame.
- `Sidebar`: primary navigation and workspace navigation.
- `ProfileSidebar`: profile-related navigation.

When changing the frontend:

- Follow the existing component and Tailwind conventions.
- Preserve responsive behavior for desktop and mobile.
- Use the existing icon libraries instead of manually drawing icons.
- Keep task, project, and profile API calls aligned with backend DTOs.
- Read `apps/web/AGENTS.md` before making Next.js changes. It warns that this project uses a Next.js version with breaking changes and that relevant documentation under the installed `next` package may be authoritative.
- Avoid editing generated Next.js guidance unless the change is intentional; `next dev` may regenerate it.

## Commands

Run commands from the repository root unless noted otherwise.

### Development

```powershell
npm run dev:api
npm run dev:web
```

The API normally runs at `http://localhost:4000`; the web app normally runs at `http://localhost:3000`.

### Builds

```powershell
npm run build:api
npm run build:web
```

### API Checks

```powershell
npm run build --workspace=api
npm run lint --workspace=api
npm test --workspace=api
npm run test:e2e --workspace=api
```

### Web Checks

```powershell
npm run lint --workspace=web
npm run build --workspace=web
```

The web package does not currently define a test script.

### Prisma

Use the API package directory for Prisma commands and follow the repository's migration policy. Typical commands include:

```powershell
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate dev --schema apps/api/prisma/schema.prisma
```

Do not modify generated Prisma files directly. Confirm database configuration and migration intent before creating or applying a migration.

## Environment And Secrets

No `.env` files are committed in the visible repository. The API imports dotenv and Prisma requires database configuration. Google OAuth and JWT behavior also depend on environment configuration. Never commit credentials, tokens, session cookies, or local database URLs. Treat `cookies.txt` as sensitive local material and do not copy its contents into documentation or logs.

Before running the full stack, verify that the local environment provides the API database connection and any auth configuration expected by the auth strategy and Prisma setup.

## Change Guidelines

- Make focused changes in the owning module or component.
- Preserve public API response shapes unless the task explicitly changes the contract.
- Put validation and authorization in the API's existing guards, pipes, DTOs, and services.
- Keep database changes in `prisma/schema.prisma` and migrations; regenerate Prisma after schema changes.
- Prefer existing helpers and patterns over new abstractions.
- Do not hand-edit dependency versions during an automated dependency-upgrade workflow.
- Do not edit generated output, build output, `.next`, coverage, or `node_modules`.
- Use ASCII by default when adding code or documentation.
- Do not add unrelated formatting or refactors.
- Check both API and web callers when changing shared domain behavior.
- Run the narrowest relevant build, lint, or test after edits, then run a broader check when the change crosses package boundaries.

## Known Current-State Notes

- Root package dependencies include icon packages added for the frontend.
- The web metadata still uses the default Create Next App title and description; change it only when product metadata is part of the task.
- The task board contains local sample task data alongside database task types; determine which path a requested behavior uses before removing or replacing sample data.
- The API CORS origin is hard-coded to localhost:3000 in the current bootstrap.
- Development commands previously exited with code 1 in the recorded workspace context; inspect the actual terminal error and environment before assuming an application-code failure.

## Agent Workflow

1. Identify the owning app and nearest controller/service/component.
2. Read local guidance files before editing that area.
3. State a local hypothesis about the behavior and choose a focused validation check.
4. Make the smallest compatible edit.
5. Run the focused validation immediately after the first edit.
6. Inspect diagnostics and tests before widening the change.
7. Leave unrelated user changes untouched and do not create commits unless explicitly requested.