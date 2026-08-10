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

## Deploy

Configured for Vercel ([`vercel.json`](vercel.json)) — framework `vite`,
output `dist/`, SPA rewrite to `/index.html`. Pushing to `main` triggers a
deploy.

---

Built with Claude Code and the SpotterCode MCP tool.
