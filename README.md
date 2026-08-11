# Salesloft × ThoughtSpot — Embedded Analytics Portal

A demo revenue-intelligence portal styled as a Salesloft product surface, with
ThoughtSpot embedded throughout via the
[Visual Embed SDK](https://developers.thoughtspot.com/docs). Built with Vite +
React + TypeScript. Deploys to Vercel.

## What's in it

| Tab | ThoughtSpot embed | Notes |
| --- | --- | --- |
| **My Reports** | — | Landing / overview |
| **Analytics** | `LiveboardEmbed` | Full liveboard with a **Rep** dropdown runtime filter (`HostEvent.UpdateRuntimeFilters`) |
| **Cadences** | — | Static Salesloft-style view |
| **Signals** | `LiveboardEmbed` (single viz) | One visualization from the Analytics liveboard; right-click a row → **Re-engage cadence** custom action opens a Win-Back Cadence modal |
| **Ask Salesloft** | `SpotterEmbed` | "Salesloft AI" chat: general questions answered from a small FAQ/knowledge base, data questions routed to Spotter via `HostEvent.SpotterSearch`; playful trial-upgrade modal |

Other details: dark/light theming (`--sl-*` tokens + `data-theme`), Plus Jakarta
Sans (embedded), official Salesloft logo, and custom actions wired to host-app
React modals.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc + vite build -> dist/
npm run preview  # preview the production build
```

> If `node`/`npm` aren't on your PATH, they may live at `~/.node/bin`:
> `export PATH="$HOME/.node/bin:$PATH"`.

## Configuration

- **ThoughtSpot IDs & flags** live in [`src/config.ts`](src/config.ts) —
  liveboard ID, worksheet/model ID, viz IDs, custom-action IDs, embed flags,
  and the theming CSS variables.
- **ThoughtSpot host** and auth are set in [`src/lib/thoughtspot.ts`](src/lib/thoughtspot.ts)
  via the SDK `init()`.
- **Optional LLM routing** for Ask Salesloft — copy `.env.example` to `.env`
  and set `VITE_ANTHROPIC_API_KEY`. Without it, the chatbot falls back to a
  keyword router + FAQ and still routes data questions to Spotter.

## Recreate this against your own ThoughtSpot

This app is wired to a specific cluster and specific object GUIDs, so a fresh
clone won't render until you repoint it. Do these five things:

**1. Point at your cluster.** In [`src/lib/thoughtspot.ts`](src/lib/thoughtspot.ts)
the SDK `init()` uses `THOUGHTSPOT_HOST` + `AuthType.Basic` (username/password
are entered on the login screen at runtime — nothing is committed). Change the
host in [`src/config.ts`](src/config.ts):

```ts
export const THOUGHTSPOT_HOST = 'https://<your-cluster>.thoughtspot.cloud';
```

**2. Swap the object GUIDs** (all in [`src/config.ts`](src/config.ts)) for your
own liveboard / worksheet (model) / viz:

| Constant | What it is |
| --- | --- |
| `ANALYTICS_LIVEBOARD_ID` | the liveboard shown on the **Analytics** tab |
| `WORKSHEET_ID` / `CADENCE_WORKSHEET_ID` | the worksheet/model Spotter + the Rep filter query |
| `SIGNALS_VIZ_ID` | the single viz embedded on the **Signals** tab (a viz from the Analytics liveboard) |
| `INLINE_INSIGHTS_LIVEBOARD_ID`, `SIGNALS_ANSWER_ID` | other embedded objects, if you use those views |
| `REENGAGE_ACTION_ID` | must match the custom action you create (or keep the code-based one) |

**3. Fix the runtime-filter column names.** The **Analytics** tab pushes
`HostEvent.UpdateRuntimeFilters` (see [`src/tabs/Analytics.tsx`](src/tabs/Analytics.tsx))
using column names that must **exactly match** your worksheet's columns
(case-sensitive). They're defined near the bottom of [`src/config.ts`](src/config.ts):

```ts
export const REP_COLUMN = 'Rep Name';        // drives the Rep dropdown filter
export const SEGMENT_COLUMN = '...';         // segment filter
export const CADENCE_NAME_COLUMN = '...';    // cadence filter
export const DATE_COLUMN = '...';            // date-range filter
```

If a name doesn't exist in your model, that filter silently no-ops — so rename
these to your model's columns.

**4. Rebrand the logo + favicon.**
- Host logo: replace [`src/assets/salesloft-logo.svg`](src/assets/salesloft-logo.svg)
  (inlined by [`src/components/SalesloftLogo.tsx`](src/components/SalesloftLogo.tsx);
  it inherits theme ink via `currentColor`).
- Favicon: replace [`public/salesloft-icon.svg`](public/salesloft-icon.svg) and the
  `<title>` in [`index.html`](index.html).

**5. Set fonts + theme.** Easiest is to take a **screenshot of the target
brand's site** and derive the palette + fonts from it, then set:
- **Host app** — the `--sl-*` design tokens at the top of
  [`src/styles/globals.css`](src/styles/globals.css) (colors), and the
  `@font-face` / font-family declarations there (fonts). Dark/light is driven by
  `data-theme` on `<html>`.
- **Embed iframe** — `TS_CSS_VARIABLES` / `TS_VARS_DARK` (the `--ts-var-*`
  variables) and `TS_FONT_URL` in [`src/config.ts`](src/config.ts), so the
  ThoughtSpot embeds match the host chrome.

**Also required outside the code:** add your deploy domain (and
`http://localhost:5173` for dev) to the cluster's **CSP visual-embed hosts /
CORS allowlist** (Develop → Security settings), or every embed iframe is
blocked. `AuthType.Basic` is fine for a demo but sends credentials from the
browser — switch to trusted auth / SSO for anything production.

## Build your own with Claude Code + SpotterCode

The fastest path is to open this repo in [Claude Code](https://claude.com/claude-code)
and let it do the repointing and rebranding for you. **SpotterCode** is an MCP
server that gives Claude the authoritative Visual Embed SDK reference (exact
enums, props, events, version support) so it writes correct embed code instead
of hallucinating APIs.

**1. Clone + install:**

```bash
git clone https://github.com/koushik426/tse_demos.git
cd tse_demos && npm install
```

**2. Wire up the SpotterCode MCP.** This repo ships a project [`.mcp.json`](.mcp.json)
pointing at the public SpotterCode server:

```json
{ "mcpServers": { "spottercode": { "type": "http", "url": "https://spottercode.thoughtspot.app/mcp" } } }
```

Open the project with `claude` in this folder — Claude Code will ask to approve
the project MCP server; approve it, then run `/mcp` to confirm `spottercode` is
connected. (Or add it yourself:
`claude mcp add --transport http spottercode https://spottercode.thoughtspot.app/mcp`.)

**3. Repoint it at your cluster — just ask.** Instead of hand-editing, prompt
Claude with your details, e.g.:

> Repoint `THOUGHTSPOT_HOST` to `https://my-co.thoughtspot.cloud`, set
> `ANALYTICS_LIVEBOARD_ID` to `<guid>` and `WORKSHEET_ID` to `<guid>`, and change
> the Analytics runtime-filter columns (`REP_COLUMN`, `SEGMENT_COLUMN`,
> `DATE_COLUMN`) to match my model's column names. Use SpotterCode to confirm the
> SDK props before editing.

**4. Rebrand from a screenshot.** Attach a screenshot of the target brand's
website and ask:

> Rebrand this app as `<Company>`: derive the palette and fonts from this
> screenshot, update the `--sl-*` tokens in `globals.css` and the `--ts-var-*`
> embed variables in `config.ts`, swap the logo (`src/assets/…svg`) and favicon,
> and rename the AI assistant to `<Company> AI`.

(That's exactly how the `acme-tse/` twin in this repo was produced.)

**5. Add or change embeds safely.** Whenever you add a `LiveboardEmbed`,
`SpotterEmbed`, custom action, or host event, tell Claude to **"use SpotterCode
to confirm the enums/props first"** — it will look up the real SDK definitions
(e.g. `CustomActionTarget`, `HostEvent.SpotterSearch`, `subscribedEvent`) for
your cluster version before writing code.

**6. Iterate + ship:** `npm run dev` to preview, then `npm run build` and deploy
(see below).

## Deploy

Configured for Vercel ([`vercel.json`](vercel.json)) — framework `vite`,
output `dist/`, SPA rewrite to `/index.html`. Pushing to `main` triggers a
deploy.

---

Built with Claude Code and the SpotterCode MCP tool.
