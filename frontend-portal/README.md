# Frontend Portal — Architecture & Design System

A production-oriented administrative portal foundation built with **Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-compatible component architecture, Mock Service Worker (MSW), and Docker**.

---

## 1. Project Overview

This portal serves as the frontend for an administrative operations platform. Business-data routes currently return local sample records; authentication is proxied server-side to the configured Python backend or the development-only mock adapter.

Key architectural highlights:
- **Zero Direct `fetch()` In UI Components**: 100% of data flow passes through the centralized client at `src/lib/api/client.ts`.
- **Provisional Typed API Contracts**: Strict TypeScript contracts matching draft backend specifications.
- **Full Theme Persistence**: Hydration-safe Light/Dark/System themes powered by `next-themes` and CSS design tokens.
- **Complete Component Suite**: 8 shadcn/ui-compatible accessible components with WCAG-compliant keyboard focus states.
- **Production Containerization**: Multi-stage Docker build utilizing Next.js standalone output and non-root execution (`nextjs:1001`).
- **Health Monitoring**: Native Next.js Route Handler at `/health` for container orchestration probes.

---

## 2. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components, standalone output |
| **Language** | TypeScript | Strict mode enabled (`strict: true`) |
| **UI Library** | React 19 | Client/Server component separation |
| **Styling** | Tailwind CSS v4 & Vanilla CSS Tokens | CSS Custom Properties, semantic color tokens |
| **Icons** | Lucide React | Clean, consistent SVG icon set |
| **Theme Engine** | next-themes | SSR hydration-safe light/dark switching |
| **API Mocking** | Mock Service Worker (MSW v3) | Browser Service Worker interception |
| **Validation** | Zod | Runtime contract validation |
| **Containerization**| Docker & Docker Compose | Multi-stage Alpine build, non-root user |
| **Quality** | ESLint & TypeScript Compiler | Zero-warning linting and strict type checking |

---

## 3. Folder Structure

```text
Task_1/
├── docker-compose.yml              # Root Docker Compose runner
├── README.md                       # Comprehensive documentation
└── frontend-portal/
    ├── public/
    │   ├── mockServiceWorker.js    # MSW root worker script
    │   └── mocks/
    │       └── mockServiceWorker.js# MSW CLI generated worker
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Root layout with Theme, Toast, MSW, AppShell
    │   │   ├── page.tsx            # Redirects to /dashboard
    │   │   ├── globals.css         # Semantic CSS tokens & theme variables
    │   │   ├── health/
    │   │   │   └── route.ts        # GET /health container probe
    │   │   ├── api/                # Fallback server route handlers
    │   │   │   ├── dashboard/route.ts
    │   │   │   ├── users/route.ts
    │   │   │   └── projects/route.ts
    │   │   ├── dashboard/
    │   │   │   └── page.tsx        # KPI metrics, activity, project summary
    │   │   ├── users/
    │   │   │   └── page.tsx        # Searchable, paginated directory + Dialog
    │   │   ├── projects/
    │   │   │   └── page.tsx        # Project portfolio (Grid/Table view)
    │   │   ├── settings/
    │   │   │   └── page.tsx        # Theme settings & Toast testing
    │   │   └── not-found.tsx       # 404 handler
    │   ├── components/
    │   │   ├── ui/                 # 8 Reusable UI components
    │   │   │   ├── button.tsx      # primary, secondary, outline, ghost, destructive
    │   │   │   ├── input.tsx       # labels, validation errors, disabled states
    │   │   │   ├── card.tsx        # header, title, description, content, footer
    │   │   │   ├── table.tsx       # accessible semantic table hierarchy
    │   │   │   ├── dialog.tsx      # modal with overlay and keyboard ESC handling
    │   │   │   ├── toast.tsx       # success, error, info notifications + provider
    │   │   │   ├── badge.tsx       # status and category badges
    │   │   │   └── skeleton.tsx    # loading placeholder blocks
    │   │   ├── layout/
    │   │   │   ├── app-shell.tsx   # Responsive desktop/mobile drawer layout
    │   │   │   ├── topbar.tsx      # Breadcrumbs, quick search, theme, user menu
    │   │   │   ├── sidebar.tsx     # Route navigation with active indicators
    │   │   │   └── theme-toggle.tsx# Hydration-safe light/dark toggle
    │   │   └── providers/
    │   │       ├── theme-provider.tsx # next-themes wrapper
    │   │       └── msw-provider.tsx   # Client-side MSW bootstrap
    │   ├── lib/
    │   │   ├── api/
    │   │   │   ├── client.ts       # Centralized ApiClientError & request methods
    │   │   │   ├── dashboard.ts    # getDashboardData()
    │   │   │   ├── users.ts        # getUsers(filters)
    │   │   │   └── projects.ts     # getProjects(filters)
    │   │   ├── types/
    │   │   │   ├── api.ts          # Generic ApiResponse & PaginatedResponse
    │   │   │   ├── dashboard.ts    # Dashboard contracts
    │   │   │   ├── user.ts         # User contracts
    │   │   │   └── project.ts      # Project contracts
    │   │   └── utils.ts            # cn(), formatDate(), formatRelativeTime()
    │   └── mocks/
    │       ├── browser.ts          # setupWorker(...handlers)
    │       ├── handlers.ts         # MSW HTTP interceptors with simulated delay
    │       └── data/
    │           ├── dashboard.ts    # Deterministic mock metrics
    │           ├── users.ts        # Mock user records
    │           └── projects.ts     # Mock projects
    ├── .dockerignore
    ├── .env.example
    ├── .env.local
    ├── .gitignore
    ├── components.json
    ├── Dockerfile                  # Multi-stage Alpine production build
    ├── docker-compose.yml          # Container configuration
    ├── next.config.ts              # output: 'standalone'
    ├── package.json
    └── tsconfig.json
```

