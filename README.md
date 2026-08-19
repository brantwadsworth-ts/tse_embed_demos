# DoorDash Brand Portal — ThoughtSpot RLS & Spotter Demo

A Next.js demo app built for a DoorDash sales engagement. It demonstrates ThoughtSpot **Row-Level Security (RLS)** — the same Liveboard filtered per user based on their RLS scope — plus an embedded **Spotter** conversational AI page and an admin tool to provision new demo users end-to-end.

---

## Prerequisites

- **Node.js 20+** (`node -v` to check; use [nvm](https://github.com/nvm-sh/nvm) to install if needed)
- **npm** (comes with Node)
- A `.env.local` file with credentials — copy `.env.local.example` to `.env.local` and fill in the values (get `TS_SECRET_KEY` from Ron)

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd tse-doordash-rls
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add credentials

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values — the comments in the file explain each one. The only value not documented there is `TS_SECRET_KEY`; get that from Ron.

---

## Running the app

### Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Hot-reload works in this mode.

### Production build (required for ngrok / sharing externally)

```bash
npm run build
npm start
```

> ⚠️ **Always use `npm start` (not `npm run dev`) when tunneling through ngrok.** Next.js dev mode opens a WebSocket for Hot Module Replacement that breaks through tunnels and causes interactions to stop working.

---

## Demo users

Log in with any of these usernames — **password can be anything** (auth is demo-only):

| Username | Role | Sees |
|---|---|---|
| `dd_internal_admin@dd.com` | Internal Admin | All countries |
| `dd_coke_admin@coke.com` | Coke Admin | All countries |
| `dd_coke_regmgr@coke.com` | Coke Region Manager | EU region only |
| `dd_coke_countrymgr@coke.com` | Coke Country Manager | Germany (DE) only |

RLS is enforced by ThoughtSpot itself — the app doesn't filter data client-side. Each user's scope is baked into their ThoughtSpot profile via formula variables (`dd_Country`, `dd_Region`, `dd_Company`).

---

## Pages

| Page | What it shows |
|---|---|
| **Overview** | Embedded Liveboard with a Country runtime-filter dropdown. The dropdown is populated by querying ThoughtSpot *as the logged-in user*, so it only shows countries within their RLS scope. |
| **AI Analytics** | Spotter conversational AI, DoorDash-branded. |
| **User Onboarding** | Admin-only (`dd_internal_admin@dd.com`). Creates a new ThoughtSpot user, assigns a group, and sets RLS variable values — all in one API call. Can also delete non-seed users. |
| Everything else | Placeholder nav links (no content). |

---

## Sharing the demo externally (ngrok)

1. Build and start the production server: `npm run build && npm start`
2. In a second terminal, run ngrok pointed at port 3000:

```bash
ngrok http --url=https://<your-reserved-domain> 3000
```

Use a reserved static domain (available on the ThoughtSpot ngrok account) so the URL stays stable across sessions. Get the domain from Ron.

---

## Project structure (quick reference)

```
app/
  landing/        Login page
  api/            API routes (token, admin user CRUD, etc.)
  page.tsx        Root redirect (handled by proxy.ts middleware)
components/       React components (nav, Liveboard embed, Spotter embed, etc.)
lib/
  thoughtspot.ts  All server-side ThoughtSpot REST calls
  demoUsers.ts    File-backed demo user store (reads/writes data/demo-users.json)
  session.ts      Cookie-read helper used by every protected route
  embedInit.ts    ThoughtSpot Visual Embed SDK init() call
  embedBranding.ts  Env-driven Spotter/Liveboard branding
proxy.ts          Next.js middleware — redirects / ↔ /landing based on session
data/             Runtime demo-user store (gitignored, auto-created on first run)
```

---

## Common issues

**"User not found" after onboarding a new user**
The demo user store is file-backed (`data/demo-users.json`). If the file gets deleted or the `data/` directory is missing, it will be re-created from the 4 seed users automatically on the next request.

**App seems broken through ngrok**
Make sure you're running `npm start`, not `npm run dev`. See [Running the app](#running-the-app) above.

**Liveboard / Spotter shows an auth error**
Double-check `TS_SECRET_KEY` and `TS_ORG_IDENTIFIER` in `.env.local`. The secret key is found in the ThoughtSpot admin panel under **Develop → Customization → Security Settings**.
