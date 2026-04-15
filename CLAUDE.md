# Package Tracker

BYU ECE department package tracking app. Secretaries log incoming packages, recipients get notified, and packages are checked out when picked up or delivered to the office.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** — BYU brand tokens defined in `css/globals.css`
- **Prisma 6** + **PostgreSQL**
- **@dnd-kit** (core + sortable) — drag-and-drop reordering
- **@heroicons/react**, **react-icons**
- Backend is Next.js API routes — no separate server

## Run locally

```bash
npm install
# .env.local must define DATABASE_URL=postgres://...
npx prisma migrate dev
npm run dev   # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`.

## Directory map

```
app/
  page.tsx              Dashboard entry (PackageDashboard)
  layout.tsx            Root layout (Header/Footer)
  Admin/page.tsx        Tabbed admin page
  api/                  packages, carriers, senders, users
components/
  dashboard/            Package table + Add/Edit/View/CheckOut modals
  admin/                DropdownEditor, AdminCrudPanel, SiteAdminTabs
  layout/               Header, Footer, PageTitle
  shared/               Modals, toasts, pagination, search, password gate
  ui/                   Generic DataTable, PrimaryButton, RowActionMenu
lib/
  api/                  Client-side fetch wrappers — use these, not raw fetch
  adminConfigs.ts       Maps admin tabs → components + endpoints
  prisma.ts             Prisma singleton
types/                  Package, User, Carrier, Sender, Toast, Pagination
utils/                  Helpers
css/globals.css         Tailwind theme + BYU tokens + animations
prisma/                 schema.prisma + migrations
```

## Data model

- **User** — netId, email, fullName, role (STUDENT | SECRETARY | ADMIN)
- **Package** — recipient, carrier, sender, arrival/pickup dates, check-in/out user
- **Carrier / Sender** — name, `isActive` (soft delete), `order` (drag-reorder)
  - Delete endpoints return **409** if a package still references the entity

## Conventions

- **Styling:** use BYU Tailwind tokens from `css/globals.css`. Don't hardcode hex values.
- **API calls:** go through `lib/api/*` wrappers. Don't call `fetch` from components.
- **State:** local `useState` + props/callbacks. No Redux/Zustand/Context.
- **Modals:** `null` = closed, object = open. Parent owns state; pass `onClose` / `onSuccess`.
- **Toasts:** fixed top-right, auto-dismiss 4s, `animate-fade-in-out`.
- **Search:** debounce 300ms before hitting the API.
- **Generics:** `DataTable<T>`, `AdminCrudPanel<T, CreatePayload>`, `AdminTabs<T>` — keep them generic; don't specialize per-entity.
- **Portal:** `RowActionMenu` renders through `createPortal` to escape table stacking context. Intentional — don't refactor away.
- **Drag-and-drop:** `@dnd-kit` is used only in `DropdownEditor`. Keyboard sensor is wired for a11y — preserve it.

## Don'ts

- Don't edit the generated Prisma client in `node_modules/@prisma/client`.
- Don't bypass `lib/api/*` with raw `fetch` in components.
- Don't hardcode BYU brand colors — reference the Tailwind tokens.
- Don't introduce a global state library without discussion.
- Don't commit directly to `main`; work on `dev`.
