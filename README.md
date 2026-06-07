# Saytica Eval Console

A full-stack evaluation dashboard built for the Saytica Software Developer Intern take-home assignment. The application lets users compare AI model performance across accuracy, latency, and cost metrics, and manage annotation tasks through role-specific views.

---

## Overview

The assignment required two integrated modules on a shared data layer:

1. **Model Leaderboard** — Renders 16 model evaluations with accuracy, latency, and cost metrics. Supports search, provider filtering, and multi-column sorting. Four insight cards derive automatically from the dataset: best accuracy, lowest cost, fastest model, and total count. Null values in the data (present in accuracy, latency, cost, and date fields across 3 of 16 models) are handled throughout.

2. **Task Board** — Manages 12 annotation tasks across 5 projects with two role views. Annotators update task status (pending/in-progress/done) via PATCH requests. Clients view aggregated completion metrics and per-project progress bars. Roles are client-side toggled and persisted to localStorage.

The dataset includes null values and inconsistent fields, so null handling (sort-to-bottom, "N/A" display, exclusion from aggregates) was applied consistently at every layer.

---

## Features

### Model Leaderboard

- Entry point: `GET /api/models` with query parameter support for search, provider filtering, and column sorting.
- Search filters models by name and provider using a case-insensitive substring match.
- Provider filtering via a dropdown populated from the dataset.
- Column sorting for accuracy, latency, cost per 1k tokens, and evaluation date. Sorting uses a custom comparator that pushes null values to the bottom regardless of sort direction.
- Four insight cards computed from the full dataset: best accuracy model, lowest cost model, fastest model, and total model count. These are derived from the service layer, not hardcoded.
- Ranking badges: top 3 models display medal icons; remaining rows show numeric rank.
- Best-in-class badges: rows matching the insight card leaders display a contextual badge (e.g., "Best Accuracy").
- Color coding: numeric values are colorized by threshold (green/amber/red) for quick scanning.
- CSV export: downloads the currently filtered and sorted dataset as a CSV file.

### Task Board

- Role switcher persisted to localStorage. Toggle between annotator and client views.
- Annotator view displays a grid of task cards grouped by status. A summary bar at the top shows counts for pending, in-progress, and completed tasks.
- Each task card shows title, description, project name, assignee, and current status. Three action buttons let the user transition between statuses. Active status is disabled to prevent no-op updates.
- Status updates are sent via `PATCH /api/tasks/:id`. The UI waits for the server response before reflecting the change (non-optimistic).
- Client view is read-only. Displays metric cards (total, pending, in-progress, completed, completion percentage) and per-project progress bars with percentage labels.

### Design

- Dark mode support via next-themes with system preference detection.
- Command palette accessible with Ctrl+K for keyboard navigation between pages.
- Error boundary catches unhandled React render errors with a retry button.
- Loading states use skeleton placeholders. Empty states show contextual messages.
- Error states display the error message and a retry button.

---

## Assignment Requirements Coverage

### Model Leaderboard

| Requirement | Implementation |
|-------------|----------------|
| Backend-served model data | `GET /api/models` returns models and providers list |
| Search | Case-insensitive search by model name or provider via `?search=` query param |
| Sorting | Server-side sortable columns: accuracy, latency, costPer1k, evaluatedAt |
| Filtering | Provider filter via `?provider=` query param, dropdown populated from dataset |
| Missing value handling | Nulls render as "N/A", sort to bottom via `compareNullable()`, excluded from insight computation |

### Task Board

| Requirement | Implementation |
|-------------|----------------|
| Annotator workflow | Task card grid with status transitions (pending/in-progress/done) |
| Task status updates | `PATCH /api/tasks/:id` with Zod body validation |
| Client dashboard | Metric cards (5) + per-project progress bars with completion percentages |
| Progress tracking | `getClientSummary()` aggregates task statuses into `ClientSummary` with project breakdown |

### Design Requirements

