# spec.json — schema + interview mapping

The interview produces a **`spec.json`**; the codemod `scripts/apply-spec.mjs` turns it
into a working `<slug>-tse/` app in well under a second. **Copy
`references/spec.example.json`** (a complete, working InTime example) and edit every
value per the interview — do not hand-write from scratch.

Run from the project root (the codemod finds its bundled `template-tse/` relative to
itself, and resolves your `spec.json` asset paths against the current directory):

```bash
node .claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs spec.json
```

## Top-level fields

| Field | From interview | Notes |
|---|---|---|
| `client` | Brand name, Title-case | e.g. `"InTime"`. Renames the `Northwind` token in all casings. |
| `slug` | derived, kebab/lower | output dir `<slug>-tse/`; also namespaces storage keys. |
| `host` | Data section | bare host, e.g. `team2.thoughtspot.cloud` (script adds `https://`). |
| `auth` | Data section | `none` \| `basic` \| `trusted`. `basic` wires `AuthType.Basic` + login creds. |
| `ids` | Data section | `analyticsLiveboard`, `model`, `inlineLiveboard`, `actionLiveboard`, `actionViz`. **Confirm each by TYPE** (liveboard vs viz) — a viz GUID in a liveboard slot = blank embed. |
| `action` | Custom-action section | `{ id, name }` — the context-menu action label. |
| `columns` | Data / inline / filters | `inlineName[]` (candidate list), `inlineMetrics[]` (`{label,format,candidates[]}`, ≤3), `filterPrimary[]`, `filterSecondary[]`, `date`, `hierarchy{segment,rep,cadence}`. Candidate lists = first that returns data wins. |
| `font` | Theme | `{ family, googleUrl }` for Google fonts or `{ family, file, srcPath }` for self-hosted. Embeds always get the nearest Google font fallback (Larsseit→DM Sans, Gilroy→Poppins, Futura→Jost). Never self-host into embeds — it fails in the sandboxed iframe. |
| `logo` | Brand | `{ svgPath }` (repo-relative). Script rewrites `fill:#hex`→`currentColor` so it flips with theme. |
| `favicon` | Brand | inline SVG string → `public/<slug>-icon.svg`. |
| `theme` | Theme | see below. |
| `features` | multiple | see below — controls **tab pruning**. |
| `content` | all copy | the entire `content.ts` object (every human string). |
| `embedSwaps` / `greenSwaps` / `cssSwaps` | Theme | hex remaps — **fixed left side, brand right side** (see below). |

## `theme`

- `default`: `"light"` | `"dark"`.
- `light` / `dark`: the **full** `:root` token dictionaries (replace the whole block, so include every token — colors, fonts, `--topbar-h`, shadows).
- Must include `--brand-navy` and `--brand-accent` (same in light and dark — drive the chatbot header).
- Derive the palette from the brand screenshot/URL.

## `features` (tab pruning)

- `askMode`: `"both"` (Ask + Spotter) · `"fancy"` (removes Spotter tab) · `"normal"` (removes Ask tab).
- `inline`: `false` removes the inline tab + file.
- `action`: `false` removes the action tab + BidModal.
- `monetize` / `tiers` / `pinning`: the codemod writes `src/flags.ts` automatically. `false` hides the paywall, tier switcher, and Add-Report panel.
- `home`: `true` | `false` — include/exclude the Home landing tab.
- `navLayout`: `"top"` | `"sidebar"`.

## The swap arrays — fixed LHS, brand RHS

Each is `[from, to]`. The **left-hand values are constants** (the template's neutral
palette); change only the **right-hand** values to the brand equivalents.

- **`embedSwaps`** (config.ts `--ts-var-*` primary colors) LHS constants:
  - `#4F5BD5` (primary), `#3F49B8` (hover), `#333C99` (active), `#22B8CF` (gradient end)
  - `#0b0d10` `#14181f` `#1a212b` `#232a34` (dark embed bg family)
  - `#0b1f19` (dark input), `rgba(45,164,191,0.14)` (ring)

- **`greenSwaps`** (thoughtspot.ts liveboard accents) LHS constants:
  - `#0f9a63` `#0c8554` `#d9ecea` `#cfe3e2` `#1bb978` `#15ae6e`

- **`cssSwaps`** (globals.css dark-override rules) LHS constants:
  - `#0e1116` `#10222a` `#123047`

The chatbot palette is **token-driven** (`--brand-navy`/`--brand-accent`), so it needs
**no** swaps — just set those two theme tokens.

## After the codemod — hand-steps

1. **Custom-action modal** (if a workflow was described): rebuild `BidModal.tsx` to match
   the described screen exactly. Rename it (e.g. `LeaveRequestModal.tsx`). **Never ship
   the generic Request Bid form** for a described workflow.
2. Any bespoke UI the user flagged (custom tables, live lookups).

Then: `npm run build` (fix TS errors), `npm run dev`, print the spec recap + verify checklist.
