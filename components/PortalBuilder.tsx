"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  WizardState,
  INITIAL_STATE,
  buildSpec,
  parseGuid,
  parseHost,
} from "@/lib/spec-builder";
import DatasetStep, { DatasetResult } from "@/components/DatasetStep";

// ── Types ─────────────────────────────────────────────────────────────────────

type StepKey =
  | "scope"
  | "brand"
  | "data"
  | "dataset"
  | "auth"
  | "inline"
  | "custom"
  | "ai-tiers"
  | "add-report"
  | "theme"
  | "review";

const STEP_LABELS: Record<StepKey, string> = {
  scope: "Build scope",
  brand: "Brand",
  data: "Data & IDs",
  dataset: "Upload dataset",
  auth: "Auth & nav",
  inline: "Inline insights",
  custom: "Custom action",
  "ai-tiers": "AI & tiers",
  "add-report": "Add Report",
  theme: "Theme",
  review: "Review & launch",
};

const ADVANCED_ONLY: StepKey[] = ["inline", "custom", "add-report"];
const ALL_STEPS: StepKey[] = [
  "scope", "brand", "data", "dataset", "auth", "inline", "custom",
  "ai-tiers", "add-report", "theme", "review",
];

// ── Shared primitives ─────────────────────────────────────────────────────────

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function GuidField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = value ? parseGuid(value) : "";
  const isUrl = value.includes("/");
  return (
    <Field label={label} hint={hint}>
      <input
        className={inp}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a URL or GUID"
      />
      {isUrl && parsed && (
        <p className="mt-1 text-xs text-emerald-600">Extracted: {parsed}</p>
      )}
    </Field>
  );
}