---

## 4. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (Tested on `v22.23.1`)
- **npm**: `v10.x` or higher
- **Docker & Docker Compose** (Optional, for containerized execution)

---

## 5. Local Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd Task_1/frontend-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify the MSW Service Worker script** (optional; protected API endpoints use Next.js handlers):
   ```bash
   npx msw init public/mocks --save
   ```

---

## 6. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
# Windows PowerShell:
Copy-Item .env.example -Destination .env.local

# Linux / macOS:
cp .env.example .env.local
```

### Environment Variables Reference

| Variable | Default | Scope | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | Server/Build | Node execution environment |
| `PORT` | `3000` | Server | Application port |
| `NEXT_PUBLIC_API_MOCKING` | `enabled` | Public/Browser | Enables MSW worker bootstrap; auth and protected API data stay on Next.js routes |
| `NEXT_PUBLIC_APP_NAME` | `Portal` | Public/Browser | Display application name |

> **Security Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed in browser bundles. Never place credentials, database passwords, or JWT secrets in `NEXT_PUBLIC_*` variables.

### Authentication

Browser API requests go through this Next.js application's `/api` routes. The
Python authentication backend URL and session token remain server-side.
Next.js 16's `proxy.ts` validates sessions before protected pages render, and
protected API handlers perform their own authentication and role checks.

The adapter currently expects `POST /auth/login` to accept JSON email/password
and return an opaque backend-issued `access_token` with a positive integer
`expires_in`. It validates that token through `GET /auth/me` using a Bearer
authorization header; that endpoint must return a user with `id`, `email`,
`name`, and role `employee` or `admin`. `POST /auth/logout` receives the same
token for backend revocation. The token is never signed or stored in browser
storage. Its cookie is HTTP-only, `Path=/`, `SameSite=Lax`, `Secure` in
production, and expires no later than the backend-reported lifetime.

When the Python service is unavailable for local work, set
`AUTH_DEV_MOCK_ENABLED=true` and `NEXT_PUBLIC_AUTH_DEMO_ENABLED=true`. This
development-only mock is available only under `NODE_ENV=development` and is
unavailable in production. The Python service and its response contract are
not present in this workspace, so verify these endpoint details before
connecting to that backend.

---

## 7. Development & Production Commands

All commands are run from `Task_1/frontend-portal`:

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm run dev` | Runs Next.js with hot reload on `http://localhost:3000` |
| **Run Linter** | `npm run lint` | Runs ESLint across `src/` |
| **TypeScript Check** | `npx tsc --noEmit` | Strict compilation verification without emitting files |
| **Production Build** | `npm run build` | Builds optimized Next.js standalone bundle |
| **Production Start** | `npm run start` | Starts standalone server (`node .next/standalone/server.js`) |

---

## 8. Mock Service Worker (MSW) Guide

The MSW bootstrap remains available, but `src/mocks/handlers.ts` intentionally
contains no browser request handlers. Mock business data is served by Next.js
API routes so authentication and authorization always run on the server.
Browser service-worker mocks do not intercept server-side requests and must not
be treated as an authentication layer.

---

## 9. API Endpoint Contracts & Example Responses

### 1. `GET /api/dashboard`
Returns executive KPI statistics, system status, recent audit trail, and project summaries.

**Example Response:**
```json
{
  "metrics": {
    "totalUsers": {
      "label": "Total Users",
      "value": "2,845",
      "changePercent": 12.5,
      "changeType": "increase",
      "description": "vs. last month (+316 users)"
    },
    "activeProjects": {
      "label": "Active Projects",
      "value": "38",
      "changePercent": 5.4,
      "changeType": "increase"
    },
    "completedTasks": {
      "label": "Completed Tasks",
      "value": "1,248",
      "changePercent": 18.2,
      "changeType": "increase"
    },
    "systemStatus": {
      "status": "operational",
      "uptimePercent": 99.98,
      "activeNodes": 8,
      "latencyMs": 24
    }
  },
  "recentActivities": [
    {
      "id": "act-1",
      "userName": "Shivraj Ghode",
      "action": "deployed release candidate",
      "target": "v2.4.0 to production",
      "timestamp": "2026-10-12T12:00:48.242Z",
      "category": "project"
    }
  ],
  "projectSummaries": [
    {
      "id": "proj-1",
      "name": "Cloud Migration Phase 2",
      "category": "Infrastructure",
      "status": "active",
      "progress": 74,
      "lead": "Marcus Vance"
    }
  ]
}
```

