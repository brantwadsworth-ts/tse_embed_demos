---
name: rebrand-thoughtspot-portal
description: Guided builder that turns the reusable Vite + React + @thoughtspot/visual-embed-sdk portal template into a fully-skinned client app — brand, theme, data, tabs, custom actions, monetization and user tiers — from a plain-language interview. Use when someone wants to build / skin / white-label / clone a ThoughtSpot embedded analytics portal for a company (e.g. "build the portal for Acme", "skin the app for <client>", "make a ThoughtSpot demo app for X"). Walks a branching question tree (no coding required from the user), then clones the template and wires everything up, building and verifying at each step. Not for building a brand-new app architecture from scratch, or non-ThoughtSpot apps.
---

# Build a client ThoughtSpot portal (guided)

You are running a **non-technical intake**: the user answers plain-language
questions, you do all the code. Flow: **interview → build → verify → (ask before) deploy.**
Never make the user touch code or GUIDs beyond pasting the values you ask for.

## The base template

The base app lives in **`brantwadsworth-ts/tse_demos`** — a brand-neutral ("Northwind")
Vite + React SPA that already contains every feature toggleable: Analytics liveboard,
inline-insights list tab, custom-action viz tab, standalone Spotter tab, "fancy" Ask-AI
chat, monetization paywall, Premium/Basic tiers, host filters, light+dark theme. You keep
what the answers ask for and strip the rest.

Clone from: `https://github.com/brantwadsworth-ts/tse_demos`

The codemod (`scripts/apply-spec.mjs`) is bundled in the upstream repo at
`.claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs`. Run it from a local
clone of that repo. It detects a missing `node_modules` and runs `npm install` once.

The codemod copies the template to `<client>-tse/` (kebab-case) in the current project,
excluding `node_modules dist .vercel .env.local`.

## Prerequisite — Node.js (check once, before the first build)

The codemod and the generated Vite app need Node. Verify it early.

1. **Check:** run `node -v`. If it prints a version, skip to the interview.
2. **If Node is missing**, ask the user's OK, then install to `~/.node` (no sudo):
   ```bash
   VER=v22.13.1
   OS=$(uname -s | tr '[:upper:]' '[:lower:]')
   ARCH=$(uname -m); [ "$ARCH" = "aarch64" ] && ARCH=arm64; [ "$ARCH" = "x86_64" ] && ARCH=x64
   curl -fsSL "https://nodejs.org/dist/$VER/node-$VER-$OS-$ARCH.tar.gz" | tar -xz -C /tmp
   rm -rf ~/.node && mv "/tmp/node-$VER-$OS-$ARCH" ~/.node
   export PATH="$HOME/.node/bin:$PATH"
   ```
3. Confirm `node -v` works, then continue.

## Step 0 — Show the "gather-first" card (before any question)

Post this before asking anything, then wait:

> **Before we start, grab these — you'll paste them as we go (takes ~2 min):**
> 1. **Your ThoughtSpot host URL** (e.g. `https://your-co.thoughtspot.cloud`)
> 2. **The main dashboard's Liveboard ID** — open the liveboard; it's the long ID in
>    the URL after `/pinboard/` or `/liveboard/`.
> 3. **Your data model / worksheet ID** — the source the dashboard is built on.
> 4. **A brand screenshot** — your website, product UI, or logo. I'll pull the colors
>    from it. (A hex color works too if you have no image.)
> 5. *(optional)* Any extra Liveboard/viz IDs if you want more than one tab.
> 6. Your **logo** file (SVG or PNG), or say the word and I'll generate a wordmark.
>
> Building a demo with no real cluster? Just say so — I'll make up realistic values.

Wait for a "ready" (or their first pastes), then start the interview.

## Step 1 — Run the interview (LOCKED SCRIPT — ask verbatim)

Run the rounds below **in this exact order**, using the **exact wording** given.
Never reword, rephrase, merge, reorder, add, or drop questions.
The only permitted variation is skipping an entire round when its mode/gate says to.
Rounds marked **[ADVANCED ONLY]** are skipped entirely in Basic mode.