function RadioCard({
  selected,
  onClick,
  title,
  desc,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col rounded-xl border-2 p-5 text-left transition-all ${
        selected
          ? "border-[#2770ef] bg-[#2770ef]/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="mb-2 text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="mt-1 text-xs text-gray-500 leading-relaxed">{desc}</span>
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-[#2770ef]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

// ── Step forms ────────────────────────────────────────────────────────────────

function StepScope({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Choose the depth of the portal you want to build.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RadioCard
          selected={s.mode === "advanced"}
          onClick={() => set({ mode: "advanced" })}
          icon="🚀"
          title="Advanced (full build)"
          desc="All tabs: Analytics, inline insights, custom-action workflow, Add-Report, Ask-AI + Spotter, tiers, monetization."
        />
        <RadioCard
          selected={s.mode === "basic"}
          onClick={() => set({ mode: "basic" })}
          icon="⚡"
          title="Basic demo"
          desc="Analytics dashboards + Spotter + Ask-AI + theme. Skips inline insights, custom-action, and Add-Report."
        />
      </div>
    </div>
  );
}

function StepBrand({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Company name" required>
        <input
          className={inp}
          value={s.companyName}
          onChange={(e) => set({ companyName: e.target.value })}
          placeholder="Acme Corp"
        />
      </Field>
      <Field label="AI assistant name" hint={`Leave blank to use "Ask ${s.companyName || "Company"} AI"`}>
        <input
          className={inp}
          value={s.aiName}
          onChange={(e) => set({ aiName: e.target.value })}
          placeholder={`Ask ${s.companyName || "Company"} AI`}
        />
      </Field>
      <Field label="One-line tagline" hint="Shown on the login screen and landing page">
        <input
          className={inp}
          value={s.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
          placeholder="Revenue intelligence for modern sales teams"
        />
      </Field>
      <Field label="Website URL">
        <input
          className={inp}
          value={s.website}
          onChange={(e) => set({ website: e.target.value })}
          placeholder="https://www.acmecorp.com"
        />
      </Field>
      <Field
        label="Logo filename"
        hint="The codemod expects this file in the portal's public/ folder. You'll add it after the build."
      >
        <input
          className={inp}
          value={s.logoFile}
          onChange={(e) => set({ logoFile: e.target.value })}
          placeholder="acme-logo.svg"
        />
      </Field>
    </div>
  );
}

function StepData({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="ThoughtSpot host URL" required hint="Paste any link from your cluster — I'll extract the host">
        <input
          className={inp}
          value={s.tsHost}
          onChange={(e) => set({ tsHost: e.target.value })}
          placeholder="https://your-co.thoughtspot.cloud"
        />
        {s.tsHost && (
          <p className="mt-1 text-xs text-emerald-600">
            Host: {parseHost(s.tsHost) || s.tsHost}
          </p>
        )}
      </Field>
      <GuidField
        label="Main Analytics Liveboard"
        hint="Paste the full URL or just the GUID"
        value={s.analyticsLiveboardInput}
        onChange={(v) => set({ analyticsLiveboardInput: v })}
      />
      <GuidField
        label="Worksheet / Data model"
        hint="The source the liveboard is built on"
        value={s.worksheetInput}
        onChange={(v) => set({ worksheetInput: v })}
      />
      <Field
        label="Runtime filter columns"
        hint="Columns to use as dropdown filters (one per line or comma-separated, optional)"
      >
        <textarea
          className={`${inp} h-20 resize-none`}
          value={s.filterColumns}
          onChange={(e) => set({ filterColumns: e.target.value })}
          placeholder={"Region\nCategory\nRep Name"}
        />
      </Field>
      <Field label="Date column" hint="Optional — used for a date range picker">
        <input
          className={inp}
          value={s.dateColumn}
          onChange={(e) => set({ dateColumn: e.target.value })}
          placeholder="Order Date"
        />
      </Field>
    </div>
  );
}

function StepAuth({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Authentication</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              { v: "basic", icon: "🔑", t: "Basic (Recommended)", d: "User enters TS username + password at login." },
              { v: "none", icon: "🔓", t: "None", d: "Ride an existing ThoughtSpot session." },
              { v: "trusted", icon: "🛡️", t: "Trusted auth", d: "Backend issues cookieless tokens. Requires extra setup." },
            ] as const
          ).map(({ v, icon, t, d }) => (
            <RadioCard
              key={v}
              selected={s.auth === v}
              onClick={() => set({ auth: v })}
              icon={icon}
              title={t}
              desc={d}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Navigation layout</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { v: "top", icon: "➖", t: "Top bar", d: "Horizontal tabs across the top of the portal." },
              { v: "left", icon: "⬅️", t: "Left sidebar", d: "Vertical navigation on the left side." },
            ] as const
          ).map(({ v, icon, t, d }) => (
            <RadioCard
              key={v}
              selected={s.navLayout === v}
              onClick={() => set({ navLayout: v })}
              icon={icon}
              title={t}
              desc={d}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepInline({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <Toggle
        label="Include inline-insights tab"
        checked={s.inlineEnabled}
        onChange={(v) => set({ inlineEnabled: v })}
      />
      <p className="text-xs text-gray-400">
        Each row in a list expands to reveal a ThoughtSpot Liveboard filtered to that item.
      </p>
      {s.inlineEnabled && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <GuidField
            label="Inline Liveboard ID"
            hint="Must be a liveboard (not a viz/answer)"
            value={s.inlineLiveboardInput}
            onChange={(v) => set({ inlineLiveboardInput: v })}
          />
          <Field label="Tab name">
            <input
              className={inp}
              value={s.inlineTabName}
              onChange={(e) => set({ inlineTabName: e.target.value })}
              placeholder="Insights"
            />
          </Field>
          <Field
            label="Dimension column"
            hint="The attribute that labels each row (e.g. 'Cadence Name', 'Product')"
          >
            <input
              className={inp}
              value={s.inlineDimensionColumn}
              onChange={(e) => set({ inlineDimensionColumn: e.target.value })}
              placeholder="Cadence Name"
            />
          </Field>
          <Field
            label="Metric columns"
            hint="Up to 3, shown alongside each row (comma-separated)"
          >
            <input
              className={inp}
              value={s.inlineMetrics}
              onChange={(e) => set({ inlineMetrics: e.target.value })}
              placeholder="Influenced Pipeline, Emails Replied, Reply Rate"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function StepCustom({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <Toggle
        label="Include a custom-action workflow"
        checked={s.actionEnabled}
        onChange={(v) => set({ actionEnabled: v })}
      />
      <p className="text-xs text-gray-400">
        A button on a viz row that opens your own modal/screen with pre-filled fields.
      </p>
      {s.actionEnabled && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <GuidField
            label="Viz ID (the viz the action lives on)"
            value={s.actionVizInput}
            onChange={(v) => set({ actionVizInput: v })}
          />
          <GuidField
            label="Liveboard ID (parent liveboard)"
            value={s.actionLiveboardInput}
            onChange={(v) => set({ actionLiveboardInput: v })}
          />
          <Field label="Button label" hint="Text shown in the right-click context menu">
            <input
              className={inp}
              value={s.actionButtonLabel}
              onChange={(e) => set({ actionButtonLabel: e.target.value })}
              placeholder="Re-engage cadence"
            />
          </Field>
          <Field label="Tab name">
            <input
              className={inp}
              value={s.actionTabName}
              onChange={(e) => set({ actionTabName: e.target.value })}
              placeholder="Actions"
            />
          </Field>
          <Field
            label="Workflow description"
            hint="Describe what the modal shows and what Submitting does — the codemod builds this screen"
          >
            <textarea
              className={`${inp} h-24 resize-none`}
              value={s.actionWorkflowDesc}
              onChange={(e) => set({ actionWorkflowDesc: e.target.value })}
              placeholder="Modal opens pre-filled with the selected cadence name. Submit logs a 're-engage' event and shows a confirmation."
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function StepAiTiers({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Ask-AI mode</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              { v: "both", icon: "🤖", t: "Both", d: "Full-page Spotter tab + fancy chat interface." },
              { v: "spotter", icon: "💬", t: "Spotter only", d: "Just the ThoughtSpot Spotter embed." },
              { v: "chat", icon: "✨", t: "Fancy chat only", d: "The custom Anthropic-backed chat UI." },
            ] as const
          ).map(({ v, icon, t, d }) => (
            <RadioCard
              key={v}
              selected={s.askMode === v}
              onClick={() => set({ askMode: v })}
              icon={icon}
              title={t}
              desc={d}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Toggle
          label="Floating chatbot (bottom-right corner)"
          checked={s.chatbot}
          onChange={(v) => set({ chatbot: v })}
        />
        <Toggle
          label="Monetization paywall"
          checked={s.monetize}
          onChange={(v) => set({ monetize: v })}
        />
        {s.monetize && (
          <Field
            label="Trigger after question #"
            hint="Which AI question shows the upgrade prompt"
          >
            <input
              type="number"
              min={1}
              max={10}
              className={`${inp} w-24`}
              value={s.monetizeTrigger}
              onChange={(e) => set({ monetizeTrigger: Number(e.target.value) })}
            />
          </Field>
        )}
        <Toggle
          label="Feature gating by tier (Premium vs Basic)"
          checked={s.tiers}
          onChange={(v) => set({ tiers: v })}
        />
        {s.tiers && (
          <div className="ml-4 space-y-2">
            <p className="text-xs font-medium text-gray-600">Basic tier loses:</p>
            {(["Drill-down", "Ask AI", "Downloads"] as const).map((feat) => (
              <label key={feat} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={s.basicLoses.includes(feat)}
                  onChange={(e) =>
                    set({
                      basicLoses: e.target.checked
                        ? [...s.basicLoses, feat]
                        : s.basicLoses.filter((f) => f !== feat),
                    })
                  }
                  className="rounded border-gray-300 text-[#2770ef]"
                />
                {feat}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepAddReport({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Let users build and pin custom reports. Note: SearchEmbed renders poorly in dark theme —
        if you&apos;re using dark default, choose Spotter only.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            { v: "none", icon: "⬜", t: "No, skip it", d: "No custom report building." },
            { v: "spotter", icon: "💬", t: "Ask-AI (Spotter) only", d: "Users pin via Spotter." },
            { v: "both", icon: "🔍", t: "Spotter + Search Data", d: "Full report builder with SearchEmbed." },
          ] as const
        ).map(({ v, icon, t, d }) => (
          <RadioCard
            key={v}
            selected={s.addReport === v}
            onClick={() => set({ addReport: v })}
            icon={icon}
            title={t}
            desc={d}
          />
        ))}
      </div>
    </div>
  );
}

function StepTheme({ s, set }: { s: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary color" required>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.primaryColor}
              onChange={(e) => set({ primaryColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 p-0.5"
            />
            <input
              className={`${inp} font-mono`}
              value={s.primaryColor}
              onChange={(e) => set({ primaryColor: e.target.value })}
              placeholder="#2563eb"
            />
          </div>
        </Field>
        <Field label="Accent / secondary color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.accentColor}
              onChange={(e) => set({ accentColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 p-0.5"
            />
            <input
              className={`${inp} font-mono`}
              value={s.accentColor}
              onChange={(e) => set({ accentColor: e.target.value })}
              placeholder="#f59e0b"
            />
          </div>
        </Field>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Default theme</p>
        <div className="flex gap-3">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set({ defaultTheme: t })}
              className={`flex-1 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                s.defaultTheme === t
                  ? "border-[#2770ef] bg-[#2770ef]/5 text-[#2770ef]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t === "light" ? "☀️ Light" : "🌙 Dark"}
            </button>
          ))}
        </div>
      </div>

      <Field label="Font family" hint="Google Fonts name (e.g. Inter, Plus Jakarta Sans, Manrope)">
        <input
          className={inp}
          value={s.fontFamily}
          onChange={(e) => set({ fontFamily: e.target.value })}
          placeholder="Inter"
        />
      </Field>
      <Field
        label="Google Fonts URL"
        hint="Leave blank to auto-generate from the font name above"
      >
        <input
          className={inp}
          value={s.fontGoogleUrl}
          onChange={(e) => set({ fontGoogleUrl: e.target.value })}
          placeholder={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(s.fontFamily || "Inter")}:wght@400;500;600;700&display=swap`}
        />
      </Field>
    </div>
  );
}

function StepReview({
  s,
  spec,
  launching,
  onLaunch,
}: {
  s: WizardState;
  spec: Record<string, unknown>;
  launching: boolean;
  onLaunch: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const specStr = JSON.stringify(spec, null, 2);

  const rows = [
    ["Company", s.companyName || "—"],
    ["AI assistant", s.aiName || `Ask ${s.companyName} AI`],
    ["TS host", parseHost(s.tsHost) || "—"],
    ["Analytics liveboard", parseGuid(s.analyticsLiveboardInput) || "—"],
    ["Worksheet", parseGuid(s.worksheetInput) || "—"],
    ["Auth", s.auth],
    ["Nav", s.navLayout],
    ["Mode", s.mode],
    ["Inline insights", s.mode === "advanced" && s.inlineEnabled ? "Yes" : "No"],
    ["Custom action", s.mode === "advanced" && s.actionEnabled ? s.actionButtonLabel || "Yes" : "No"],
    ["Ask-AI", s.askMode],
    ["Chatbot", s.chatbot ? "Yes" : "No"],
    ["Monetize", s.monetize ? `After Q${s.monetizeTrigger}` : "No"],
    ["Tiers", s.tiers ? "Yes" : "No"],
    ["Add Report", s.addReport === "none" ? "No" : s.addReport],
    ["Theme default", s.defaultTheme],
    ["Primary color", s.primaryColor],
    ["Font", s.fontFamily || "Inter"],
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-gray-100 last:border-0">
                <td className="w-44 bg-gray-50 px-4 py-2.5 font-medium text-gray-600">{k}</td>
                <td className="px-4 py-2.5 font-mono text-gray-900">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <span>{expanded ? "▾" : "▸"}</span>
          {expanded ? "Hide" : "Show"} generated spec.json
        </button>
        {expanded && (
          <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
            {specStr}
          </pre>
        )}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>What happens when you launch:</strong>
        <ol className="mt-2 ml-4 list-decimal space-y-1">
          <li>The demo is registered in the builder with status <em>building</em></li>
          <li>Your browser downloads <code className="font-mono">spec.json</code></li>
          <li>You&apos;ll see the 3 commands to run in your terminal</li>
          <li>After deploy, the skill calls <code className="font-mono">go-live</code> to flip status to <em>live</em></li>
        </ol>
      </div>

      <button
        type="button"
        onClick={onLaunch}
        disabled={launching || !s.companyName}
        className="w-full rounded-xl bg-[#2770ef] py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d5fd4] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {launching ? "Registering…" : "Register + Download spec.json"}
      </button>
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ s }: { s: WizardState }) {
  const name = s.companyName || "Your Company";
  const primary = s.primaryColor;
  const accent = s.accentColor;

  const swatches = [
    { label: "Primary", color: primary },
    { label: "Accent", color: accent },
    { label: "Light bg", color: "#f8fafc" },
    { label: "Dark bg", color: "#0d1117" },
  ];

  return (
    <aside className="sticky top-6 space-y-4">
      {/* Mini portal mock */}
      <div
        className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        style={{ background: "#f8fafc" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ background: primary }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {name[0]?.toUpperCase() || "A"}
          </div>
          <span className="text-sm font-semibold text-white">{name}</span>
        </div>
        <div className="flex gap-0.5 border-b border-gray-200 bg-white px-3 pt-2">
          {["Analytics", "Insights", "Ask AI"].map((tab) => (
            <div
              key={tab}
              className="px-3 pb-2 text-xs font-medium"
              style={
                tab === "Analytics"
                  ? { color: primary, borderBottom: `2px solid ${accent}` }
                  : { color: "#94a3b8" }
              }
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="space-y-2 p-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 rounded-lg"
              style={{ background: "#e2e8f0", opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      </div>

      {/* Color swatches */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Color palette
        </p>
        <div className="grid grid-cols-2 gap-2">
          {swatches.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="h-8 w-8 flex-shrink-0 rounded-lg border border-gray-200 shadow-sm"
                style={{ background: color }}
              />
              <div>
                <div className="text-xs font-medium text-gray-700">{label}</div>
                <div className="font-mono text-xs text-gray-400">{color}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font */}
      {s.fontFamily && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Font</p>
          <p className="text-sm font-medium text-gray-800">{s.fontFamily}</p>
        </div>
      )}
    </aside>
  );
}

// ── Launch modal ──────────────────────────────────────────────────────────────

function LaunchModal({
  demoId,
  slug,
  onClose,
}: {
  demoId: string;
  slug: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const commands = `# 1. Move the downloaded spec.json to your project root
mv ~/Downloads/spec.json .

# 2. Clone the portal template
git clone https://github.com/thoughtspot/tse_demos tse_portal_template

# 3. Run the codemod
node tse_portal_template/.claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs spec.json

# 4. Preview
cd ${slug}-tse && npm run dev`;

  const goLiveCmd = `# After vercel deploy, mark this demo live:
curl -X POST /api/demos/${demoId}/go-live \\
  -H "Content-Type: application/json" \\
  -d '{"liveUrl":"https://${slug}.ts-embed.vercel.app"}'`;

  function copy() {
    navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Demo registered</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                <span className="rounded bg-green-100 px-1.5 py-0.5 font-mono text-green-700">
                  building
                </span>{" "}
                · ID: <span className="font-mono">{demoId}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Build commands</p>
              <button
                onClick={copy}
                className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                {copied ? "Copied!" : "Copy all"}
              </button>
            </div>
            <pre className="overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100 leading-relaxed">
              {commands}
            </pre>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-800">After you deploy to Vercel:</p>
            <pre className="mt-2 overflow-auto text-xs text-amber-700 leading-relaxed">
              {goLiveCmd}
            </pre>
          </div>

          <div className="flex gap-3">
            <a
              href={`/demos`}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View demo library
            </a>
            <a
              href={`/demos/${demoId}/edit`}
              className="flex-1 rounded-xl bg-[#2770ef] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1d5fd4]"
            >
              Edit demo entry →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function PortalBuilder() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [stepIdx, setStepIdx] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState<{ demoId: string; slug: string } | null>(null);

  const set = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const steps = useMemo<StepKey[]>(() => {
    return state.mode === "basic"
      ? ALL_STEPS.filter((s) => !ADVANCED_ONLY.includes(s))
      : ALL_STEPS;
  }, [state.mode]);

  const currentStep = steps[stepIdx];
  const spec = useMemo(() => buildSpec(state), [state]);

  async function handleLaunch() {
    setLaunching(true);
    try {
      const slug =
        state.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "demo";

      const aiName = state.aiName || `Ask ${state.companyName} AI`;

      // Register demo in builder
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: state.companyName,
          useCase:
            state.tagline ||
            `${state.companyName} analytics portal built with the ThoughtSpot Embed SDK.`,
          tsInstance: state.tsHost.startsWith("http")
            ? state.tsHost
            : `https://${state.tsHost}`,
          rlsRequired: false,
          useSpotter: state.askMode !== "chat",
          spotterName: aiName,
          reportDesigner: state.addReport !== "none",
          status: "building",
          website: state.website,
          techStack: "Vite + React (tse_demos template)",
          sourceRepo: "https://github.com/thoughtspot/tse_demos",
        }),
      });

      if (!res.ok) throw new Error("Failed to register demo");
      const demo = (await res.json()) as { id: string };

      // Download spec.json
      const blob = new Blob([JSON.stringify(spec, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "spec.json";
      a.click();
      URL.revokeObjectURL(url);

      setLaunched({ demoId: demo.id, slug });
    } catch (err) {
      console.error(err);
      alert("Something went wrong registering the demo. Check the console.");
    } finally {
      setLaunching(false);
    }
  }

  function handleDatasetComplete(result: DatasetResult) {
    set({
      tsHost: result.tsHost || state.tsHost,
      analyticsLiveboardInput: result.liveboardId ?? state.analyticsLiveboardInput,
      worksheetInput: result.dataModelId || state.worksheetInput,
    });
    setStepIdx((i) => i + 1);
  }

  function renderStep() {
    switch (currentStep) {
      case "scope": return <StepScope s={state} set={set} />;
      case "brand": return <StepBrand s={state} set={set} />;
      case "data": return <StepData s={state} set={set} />;
      case "dataset": return (
        <DatasetStep
          onComplete={handleDatasetComplete}
          defaultTsHost={state.tsHost}
        />
      );
      case "auth": return <StepAuth s={state} set={set} />;
      case "inline": return <StepInline s={state} set={set} />;
      case "custom": return <StepCustom s={state} set={set} />;
      case "ai-tiers": return <StepAiTiers s={state} set={set} />;
      case "add-report": return <StepAddReport s={state} set={set} />;
      case "theme": return <StepTheme s={state} set={set} />;
      case "review":
        return (
          <StepReview
            s={state}
            spec={spec}
            launching={launching}
            onLaunch={handleLaunch}
          />
        );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Build a Portal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Answer a few questions — the codemod does the rest.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span>{STEP_LABELS[currentStep]}</span>
          <span>
            {stepIdx + 1} / {steps.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#2770ef] transition-all"
            style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => i < stepIdx && setStepIdx(i)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                i === stepIdx
                  ? "bg-[#2770ef] text-white"
                  : i < stepIdx
                    ? "cursor-pointer bg-[#2770ef]/10 text-[#2770ef] hover:bg-[#2770ef]/20"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {STEP_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Form card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            {STEP_LABELS[currentStep]}
          </h2>
          {renderStep()}

          {/* Navigation */}
          {currentStep !== "review" && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={stepIdx === 0}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
                className="rounded-lg bg-[#2770ef] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1d5fd4]"
              >
                {stepIdx === steps.length - 2 ? "Review →" : "Next →"}
              </button>
            </div>
          )}
          {currentStep === "review" && stepIdx > 0 && (
            <button
              type="button"
              onClick={() => setStepIdx((i) => i - 1)}
              className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Preview */}
        <PreviewPanel s={state} />
      </div>

      {/* Launch modal */}
      {launched && (
        <LaunchModal
          demoId={launched.demoId}
          slug={launched.slug}
          onClose={() => {
            setLaunched(null);
            router.push("/demos");
          }}
        />
      )}
    </div>
  );
}