| Requirement | Implementation |
|-------------|----------------|
| Two-page navigation | Sidebar (desktop) + mobile nav + home page cards linking to both pages |
| Responsive layout | Tailwind breakpoints (`sm:`, `lg:`) on all major containers, mobile nav separate from sidebar |
| Dark mode support | next-themes with system preference detection, persistent toggle |
| Consistent loading/empty/error states | Skeleton placeholders, empty state messages, error messages with retry buttons |

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── models/route.ts         GET /api/models
│   │   └── tasks/
│   │       ├── route.ts            GET /api/tasks
│   │       └── [id]/route.ts       PATCH /api/tasks/:id
│   ├── leaderboard/page.tsx        /leaderboard
│   └── task-board/page.tsx         /task-board
├── components/
│   ├── ui/                         Button, Card, Input, Select, Badge
│   ├── layout/                     Sidebar, mobile nav, error boundary, command palette
│   ├── leaderboard/                Table, insight cards, search bar, filter
│   └── task-board/                 Annotator view, client dashboard, task card, progress bar
├── hooks/                          useModels, useTasks, useLocalStorage
├── lib/                            Types, mock data, utility functions
├── services/                       Business logic (sorting, filtering, aggregation)
└── repositories/                   Data access layer (in-memory store)
```

### Layer responsibilities

- **Types** (`lib/types.ts`): Shared interfaces, union types, type guards (`isTaskStatus`, `isSortField`), and a standardized API response envelope (`ApiResponse<T>`).
- **Data** (`lib/data.ts`): Static mock dataset containing 16 model evaluations and 12 tasks, with intentional null values across accuracy, latency, cost, and date fields.
- **Repository** (`repositories/`): Data access layer. The task repository creates a new object on update and assigns it back into the in-memory array.
- **Service** (`services/`): Business logic for sorting, filtering, computing insights, and aggregating client summaries. No framework dependencies.
- **API Route** (`app/api/*/route.ts`): Request parsing, Zod validation, standardized error responses.
- **Component** (`components/`): Presentation and user interaction. No business logic.
- **Hook** (`hooks/`): Data fetching with AbortController for cancellation on stale requests.

---

## Technical Decisions

### Why Next.js API Routes

The assignment required both frontend and backend. Next.js API routes keep both in one process with no separate server. Services and repositories have no Next.js imports, so extracting into a standalone Express server later would not require rewriting business logic.

### Why JSON data source (no database)

The assignment specified static data. TypeScript arrays in `lib/data.ts` kept iteration fast and eliminated database setup. The repository layer abstracts access so swapping in Prisma + SQLite later would not affect services or API routes.

### Why client-side role switching instead of auth

Adding authentication requires a database, session management, and login UI — outside the assignment scope. Roles are toggled client-side and persisted to localStorage. The API serves both views from the same endpoints; the `view` query parameter on `GET /api/tasks` determines the response shape. Adding JWT-based auth later would require middleware in the API layer and server-side role checks on task mutations.

### Scaling notes

- The repository layer is one adapter swap away from a database-backed implementation.
- Standardized API envelopes means middleware (rate limiting, caching) can be added without changing route handlers.
- No state management library is needed unless cross-page state sharing becomes a requirement.

---

## Data Handling Strategy

The dataset contains models with null values for accuracy (Command R+, Yi 1.5 34B), latency (Grok-1), cost per 1k (Grok-1), and evaluation date (Command R+). The following rules apply throughout:

- Display: Null values render as "N/A". No raw null or undefined text appears in the UI.
- Sorting: Null values sort to the bottom regardless of ascending or descending direction. The `compareNullable()` utility implements this consistently.
- Insight computation: Models with null values in the relevant field are excluded from that metric's computation. For example, Command R+ has null accuracy, so it is not considered for the "Best Accuracy" card.
- Date formatting: Invalid date strings are caught in `formatDate()` and return "Invalid date" instead of crashing.

---

## API Documentation

All responses follow a consistent envelope:

```
Success: { "success": true, "data": { ... } }
Error:   { "success": false, "error": { "message": "...", "code": "..." } }
```

### GET /api/models

Returns model evaluations and the list of available providers.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Filter by model name or provider (case-insensitive) |
| provider | string | Filter to a specific provider |
| sortField | string | One of: accuracy, latency, costPer1k, evaluatedAt |
| sortDirection | string | asc or desc (default: desc) |

**Example Request**

```
GET /api/models?search=gpt&sortField=accuracy&sortDirection=desc
```

**Example Response**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "m1",
        "model": "GPT-4o",
        "provider": "OpenAI",
        "accuracy": 94.7,
        "latency": 842,
        "costPer1k": 0.015,
        "evaluatedAt": "2025-12-15T10:00:00Z"
      },
      {
        "id": "m8",
        "model": "GPT-4o Mini",
        "provider": "OpenAI",
        "accuracy": 84.9,
        "latency": 389,
        "costPer1k": 0.0025,
        "evaluatedAt": "2025-12-08T10:10:00Z"
      }
    ],
    "providers": ["01.AI", "Alibaba", "Anthropic", "Cohere", "DeepSeek", "Google", "Meta", "Microsoft", "Mistral", "OpenAI", "TII", "xAI"]
  }
}
```

### GET /api/tasks

Returns tasks or a client summary depending on the view parameter.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| view | string | "annotator" (default) or "client" |

**Example Request (Annotator)**

```
GET /api/tasks
```

**Example Response**

```json
{
  "success": true,
  "data": {
    "view": "annotator",
    "tasks": [
      {
        "id": "t1",
        "title": "Classify customer support emails",
        "description": "Label 150 support tickets as complaint, refund, or inquiry with high accuracy.",
        "status": "pending",
        "projectId": "p1",
        "projectName": "Email Classification",
        "assignedTo": "Alice Chen",
        "createdAt": "2025-12-01T08:00:00Z",
        "updatedAt": "2025-12-01T08:00:00Z"
      }
    ]
  }
}
```

**Example Request (Client)**

```
GET /api/tasks?view=client
```

**Example Response**

```json
{
  "success": true,
  "data": {
    "view": "client",
    "summary": {
      "totalTasks": 12,
      "pendingTasks": 5,
      "inProgressTasks": 3,
      "completedTasks": 4,
      "completionPercentage": 33,
      "projects": [
        {
          "projectId": "p1",
          "projectName": "Email Classification",
          "totalTasks": 4,
          "completedTasks": 0,
          "completionPercentage": 0
        }
      ]
    }
  }
}
```

### PATCH /api/tasks/:id

Updates the status of a single task.

**Request Body**

```json
{
  "status": "in-progress"
}
```

Valid statuses: `"pending"`, `"in-progress"`, `"done"`.

**Example Response**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "t1",
      "title": "Classify customer support emails",
      "description": "Label 150 support tickets as complaint, refund, or inquiry with high accuracy.",
      "status": "in-progress",
      "projectId": "p1",
      "projectName": "Email Classification",
      "assignedTo": "Alice Chen",
      "createdAt": "2025-12-01T08:00:00Z",
      "updatedAt": "2026-06-07T12:00:00.000Z"
    }
  }
}
```

**Error Responses**

- `400` - Invalid status value or malformed body. Returns `INVALID_STATUS` or `INVALID_BODY` code.
- `404` - Task ID not found. Returns `NOT_FOUND` code.
- `500` - Unexpected server error. Returns `INTERNAL_ERROR` code.

---

## User Flows

### Leaderboard

1. User navigates to `/leaderboard`.
2. Four insight cards display at the top: best accuracy, lowest cost, fastest model, total models. These are computed from the full dataset via the service layer.
3. A search bar filters models by name or provider with a 300ms debounce. In-flight requests are cancelled via AbortController to prevent stale results.
4. A provider dropdown filters the table to a single provider.
5. Clicking any sortable column header sorts the table. Clicking again reverses direction. Sorting is performed server-side and null values are pushed to the bottom.
6. Each row shows the model's rank, name with best-in-class badges, provider, and color-coded numeric metrics.
7. Clicking "Export CSV" downloads the currently displayed data (after filters and sorting) as a CSV file.

### Annotator

1. User navigates to `/task-board`. The default role is "annotator".
2. A summary bar shows counts for pending, in-progress, and completed tasks.
3. Task cards are displayed in a responsive grid. Each card shows the title, description, status badge, project name, and assignee.
4. Clicking a status action button sends a PATCH request to update the task. The button shows a spinner while the request is in flight.
5. The task card visually updates on success. Error states display the error message with a retry action.

### Client

1. User clicks the "Client" button in the role switcher. The selection is persisted to localStorage.
2. Five metric cards display aggregated project data: total tasks, completed, in progress, pending, and completion percentage.
3. A project progress section lists each project with a progress bar and completion percentage.
4. The client view is read-only. No status update controls are shown.

---

## Screenshots

### Home

![Home](https://i.ibb.co.com/spPnPQ0M/home.jpg)

### Leaderboard

![Leaderboard](https://i.ibb.co.com/wFcTVdZQ/leader.jpg)

### Annotator View

![Annotator](https://i.ibb.co.com/sdq0FYvY/task.jpg)

### Client Dashboard

![Client](https://i.ibb.co.com/dJ3vnKNL/client.jpg)

---

## Project Structure

```
saytica-eval-console/
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── public/
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── api/
    │   │   ├── models/route.ts
    │   │   └── tasks/
    │   │       ├── route.ts
    │   │       └── [id]/route.ts
    │   ├── leaderboard/page.tsx
    │   └── task-board/page.tsx
    ├── components/
    │   ├── ui/
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   └── select.tsx
    │   ├── layout/
    │   │   ├── command-palette.tsx
    │   │   ├── error-boundary.tsx
    │   │   ├── mobile-nav.tsx
    │   │   ├── mode-toggle.tsx
    │   │   ├── nav-config.ts
    │   │   ├── sidebar.tsx
    │   │   └── skip-link.tsx
    │   ├── leaderboard/
    │   │   ├── insight-cards.tsx
    │   │   ├── leaderboard-table.tsx
    │   │   ├── provider-filter.tsx
    │   │   └── search-bar.tsx
    │   └── task-board/
    │       ├── annotator-view.tsx
    │       ├── client-dashboard.tsx
    │       ├── progress-bar.tsx
    │       ├── role-switcher.tsx
    │       └── task-card.tsx
    ├── hooks/
    │   ├── use-local-storage.ts
    │   ├── use-models.ts
    │   └── use-tasks.ts
    ├── lib/
    │   ├── data.ts
    │   ├── types.ts
    │   └── utils.ts
    ├── repositories/
    │   ├── model-repository.ts
    │   └── task-repository.ts
    └── services/
        ├── model-service.ts
        └── task-service.ts
```

---

## Setup

### Prerequisites

- Node.js 20 or later
- npm 9 or later

### Installation

```bash
git clone <repository-url>
cd saytica-eval-console
npm install
```

### Environment

No environment variables are required. See `.env.example` for available options.

---

## Build

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Open http://localhost:3000 after starting the dev server.

---

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

No configuration changes are required. Vercel detects Next.js automatically.

---

## Evaluation Notes

### Incomplete data handling

The dataset includes null values for accuracy (2 models), latency (1 model), costPer1k (1 model), and evaluatedAt (1 model). Three strategies are applied:

1. **Display**: `formatDate`, `formatAccuracy`, `formatLatency`, `formatCost` each return "N/A" for null inputs. No raw `null` or `undefined` text appears in the UI.
2. **Sorting**: `compareNullable()` returns +1 when the first argument is null and -1 when the second is null, causing nulls to always sink to the bottom regardless of sort direction. This is applied consistently across all four sortable columns.
3. **Aggregation**: `getInsights()` filters out models with null values in the relevant metric before computing best-in-class. For example, Command R+ (null accuracy) is excluded from the best accuracy calculation.

The `formatDate` function also catches invalid date strings in its try/catch block, returning "Invalid date" instead of throwing.

### Role views simulation

Roles are toggled client-side via a radio group persisted to localStorage under the key `saytica-role`. The `GET /api/tasks` endpoint accepts an optional `?view=client` query parameter that returns aggregated summary data instead of individual tasks. There is no server-side role enforcement — the API trusts the client to request the appropriate view. This was acceptable because the assignment scope is a frontend evaluation dashboard. Production use would require JWT middleware on the task mutation endpoints and API-level checks on `PATCH /api/tasks/:id`.

### Next.js API Routes decision

Next.js API Routes were chosen over a separate backend for two reasons:
- Single process deployment (no Express/Fastify server to maintain).
- Shared TypeScript types between frontend and backend (`@/lib/types`).

Services and repositories import zero framework modules. If the API needs to be extracted into a standalone server, those layers move without modification. Only the route handlers (which parse requests and return responses) would need to be rewritten for Express or Fastify.

### What would change in production

1. **Database**: Replace in-memory arrays with Prisma + PostgreSQL. The repository interface is designed for this swap — `getAllModels()`, `getTaskById()`, `updateTaskStatus()` each map directly to Prisma queries.
2. **Authentication**: Add NextAuth.js with JWT sessions. API middleware would verify the user's role before allowing task mutations. The annotator view would only show tasks assigned to the authenticated user.
3. **Testing**: Add Vitest unit tests for all service and repository functions. Add integration tests for API route validation and error responses. Add Playwright E2E tests for leaderboard search/sort/filter and task status update flows.
4. **Pagination**: Replace the single-model-list endpoint with cursor-based pagination when the model count exceeds 50. The TanStack Table integration supports this without component changes.
5. **Real-time**: Add SSE or WebSocket notifications so multiple annotators see status changes without polling.

---

## Tradeoffs

### In-memory data store

Data lives in `lib/data.ts` as mutable arrays. The task repository writes back to the same array on PATCH requests, so changes are lost on server restart. A database would persist across restarts but was unnecessary for this scope.

### Non-optimistic updates

`useTasks.updateTaskStatus` awaits the PATCH response before updating local state. Optimistic updates would feel faster but risk showing stale state if the request fails. For annotation workflows, reflecting confirmed server state is the safer default.

### No pagination

All 16 models render in a single table. With hundreds of models this would need server-side pagination or virtual scrolling. TanStack Table supports both, so adding either would not require a component rewrite.

### Simulated roles

Roles are toggled client-side and stored in localStorage. The API serves both views from the same endpoints with no server-side role check. Real authorization would require JWT-based middleware on task mutations.

### No tests

No unit, integration, or E2E tests are included. Services and repositories are stateless functions that would be straightforward to test with Vitest. API routes would benefit from integration tests with MSW or supertest. This is the most significant gap.

### Static model data

Model evaluations are read-only. In a production system, new evaluations would arrive via an ingestion pipeline. The 16-model dataset covers enough edge cases (nulls, varying providers) to demonstrate the feature but is not representative of production volumes.

---

## Future Improvements

### Highest priority

- **Tests** — Vitest unit tests for services and repositories. Integration tests for API routes using MSW. E2E tests for core flows (leaderboard search, task status update, role switch).

### Medium priority

- **Database** — Replace in-memory arrays with Prisma + SQLite (dev) / PostgreSQL (production).
- **Authentication** — NextAuth.js with server-enforced role checks on task mutation endpoints.
- **Pagination** — Server-side pagination for the leaderboard when model count exceeds a threshold.

### Lower priority (would depend on product requirements)

- **Real-time updates** — SSE or WebSockets for task status changes across multiple annotators.
- **Charts** — Recharts or Visx for accuracy/cost/latency distribution visualizations in the client dashboard.
- **Audit log** — Record every task status change with user ID and timestamp.
- **Activity feed** — Recent model evaluations and task updates displayed on the home page.

---

## Interview Discussion Points

### Architecture layering

Code is split into types, data, repositories, services, API routes, hooks, and components. Repositories and services have zero Next.js or React imports, which means they can be unit-tested without framework infrastructure. API routes are thin — they parse input, delegate to services, and return responses — so business logic is not coupled to HTTP.

### Null handling strategy

`compareNullable()` is used for all sortable columns (accuracy, latency, costPer1k, evaluatedAt). Null values sort to the bottom regardless of direction. The function handles both numeric and string fields uniformly. Insight computation filters out models with null values in the relevant metric before selecting the best.

### Race condition prevention

Both `use-models` and `use-tasks` create a new `AbortController` per request and abort the previous one before fetching. The `finally` block only updates state if the current controller is still the active one. This prevents stale responses from overwriting newer data when dependencies change (e.g., rapid search typing or role switching).

### API envelope design

Every response follows `{ success: true, data }` or `{ success: false, error: { message, code } }`. The `code` field is machine-readable for programmatic handling (e.g., `INVALID_STATUS`, `NOT_FOUND`). The `message` field is human-readable. The client's `fetchModels` and `fetchTasks` check `res.ok` first, then parse the envelope.

### Client-side data derivation

Insights (`getInsights()`) are computed in the browser from the full dataset after the API response arrives, not on the server. This avoids a second API call. The tradeoff is that if the dataset grows large, computation should move server-side with a separate `/api/models/insights` endpoint. `useMemo` prevents recomputation on unrelated re-renders.

### Component memoization with React.memo

`LeaderboardTable`, `InsightCards`, `SearchBar`, `ProviderFilter`, `TaskCard`, `AnnotatorView`, `ClientDashboard`, `ProgressBar`, and `RoleSwitcher` are all wrapped in `React.memo`. The leaderboard page uses `useMemo` for insight derivation and sort state construction. This prevents re-render cascades when typing in the search bar or toggling the role switcher.

### Hydration safety

`ModeToggle` uses a `mounted` state flag initialized to `false`, set to `true` in `useEffect`. Until mounted, it renders a static icon with a hydration-safe aria-label. `useLocalStorage` reads from `window.localStorage` inside `useEffect` rather than during SSR, so the server-rendered HTML matches the initial client render regardless of what is in localStorage.