**Sequencing rule:** never fire `AskUserQuestion` in the *same turn* as a free-text
request. When a round has both, send the **free-text message first, wait for the reply,
then** fire the popup.

---

**ROUND 0 — Build scope** · `AskUserQuestion`
- question: `Should this be a Basic demo or the full Advanced build?`
- header: `Build scope` · multiSelect: false
- options:
  - `Advanced (full build)` — All tabs: Analytics, inline insights, a custom-action workflow, Add-Report pinning, Ask-AI + Spotter, tiers/monetization.
  - `Basic demo` — Analytics dashboards + Spotter + Ask-AI + theme only. Skips inline, custom-action, and Add-Report.

Record as `mode`. **If Basic → skip Rounds 3, 4, 6.**

---

**ROUND 1 — Brand** · free-text message (verbatim):
> Tell me about the brand — answer in one message:
> 1. Company name
> 2. AI assistant name (or I'll default to "Ask <Company> AI")
> 3. One line on what they do
> 4. Website URL
>
> Then attach your **logo** (SVG preferred, PNG fine) — or say "generate one" and I'll make a wordmark.

---

**ROUND 2 — Data & filters** · free-text FIRST (verbatim):
> Now the data — paste in one message (a full ThoughtSpot **link** is fine, I'll pull the ID out):
> 1. Your ThoughtSpot **host URL** (e.g. `https://your-co.thoughtspot.cloud`) — or paste any link from your cluster and I'll read the host from it.
> 2. Main **Analytics liveboard** — paste its URL or ID.
> 3. Data **model / worksheet** — paste its URL or ID.
> 4. Which columns do you want to filter the main dashboard (runtime filters)? List them.
> 5. A **date column** to filter by, if any (optional).
>
> No real cluster? Say "make it up" and I'll generate realistic values.

**Reading pasted URLs (do this yourself):**
- GUID pattern: `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
- `…/pinboard/<G>` or `…/liveboard/<G>` → **Liveboard**
- `…/embed/viz/<LB>/<VIZ>` → `<LB>` is the liveboard, `<VIZ>` is the viz
- `…/data/tables/<G>` or `…/worksheet/<G>` → **Worksheet**
- Always echo the type back to confirm.

Then `AskUserQuestion` — both questions in one popup:
- question: `How should the embedded ThoughtSpot content authenticate?`
- header: `Auth` · multiSelect: false · options: `Basic – typed credentials (Recommended)` | `None – ride existing session` | `Trusted – advanced`
- question: `How should the app's navigation look?`
- header: `Nav layout` · multiSelect: false · options: `Top bar` | `Left sidebar`

---

**ROUND 3 — Inline-insights tab** · **[ADVANCED ONLY]** · `AskUserQuestion` gate:
- question: `Add an inline-insights tab? (List where each row of the Client App expands to reveal a ThoughtSpot Liveboard filtered to the list item)`
- header: `Inline insights` · multiSelect: false · options: `Yes, add it` | `No, skip it`

If **Yes**, free-text:
> Inline-insights details — paste in one message:
> 1. The inline **Liveboard ID** (must be a liveboard, not a viz/answer)
> 2. **What do you want to name this tab?**
> 3. **Which attribute / dimension should label each row?**
> 4. **Up to 3 metric columns to show per row**

---

**ROUND 4 — Custom-action workflow** · **[ADVANCED ONLY]** · `AskUserQuestion` gate:
- question: `Add a custom-action workflow? (a button on a viz row that opens your own screen/modal)`
- header: `Custom action` · multiSelect: false · options: `Yes, add it` | `No, skip it`

If **Yes**, free-text:
> Custom-action details — paste in one message:
> 1. The **viz ID** the action lives on, and its parent **Liveboard ID**
> 2. The action's **button label**
> 3. The **tab name**
> 4. Describe the workflow: what screen opens on click, which row fields pre-fill which inputs, and what "Submit" does.

Build **exactly that screen** — never fall back to a generic form.

---

**ROUND 5 — Ask-AI & tiers** · `AskUserQuestion` (batch all four in one call):
- Q1 — question: `How should Ask-AI work?` · header: `Ask-AI` · options: `Both` | `Standalone Spotter only` | `Fancy chat only`
- Q2 — question: `Floating chatbot in the bottom-right corner?` · header: `Chatbot` · options: `Yes` | `No`
- Q3 — question: `Add a monetization paywall?` · header: `Monetize` · options: `No` | `Yes`
- Q4 — question: `Feature gating by tier (Premium vs Basic)?` · header: `Tiers` · options: `No` | `Yes`

If **Monetize = Yes**, free-text: `Which AI question should trigger the paywall? (e.g. the 3rd)`
If **Tiers = Yes**, `AskUserQuestion`:
- question: `Which actions should the Basic tier lose?`
- header: `Basic loses` · multiSelect: true · options: `Drill-down` | `Ask AI` | `Downloads`

---

**ROUND 6 — Add Report** · **[ADVANCED ONLY]** · `AskUserQuestion`:
- question: `Add Report (custom report building / addition flow)?`
- header: `Add Report` · multiSelect: false
- options:
  - `No, skip it`
  - `Yes — Ask-AI (Spotter) only`
  - `Yes — with both Ask AI & Report Builder (Search Data)`
- Note: SearchEmbed renders poorly in dark theme — if dark, recommend Spotter only.

---

**ROUND 7 — Theme** · free-text message (verbatim):
> Last step — paste one of these and I'll derive the full theme:
> 1. **Brand screenshot or website URL** (I'll pull colors from it), OR
> 2. **Primary hex color** (e.g. `#0C6E6C`), OR
> 3. A description ("deep navy and gold", "earthy green", etc.)
>
> Also tell me:
> - **Light or dark default?**
> - **Font preference?** (name/URL, or "match the website" — omit to use Inter)

From the brand input, derive:
- A **complete light-mode** token dict (`--sl-*` CSS variables matching the template)
- A **complete dark-mode** token dict
- `embedSwaps`, `greenSwaps`, `cssSwaps` arrays (fixed LHS, brand RHS — see spec-schema.md)
- `font` object (`{ family, googleUrl }` or `{ family, file, srcPath }`)

Reference: `references/spec-schema.md` for token names, swap LHS constants, and derivation rules.

---

## Step 2 — Build

Once all rounds are complete:

1. Summarize the spec in a concise table and ask "Does this look right? Any changes before I build?"
2. After confirmation, write `spec.json` (use `references/spec.example.json` as the template — edit every value, never hand-write from scratch).
3. Clone `brantwadsworth-ts/tse_demos` if not already present:
   ```bash
   git clone https://github.com/brantwadsworth-ts/tse_demos tse_demos_template
   ```
4. Run the codemod:
   ```bash
   node tse_demos_template/.claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs spec.json
   ```
5. Fix any TypeScript errors: `npm run build` from `<slug>-tse/`
6. If a custom-action workflow was described, rebuild the modal: rename `BidModal.tsx` → `<ActionName>Modal.tsx`, rebuild the form to match the described workflow exactly.
7. Run dev server: `npm run dev` from `<slug>-tse/`
8. Take a screenshot and show the user.

---

## Step 3 — Verify checklist

Print this list after a successful build:

- [ ] ThoughtSpot CORS allowlist includes `localhost:5173` (dev) and your deploy domain
- [ ] Column names in spec.json match actual worksheet columns (check inline filter labels)
- [ ] Auth method works (Basic: test login; None: pre-sign-in to TS; Trusted: backend deployed)
- [ ] Spotter / Ask-AI loads without "unauthorized" errors
- [ ] Custom action appears in the context menu on the correct viz
- [ ] Inline insights expand correctly (check runtime filter column name)
- [ ] Dark/light theme toggle works
- [ ] Favicon shows correctly in browser tab

---

## Step 4 — Deploy (ask first)

**Ask before deploying.** Suggested deploy command:
```bash
cd <slug>-tse && vercel deploy --prod
```
Then:
```bash
vercel alias set <deploy-url> <slug>.ts-embed.vercel.app
```

After deploy, register the demo in the TSE Demo Builder at `/demos/new`.
