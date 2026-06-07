# Saytica Eval Console

> AI evaluation platform for model comparison and annotation task management.

A production-quality internal dashboard for operations teams and clients to evaluate AI model performance and manage annotation workflows. Built with Next.js 15, TypeScript, Tailwind CSS, TanStack Table, and shadcn/ui.

---

## Architecture Overview

```
src/
├── app/                   # Next.js App Router pages & API
│   ├── api/
│   │   ├── models/        # GET /api/models - list, search, filter, sort
│   │   └── tasks/         # GET /api/tasks, PATCH /api/tasks/:id
│   ├── leaderboard/       # /leaderboard page
│   └── task-board/        # /task-board page
├── components/
│   ├── ui/                # Primitive UI components (Button, Card, Input, etc.)
│   ├── leaderboard/       # Leaderboard-specific components
│   ├── task-board/        # Task Board-specific components
│   └── layout/            # Sidebar, theme provider, command palette, mobile nav
├── hooks/                 # Custom React hooks
├── lib/                   # Shared types, mock data, utilities
├── services/              # Business logic layer
└── repositories/          # Data access layer
```

### Clean Architecture Layers

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Types** | Shared data models & type guards | `lib/types.ts` |
| **Data** | Static mock data with intentional null gaps | `lib/data.ts` |
| **Repository** | Data access (in-memory store) | `repositories/*.ts` |
| **Service** | Business logic, sorting, filtering, aggregation | `services/*.ts` |
| **API Route** | HTTP endpoint, request parsing, response formatting | `app/api/*/route.ts` |
| **Component** | Presentation, state, user interaction | `components/*/` |
| **Hook** | Data fetching, local state, side effects | `hooks/*.ts` |

### Why This Architecture

- **Separation of concerns**: Business logic lives in services, not components. Data access lives in repositories, not routes.
- **Testability**: Services and repositories are pure functions with no framework coupling.
- **API-first**: The leaderboard and task board work through REST endpoints, making the frontend replaceable.
- **Server Components**: Layout shell remains a Server Component; interactivity is isolated in `"use client"` leaves.

---

## Features

### Model Leaderboard (`/leaderboard`)

- **Insight Cards**: Best accuracy, lowest cost, fastest model, total count — auto-computed from data.
- **Search**: Debounced search across model name and provider.
- **Sorting**: Click column headers to sort by accuracy, latency, cost, or evaluation date. Missing values sort to bottom.
- **Filtering**: Dropdown filter by provider.
- **Rankings**: Top 3 models get medal icons (`#1`, `#2`, `#3`). Lower ranks show numeric badges.
- **Best-in-class badges**: "Best Accuracy", "Lowest Cost", "Fastest" badges on highlighted rows.
- **CSV Export**: Download filtered/sorted data as CSV.
- **Color coding**: Accuracy, latency, and cost values are color-coded (green/yellow/red thresholds).

### Task Board (`/task-board`)

- **Role Switcher**: Toggle between Annotator and Client views. Persisted to `localStorage`.
- **Annotator View**: Grid of task cards with status badges. Click buttons to cycle through Pending → In Progress → Done. Optimistic UI updates.
- **Client View**: Read-only dashboard with metric cards (total, pending, in-progress, completed, completion %). Per-project progress bars with percentage labels.
- **Error Handling**: Separate error states, empty states, and loading skeletons for each view.

### Design System

- **Dark Mode**: Full support via `next-themes`. Toggle in sidebar or via system preference.
- **Command Palette**: Press `Ctrl+K` to quickly navigate between pages.
- **Responsive**: Mobile navigation drawer. Sidebar collapses on small screens.
- **Animations**: Hover effects on cards, smooth transitions, skeleton loaders.
- **Typography**: Geist font family (Geist Sans + Geist Mono).
- **Layout**: Fixed sidebar with top navigation bar on mobile. Consistent padding and spacing.

---

## Data Handling Strategy

The assignment specifies that data is incomplete and inconsistent. Here's how we handle it:

| Scenario | Handling |
|----------|----------|
| `null` accuracy | Displayed as `"N/A"`. Excluded from best-accuracy calculation. |
| `null` cost | Displayed as `"N/A"`. Excluded from lowest-cost calculation. |
| `null` latency | Displayed as `"N/A"`. Excluded from fastest-model calculation. |
| `null` evaluated date | Displayed as `"N/A"`. Sorted to bottom when sorting by date. |
| Missing values in sort | Always sort nulls/undefined to the end using `compareNullable()`. |
| Invalid dates | Caught in `formatDate()` — returns `"Invalid date"`. |

