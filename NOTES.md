# BYU ECE Package Tracker — Project Notes

## What This App Is
A mailroom management system for the BYU Electrical & Computer Engineering department.
Secretaries use it to log incoming packages, track their status, and record pickups.

## Users
- **Secretaries** — primary users. Log packages, check in/out, manage recipients
- **Students/Recipients** — will eventually see their own packages when logged in.
  Currently lowest priority — focus is on secretary/admin view for now.
- **Admins** — manage dropdown options (carriers, senders) via Admin panel

## Tech Stack
- **Framework**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS with BYU branding
- **Infrastructure**: Docker (PostgreSQL container)

---

## Intended Features

### Package Logging (Add Package Form)
- Date arrived auto-populates to today
- **Carrier** dropdown: Amazon, FedEx, UPS, USPS, DHL, Other — editable via Admin panel
- **Sender** dropdown: Amazon, ThorLabs, McMaster Carr, Mouser, DigiKey, Other — editable via Admin panel
- **Recipient** dropdown: pulls from department database (BYU integration TBD, filler data for now)
- **Logged by** dropdown: secretary who filled out the form

### Package Pickup / Delivery
- Secretary marks package as picked up or delivered
- **Picked up by** and **Delivered to office** are mutually exclusive:
  - If a recipient is selected, "Delivered to Office" is grayed out
  - If "Delivered to Office" is checked, recipient dropdown is grayed out
- **Delivered by**: dropdown of secretaries

### Admin Panel
- Manage carriers (add/edit/delete)
- Manage senders (add/edit/delete)
- Student/secretary lists managed via Prisma Studio until auth is implemented

### Auth (TBD — boss is investigating)
- Secretary and recipient lists will eventually come from auth system or BYU database
- App is architected so the data source can be swapped without changing frontend components

---

## Build Order
For each new feature: **Prisma → API Endpoints → Frontend**

1. Schema changes + migrations
    - docker compose -f docker-compose.migrate.yaml up -d
    - npx prisma generate
    - npx prisma migrate dev --name give-migration-a-name
    - npx prisma studio
2. Seed filler data (students, secretaries, carriers, senders, packages)
3. API routes for new models (carriers, senders)
4. Update Admin panel (`crudConfigs`) for carriers and senders
5. Update Add/Edit package modals with new dropdowns
6. BYU database integration for recipients (when ready)
7. Auth implementation (when boss has a plan)

---

## Conventions
- IDs are string CUIDs (never numbers)
- `lib/clientApi.ts` is the frontend HTTP layer — all fetch() calls go here
- `types/` folder is compile-time only — no logic, just shapes
- Docker must be running before `npm run dev` for database connectivity