# CampusCore ERP - Frontend

A production-quality React.js ERP dashboard with responsive layout, collapsible sidebar, and mock data integration.

## Folder Structure

```
src/
├── api/
│   └── mockApi.js          # Mock API for async data fetching
├── app/
│   ├── App.jsx             # Root app with routing
│   └── routes.jsx          # Route definitions
├── assets/
│   └── styles/             # (Optional) additional styles
├── components/
│   ├── layout/
│   │   ├── Layout.jsx      # Main layout (sidebar + content)
│   │   ├── Navbar.jsx      # Top navigation bar
│   │   └── Sidebar.jsx     # Collapsible sidebar
│   └── ui/
│       ├── Button.jsx      # Reusable button
│       ├── Card.jsx        # Card container
│       ├── Input.jsx       # Form input
│       ├── Select.jsx      # Select dropdown
│       └── Table.jsx       # Data table
├── hooks/
│   └── useSidebar.js       # Sidebar open/close state
├── mock/
│   ├── dashboard.json      # Dashboard stats & activity
│   ├── reports.json        # Report records
│   └── users.json          # User records
├── pages/
│   ├── Dashboard.jsx       # Dashboard page
│   ├── Reports.jsx         # Reports page
│   ├── Settings.jsx        # Settings page
│   └── Users.jsx           # Users page
├── index.css               # Global styles + Tailwind
└── main.jsx                # Entry point
```

## Key Components

| Component | Description |
|-----------|-------------|
| **Layout** | Wraps pages with Sidebar + Navbar; handles responsive sidebar drawer on mobile |
| **Sidebar** | Collapsible nav (wide ↔ narrow) with smooth transitions |
| **Navbar** | Top bar with toggle button and branding |
| **Card** | Reusable content card with optional title |
| **Table** | Accessible data table with loading/empty states |
| **Button** | Variants: primary, secondary, outline, ghost, danger |
| **Input / Select** | Form controls with label and error display |

## Styling Approach

- **Tailwind CSS v4** via `@tailwindcss/vite`
- Neutral base palette (gray scale) + indigo primary accent
- Design tokens: spacing, radius, transitions in Tailwind config
- Hover states, focus rings, and loading skeletons built in

## Mock Data Setup

- `mock/users.json` — Users with id, name, email, role, department, status
- `mock/reports.json` — Reports with title, type, status, format
- `mock/dashboard.json` — Stats (students, teachers, etc.) and recent activity

`api/mockApi.js` simulates async fetch with delay. Replace with real API calls when backend is ready.

## Routing Structure

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/users` | Users |
| `/reports` | Reports |
| `/settings` | Settings |

## Design Decisions

1. **Neutral + Indigo** — Neutral grays for hierarchy; indigo for primary actions and active states, giving a professional, institutional feel.
2. **Sidebar behavior** — Desktop: collapsible wide/narrow; mobile: drawer with overlay, closed by default.
3. **Loading & errors** — Skeleton loaders and inline error messages to keep users informed.
4. **Accessibility** — Semantic HTML (`main`, `nav`, `header`), `aria-label`/`aria-expanded`, focus rings, and keyboard support.
5. **Modular structure** — Layout, UI, pages, and mock API separated for easy maintenance and future backend integration.

## Commands

```bash
npm install   # Use --legacy-peer-deps if peer dependency conflicts occur
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```
