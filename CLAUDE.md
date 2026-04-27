# Package Tracker

BYU ECE department package tracking app. Secretaries log incoming packages, recipients get notified, and packages are checked out when picked up or delivered to the office.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** — BYU brand tokens defined in `app/globals.css`
- **Prisma 6** + **PostgreSQL**
- **@dnd-kit** (core + sortable) — drag-and-drop reordering
- **@heroicons/react**, **react-icons**
- Backend is Next.js API routes — no separate server
- `proxy.ts` at the project root (Next 16's replacement for the deprecated `middleware.ts` convention)

## Run locally

```bash
npm install
# .env.local must define DATABASE_URL=postgres://...
npx prisma migrate dev
npm run dev   # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`.

## Template-Repo relationship — read before touching `components/ui/*`

This project consumes UI primitives from a sibling template repo at `../Template-Repo/` (BYU ECE template). The `components/ui/` folder is effectively a **vendored copy** of those primitives, structured to mirror the template:

| Template path | This project |
|---|---|
| `components/general/actions/*` | `components/ui/*` (Button, IconButton, ToggleSwitch) |
| `components/general/data-display/*` | `components/ui/tables/*`, `components/ui/SearchBar.tsx` |
| `components/general/feedback/*` | `components/ui/Toast.tsx`, `components/ui/Spinner.tsx` |
| `components/general/forms/*` | `components/ui/forms/*` |
| `components/general/overlays/*` | `components/ui/modals/*` |

Every file in `components/ui/` carries a top-of-file provenance comment indicating its relationship to the template:

- **`IDENTICAL to Template-Repo: <path>`** — byte-equivalent (modulo line endings). Touching the body creates divergence and makes re-syncing painful.
- **`IDENTICAL ... Only difference: import paths`** — same as above, just with `@/components/ui/...` paths instead of `@/components/general/...`.
- **`MODIFIED from Template-Repo: <path>`** — diverged on purpose. The comment lists what changed and why it's worth upstreaming.
- **`NOT IN Template-Repo — built locally`** — new component. The comment notes whether it's a candidate for upstreaming or app-specific.

### The UI folder rule

**Default to not editing anything in `components/ui/`. Ask the user first.**

If the user agrees, the change must be:

1. **Upstream-worthy** — would benefit other apps using the same template. PT-specific tweaks belong at the call site, not in the primitive.
2. **Backward-compatible** — prefer optional props with sensible defaults over breaking existing callers.
3. **Documented** — update the file's provenance comment (IDENTICAL → MODIFIED, with what changed and why).

**Where PT-specific UI behavior goes instead:**
- One-off styling: a wrapping `<div>` at the call site.
- App-specific logic in a form: `CustomField` slot inside `<FormModal>`.
- App-specific layout in a wizard step: anything as `StepConfig.content`, optionally inside `<FormGrid>` to match form-modal styling.
- App-specific patterns built on top of primitives: `components/ui/admin/` (already established) or `components/dashboard/`.

## Directory map

```
app/
  page.tsx              Home — PackageDashboard or StudentDashboard based on role
  layout.tsx            Root — bare <main className="flex-1">. Don't add overflow-hidden.
  globals.css           Tailwind theme + BYU brand tokens
  Admin/page.tsx        Tabbed admin page (DropdownEditor, AdminCrudPanel)
  api/                  REST routes — packages, carriers, senders, users
components/
  dashboard/            Package table + Add/Edit/View/CheckOut modals + status badge + filters
  dev/                  Mock auth/role providers + dev sign-in picker (dev only — replace before prod)
  layout/               header, footer, pageTitle (PT-owned)
  ui/                   Vendored template primitives — see Template-Repo section above
    forms/              FieldWrapper, FormGrid, SelectField, TextLikeField, Typeahead,
                        CheckboxField, RadioGroupField, FilePicker, PinField, formField{Styles,Types}
    modals/             BaseModal, ConfirmModal, FormModal, StepModal, TabModal
    tables/             DataTable, Pagination, RowActionMenu
    admin/              AdminCrudPanel, AdminTabs, DropdownEditor (built on primitives, app-level)
    Button, IconButton, SearchBar, Spinner, Toast, ToggleSwitch
lib/
  api/                  Client-side fetch wrappers — use these, not raw fetch
  adminConfigs.ts       Maps admin tabs → components + endpoints
  devAccounts.ts        Hardcoded dev sign-in accounts
  prisma.ts             Prisma singleton
types/                  Package, User, Dropdown, Pagination
utils/                  Helpers
prisma/                 schema.prisma + migrations
proxy.ts                Next 16 proxy file (replaces deprecated middleware.ts)
```

## Data model

- **User** — netId, email, fullName, role (STUDENT | SECRETARY | ADMIN)
- **Package** — recipient, carrier, sender, dateArrived, datePickedUp, checkedInBy, checkedOutBy, `deliveredToOffice`, `notificationSent`
- **Carrier / Sender** — name, `isActive` (soft delete), `sortOrder` (drag-reorder)
  - Delete endpoints return **409** if a package still references the entity

## Conventions

- **Styling:** use BYU Tailwind tokens from `app/globals.css`. Don't hardcode hex values.
- **API calls:** go through `lib/api/*` wrappers. Don't call `fetch` from components.
- **State:** local `useState` + props/callbacks. No Redux/Zustand/Context.
- **Search:** debounce 300ms before hitting the API.
- **Generics:** `DataTable<T>`, `AdminCrudPanel<T, CreatePayload>`, `AdminTabs<T>` — keep them generic; don't specialize per-entity.
- **Drag-and-drop:** `@dnd-kit` is used only in `DropdownEditor`. Keyboard sensor is wired for a11y — preserve it.

### Page format

Every working page follows this shape:

```tsx
<>
  <PageTitle title="..." />
  <div className="px-6 py-10">
    <div className="mx-auto max-w-7xl space-y-8">
      {/* page content */}
    </div>
  </div>
</>
```

`<PageTitle>` is full-bleed (rendered outside the content wrapper). The outer div provides margins; the inner div centers and caps width. Keep `app/layout.tsx`'s `<main>` bare (`<main className="flex-1">`) so it matches the template — don't add `overflow-hidden` (clips fixed-positioned modal overlays in some browsers even though the CSS spec says it shouldn't).

### Modal architecture

All modals compose `BaseModal`. **Don't reimplement modal chrome.**

- **`BaseModal`** — overlay, header, close button, escape, scroll lock; portal-renders to `document.body`. Slots: `topBar` (between header and body), `footer` (replaces default Cancel/Save). Default footer renders only when `footer` or `onSubmit` is provided.
- **`ConfirmModal`** — yes/no with danger/primary variants.
- **`FormModal<T>`** — declarative flat-field form via `fields[]` (input/select/radio/checkbox/custom). Uses `<FormGrid>` internally for the 2-column subgrid layout.
- **`StepModal`** — multi-step wizard with stepper dots, Back/Next/Submit-on-last. `StepConfig.content` is `ReactNode | (helpers) => ReactNode` so steps can branch.
- **`TabModal`** — controlled tabbed display.

**Modal usage convention:** `null` = closed, object = open. Parent owns state and passes `onClose` / `onSuccess`. Render conditionally (`{thing && <Modal pkg={thing} ...>}`) — unmount handles state reset.

**Wizard step content** that wants form-modal styling: wrap children in `<FormGrid>` and use `md:col-span-2` for full-width rows. Don't use `space-y-*` parents around `FieldWrapper` — `FieldWrapper`'s built-in `pb-6` plus the parent margin compounds and looks spaced-out. FormGrid uses subgrid for clean alignment.

### FormModal field config

`FormModal` consumes a typed `fields[]` array. Each entry is one of:

- `{ kind: 'select', key, label, options, placeholder?, required?, colSpan? }`
- `{ kind: 'radio', key, label, options, ... }`
- `{ kind: 'checkbox', key, label, ... }` *(boolean — sibling kind, not an InputField variant, because it carries a different value type)*
- `{ kind: 'custom', key, render, colSpan? }` — arbitrary JSX (Typeahead, info banners, error rows)
- *Default (no `kind`):* InputField — `{ key, label, type?: 'text'|'email'|'number'|'date'|'textarea'|'file'|'pin', placeholder?, required?, colSpan? }`

Set `colSpan: 2` for full-width rows; default is single column inside the 2-column grid.

### Toasts

- Fixed top-right, auto-dismiss 4s, `animate-fade-in-out`
- Via `useToast()` hook → `{ showToast, ToastContainer }`

### Portal pattern

Anything that needs to escape ancestor stacking/clipping context renders through `createPortal(content, document.body)`. Currently used in `BaseModal` and `RowActionMenu` — preserve this pattern when adding overlays.

## Don'ts

- Don't edit `components/ui/*` without explicit user permission — see the UI folder rule above.
- Don't reimplement modal chrome — compose `BaseModal` instead.
- Don't add `overflow-hidden` to `<main>` in `app/layout.tsx` — clips fixed-positioned modal overlays.
- Don't put `space-y-*` parents around `FieldWrapper` — the parent margin compounds with FieldWrapper's `pb-6`. Use `<FormGrid>` instead.
- Don't bypass `lib/api/*` with raw `fetch` in components.
- Don't hardcode BYU brand colors — reference the Tailwind tokens in `app/globals.css`.
- Don't introduce a global state library without discussion.
- Don't edit the generated Prisma client in `node_modules/@prisma/client`.
- Don't commit directly to `main`; work on `dev`.