---

### 2. `GET /api/users`
Supports query parameters:
- `search` (string): Filters across name, email, department
- `role` (`admin` | `developer` | `editor` | `viewer`)
- `status` (`active` | `pending` | `inactive`)
- `page` (number, default: `1`)
- `limit` (number, default: `10`)

**Example Response:**
```json
{
  "data": [
    {
      "id": "usr-001",
      "name": "Shivraj Ghode",
      "email": "shivraj.ghode@growmar.io",
      "role": "admin",
      "status": "active",
      "department": "Engineering",
      "createdAt": "2024-01-15T09:30:00Z",
      "lastLoginAt": "2024-10-12T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. `GET /api/projects`
Supports query parameters: `search`, `status`, `priority`.

**Example Response:**
```json
[
  {
    "id": "proj-101",
    "name": "Enterprise Auth & RBAC Architecture",
    "description": "Multi-tenant role-based access control with OAuth2.",
    "status": "in_progress",
    "priority": "critical",
    "progress": 72,
    "owner": {
      "name": "Shivraj Ghode",
      "email": "shivraj.ghode@growmar.io"
    },
    "teamSize": 5,
    "createdAt": "2024-03-01T10:00:00Z",
    "updatedAt": "2024-10-12T06:30:00Z",
    "dueDate": "2024-11-15T00:00:00Z",
    "tags": ["Security", "OAuth2", "Architecture"]
  }
]
```

---

## 10. Health Check Endpoint

A dedicated Next.js Route Handler is located at:
`GET /health`

**Testing via PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get | ConvertTo-Json
```

**Testing via curl:**
```bash
curl -s http://localhost:3000/health
```

**Output:**
```json
{
  "status": "ok",
  "application": "frontend-portal",
  "environment": "production",
  "timestamp": "2026-10-12T13:17:21.038Z",
  "uptime": 143.25
}
```

---

## 11. Docker & Docker Compose Deployment

The portal includes a hardened, multi-stage `Dockerfile`:
- **Stage 1 (base)**: Alpine Node.js 22
- **Stage 2 (deps)**: Reproducible `npm ci`
- **Stage 3 (builder)**: Compiles standalone bundle
- **Stage 4 (runner)**: Minimal image executing under non-root user `nextjs` (UID 1001)

### Running with Docker Compose

From the root `Task_1` directory or `Task_1/frontend-portal`:

```bash
# Build and start the container in detached mode:
docker compose up --build -d

# Inspect running container status:
docker compose ps

# View real-time container logs:
docker compose logs -f frontend

# Stop and remove containers:
docker compose down
```

The portal will be immediately available at: **`http://localhost:3000`**.

---

## 12. Replacing Mock APIs with Real Python Backend

Because all API traffic is strictly routed through `src/lib/api/client.ts`, no UI components or page files need to be edited when switching to the Python backend.

### Migration Steps:
1. Update your server-side environment:
   ```env
   AUTH_BACKEND_URL=http://localhost:8000
   AUTH_DEV_MOCK_ENABLED=false
   ```
2. Keep browser requests same-origin through the Next.js `/api` routes; do not expose the backend URL as a `NEXT_PUBLIC_*` setting.
3. Verify the Python service implements the authentication endpoint and response contract documented above before disabling the development mock.

---

## 13. Verification Checklist

| Requirement | Status | Verification Method |
| :--- | :---: | :--- |
| **Next.js App Router & TypeScript Strict** | PASS | `npx tsc --noEmit` passed with 0 errors |
| **ESLint Standards** | PASS | `npm run lint` passed with 0 errors |
| **8 Reusable UI Components** | PASS | Button, Input, Card, Table, Dialog, Toast, Badge, Skeleton implemented |
| **Responsive Shell & Navigation** | PASS | Desktop sidebar & mobile drawer tested |
| **Theme Switching (Light/Dark)** | PASS | `next-themes` verified in browser test |
| **Centralized API Layer** | PASS | No direct `fetch()` calls in components |
| **MSW Browser Mocking** | LIMITED | Worker bootstrap exists; protected endpoints are not intercepted by browser handlers |
| **Search & Pagination** | PASS | Tested live filtering and multi-page pagination |
| **GET /health Endpoint** | PASS | Returns `status: "ok"` and timestamp |
| **Multi-Stage Dockerfile** | PASS | Standalone output, non-root user `nextjs:1001` |
| **Docker Compose** | PASS | `docker-compose.yml` with health check probe |

---

## 14. Known Assumptions & Notes

- **Browser Service Workers**: MSW requires browser environment support. Protected API endpoints are served and authorized by Next.js handlers, not by browser-side MSW.
- **Node.js LTS**: Tested on Node.js v22.23.1 and Docker Compose v5.3.0.