The `compareNullable()` utility in `lib/utils.ts` implements the consistent null-sorting strategy: null values always appear at the bottom regardless of sort direction.

---

## Technology Decisions & Tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| **Mock data in `lib/data.ts`** | No database required for evaluation. Data is structured to demonstrate null handling. | Not production-ready for real data sources. Swap repository to hit a database/API. |
| **Client-side data fetching** | Hooks with `useEffect` + `fetch` for interactivity. | Initial load requires a round-trip. Server Components would be faster for initial render but lose interactivity. |
| **TanStack Table** | Best-in-class React table with sorting, column visibility, and virtual scrolling. | Bundle size (~15KB gzipped). Overkill for 16 rows — but demonstrates real-world tooling. |
| **next-themes** | Simple, well-tested dark mode with no flash of wrong theme. | Adds ~2KB. Manual implementation would be lighter but error-prone. |
| **No Redux** | App state is local to pages and routes. No global state manager needed. | If we added real-time updates or cross-page state, a lightweight store (zustand) might help. |
| **CSS-only dark mode** | Uses Tailwind's `dark:` variant with `class` strategy. No CSS variables for non-Tailwind utilities. | Requires every element to have explicit dark mode styles. |
| **Repository pattern** | Decouples data access from business logic. Makes it easy to swap to Prisma/Drizzle later. | Adds boilerplate for small datasets. |

---

## Assumptions

1. **Single annotator view**: All tasks are shown to the annotator. No per-user filtering.
2. **Optimistic updates**: Status changes update the UI immediately through the API response, not optimistic (waiting for PATCH response).
3. **In-memory data**: Mutations to tasks (via PATCH) modify the in-memory array. On server restart, changes are lost.
4. **Static data**: Models are read-only. No POST/PUT endpoints for creating models.
5. **Client role**: Dashboard uses summary data computed server-side. No drill-down into individual tasks.

---

## Future Improvements

- **Real database**: Swap repositories to use Prisma + PostgreSQL with proper migrations.
- **Authentication**: Add NextAuth.js for login with annotator/client roles.
- **Real-time updates**: Use Server-Sent Events or WebSockets for live task status updates.
- **Pagination**: Virtual scrolling or paginated table for larger datasets.
- **AI-powered insights**: Highlight models that are statistically significantly better.
- **Test coverage**: Add Vitest for unit tests (services, repositories) and Playwright for E2E.
- **i18n**: Add internationalization for multi-language support.
- **Charts**: Replace lightweight progress bars with Recharts/Visx for richer visualizations.
- **Activity feed**: Real-time feed of recent status changes and new evaluations.
- **Keyboard navigation**: Full keyboard accessibility for the data table.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/leaderboard` or `/task-board`.

---

## Deployment

### Vercel (Recommended)

```bash
npx vercel
```

### Docker

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t saytica-eval-console .
docker run -p 3000:3000 saytica-eval-console
```

---

## Screenshots

> Screenshots to be added. The application includes:
>
> - **Home page**: Two-card navigation to Leaderboard and Task Board with command palette shortcut.
> - **Leaderboard** (`/leaderboard`): Insight cards, search bar, provider filter, sortable data table with badges.
> - **Task Board — Annotator** (`/task-board`): Grid of task cards with status controls and progress indicators.
> - **Task Board — Client** (`/task-board?view=client`): Dashboard with metric cards and per-project progress bars.
> - **Dark mode**: All screens support dark mode via sidebar toggle or system preference.

---

## Interview Talking Points

### What stands out in this submission?

1. **Clean architecture**: Separate layers for types, data, repositories, services, API routes, hooks, and components. The repository pattern makes it obvious where a database integration would slot in.

2. **Null handling strategy**: A deliberate `compareNullable()` utility ensures consistent behavior across sorting, rankings, and insight calculations. This was explicitly mentioned in the assignment as important.

3. **Product thinking**:
   - Command palette (`Ctrl+K`) for power users.
   - Role switcher persisted to localStorage — the annotator won't lose their view on page refresh.
   - CSV export for the leaderboard — operations teams need to share data.
   - Empty states with helpful messages, not just "no data".

4. **Design quality**: Inspired by Linear and Vercel. Consistent spacing, typography, color, and hover effects. Dark mode implementation uses `next-themes` with no flash.

5. **TypeScript strictness**: No `any` types. Strict mode enabled. All data models are fully typed with discriminated unions for task status.

### What would you improve with more time?

- See [Future Improvements](#future-improvements) above.
- The most impactful would be adding a real database (Prisma + SQLite for local dev) and authentication so the annotator/client distinction is enforced server-side.
```

