"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Demo,
  DemoLiveboard,
  DemoUser,
  EmbedOptions,
  RlsRuleRow,
  McpConnectorConfig,
} from "@/lib/demos";
import { instanceSlug } from "@/lib/tsSecrets";
import {
  ThemePreset,
  THEME_META,
  THEMES,
  CustomThemeVars,
  PortalThemeConfig,
} from "@/lib/portal-themes";
import tsInstances from "@/data/ts-instances.json";

// ─── MCP Connector catalog ─────────────────────────────────────────────────

const MCP_CATALOG = [
  {
    id: "snowflake",
    name: "Snowflake",
    emoji: "❄️",
    description: "Query Snowflake data directly from Claude AI",
    fields: [
      { key: "account", label: "Account", placeholder: "xy12345.us-east-1" },
      { key: "warehouse", label: "Warehouse", placeholder: "COMPUTE_WH" },
      { key: "database", label: "Database", placeholder: "PROD_DB" },
    ],
  },
  {
    id: "thoughtspot",
    name: "ThoughtSpot",
    emoji: "📊",
    description: "Let Claude query ThoughtSpot Search API natively",
    fields: [],
  },
  {
    id: "slack",
    name: "Slack",
    emoji: "💬",
    description: "Send insights and reports to Slack channels",
    fields: [
      { key: "channel", label: "Default Channel", placeholder: "#analytics" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    emoji: "🐙",
    description: "Connect repos and track issues in demos",
    fields: [
      { key: "repo", label: "Repository", placeholder: "owner/repo" },
    ],
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    emoji: "📋",
    description: "Export analysis results to Google Sheets",
    fields: [],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    emoji: "☁️",
    description: "Pull CRM data as context for analysis",
    fields: [
      { key: "instance_url", label: "Instance URL", placeholder: "https://org.my.salesforce.com" },
    ],
  },
] as const;

// ─── Shared input style ────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

// ─── Small reusable components ─────────────────────────────────────────────

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <div
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full transition-colors ${checked ? "bg-[#2770ef]" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 72 }}>
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">{title}</h2>
        </div>
        <div className="p-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────

type SectionKey = "basic" | "ts" | "access" | "security" | "data" | "connectors" | "embed" | "theme" | "danger";

const NAV_ITEMS: { key: SectionKey; emoji: string; label: string }[] = [
  { key: "basic",      emoji: "🏢",  label: "Basic Info" },
  { key: "ts",         emoji: "⚡",  label: "ThoughtSpot" },
  { key: "access",     emoji: "🔐",  label: "Access & Auth" },
  { key: "security",   emoji: "🛡️",  label: "Data & Security" },
  { key: "data",       emoji: "🗄️",  label: "Data Model" },
  { key: "connectors", emoji: "🔌",  label: "MCP Connectors" },
  { key: "embed",      emoji: "⚙️",  label: "Embed Options" },
  { key: "theme",      emoji: "🎨",  label: "Portal Theme" },
  { key: "danger",     emoji: "⚠️",  label: "Danger Zone" },
];

export default function EditDemoForm({ demo }: { demo: Demo }) {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [companyName, setCompanyName] = useState(demo.companyName);
  const [website, setWebsite] = useState(demo.website ?? "");
  const [useCase, setUseCase] = useState(demo.useCase);
  const [prompt, setPrompt] = useState(demo.prompt ?? "");
  const [status, setStatus] = useState<Demo["status"]>(demo.status);
  const [sampleQuestions, setSampleQuestions] = useState((demo.sampleQuestions ?? []).join("\n"));

  const [tsInstance, setTsInstance] = useState(demo.tsInstance);
  const [embedType, setEmbedType] = useState<string>(demo.embedType ?? "liveboard");
  const [useSpotter, setUseSpotter] = useState(demo.useSpotter);
  const [spotterName, setSpotterName] = useState(demo.spotterName ?? "");
  const [analystName, setAnalystName] = useState(demo.analystName ?? "");
  const [worksheetId, setWorksheetId] = useState(demo.worksheetId ?? "");
  const [reportDesigner, setReportDesigner] = useState(demo.reportDesigner);

  const [liveboards, setLiveboards] = useState<DemoLiveboard[]>(demo.theme?.liveboards ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerUsername, setPickerUsername] = useState(demo.demoUsers?.[0]?.tsUsername ?? "");
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState("");
  const [pickerResults, setPickerResults] = useState<DemoLiveboard[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());

  const [trustedAuthEnabled, setTrustedAuthEnabled] = useState(demo.trustedAuthEnabled ?? false);
  const [credentialsHint, setCredentialsHint] = useState(demo.credentialsHint ?? "");
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>(demo.demoUsers ?? []);

  const [rlsRequired, setRlsRequired] = useState(demo.rlsRequired);
  const [rlsRules, setRlsRules] = useState(demo.rlsRules ?? "");
  const [rlsRuleRows, setRlsRuleRows] = useState<RlsRuleRow[]>(demo.rlsRuleRows ?? []);

  const [warehouse, setWarehouse] = useState(demo.dataModel?.warehouse ?? "");
  const [cdw, setCdw] = useState(demo.dataModel?.cdw ?? "");
  const [database, setDatabase] = useState(demo.dataModel?.database ?? "");
  const [schema, setSchema] = useState(demo.dataModel?.schema ?? "");
  // columns stored as arrays per table
  const [tables, setTables] = useState<{ name: string; columns: string[] }[]>(
    (demo.dataModel?.tables ?? []).map((t) => ({ name: t.name, columns: t.columns })),
  );
  // Once a data model exists, prevent deletion — user must fork to rebuild
  const dataModelLocked = (demo.dataModel?.tables?.length ?? 0) > 0;

  const [mcpConnectors, setMcpConnectors] = useState<McpConnectorConfig[]>(demo.mcpConnectors ?? []);

  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(demo.screenshotUrls ?? []);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [hiddenActions, setHiddenActions] = useState<Set<string>>(new Set(demo.embedOptions?.hiddenActions ?? []));
  const [hideLiveboardHeader, setHideLiveboardHeader] = useState(demo.embedOptions?.hideLiveboardHeader ?? false);
  const [hideTabPanel, setHideTabPanel] = useState(demo.embedOptions?.hideTabPanel ?? false);
  const [showPrimaryNavbar, setShowPrimaryNavbar] = useState(demo.embedOptions?.showPrimaryNavbar ?? false);

  const [themePreset, setThemePreset] = useState<ThemePreset>(demo.themeConfig?.preset ?? "light");
  const defaultCustom = demo.themeConfig?.preset === "custom" ? (demo.themeConfig.custom ?? {}) : {};
  const [themeCustom, setThemeCustom] = useState<Partial<CustomThemeVars>>(defaultCustom);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "fading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Active nav section (scroll-tracked)
  const [activeSection, setActiveSection] = useState<SectionKey>("basic");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace("section-", "") as SectionKey);
          }
        }
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );
    NAV_ITEMS.forEach(({ key }) => {
      const el = document.getElementById(`section-${key}`);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────

  async function handleScreenshotUpload(file: File) {
    setScreenshotUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/demos/${demo.id}/screenshot`, { method: "POST", body: form });
    const data = await res.json() as { screenshotUrls?: string[]; error?: string };
    if (data.screenshotUrls) setScreenshotUrls(data.screenshotUrls);
    setScreenshotUploading(false);
  }

  async function handleScreenshotDelete(url: string) {
    const res = await fetch(`/api/demos/${demo.id}/screenshot`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json() as { screenshotUrls?: string[] };
    if (data.screenshotUrls) setScreenshotUrls(data.screenshotUrls);
  }

  function scrollTo(key: SectionKey) {
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getMcpConnector(id: string) {
    return mcpConnectors.find((c) => c.id === id);
  }

  function toggleMcpConnector(id: string, enabled: boolean) {
    setMcpConnectors((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, enabled } : c));
      return [...prev, { id, enabled, config: {} }];
    });
  }

  function setMcpConfig(id: string, key: string, value: string) {
    setMcpConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, config: { ...(c.config ?? {}), [key]: value } } : c)),
    );
  }

  function addRlsRow() {
    setRlsRuleRows((prev) => [...prev, { table: "", column: "", operator: "=", value: "" }]);
  }

  function updateRlsRow(i: number, field: keyof RlsRuleRow, value: string) {
    setRlsRuleRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function removeRlsRow(i: number) {
    setRlsRuleRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addTableColumn(tableIdx: number) {
    setTables((prev) => prev.map((t, i) => i === tableIdx ? { ...t, columns: [...t.columns, ""] } : t));
  }

  function updateTableColumn(tableIdx: number, colIdx: number, value: string) {
    setTables((prev) => prev.map((t, i) => i === tableIdx ? { ...t, columns: t.columns.map((c, ci) => ci === colIdx ? value : c) } : t));
  }

  function removeTableColumn(tableIdx: number, colIdx: number) {
    setTables((prev) => prev.map((t, i) => i === tableIdx ? { ...t, columns: t.columns.filter((_, ci) => ci !== colIdx) } : t));
  }

  function updateTableName(tableIdx: number, value: string) {
    setTables((prev) => prev.map((t, i) => i === tableIdx ? { ...t, name: value } : t));
  }

  function removeTable(tableIdx: number) {
    setTables((prev) => prev.filter((_, i) => i !== tableIdx));
  }

  function toggleAction(action: string) {
    setHiddenActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action); else next.add(action);
      return next;
    });
  }

  function updateCustomVar(key: keyof CustomThemeVars, value: string) {
    setThemeCustom((prev) => ({ ...prev, [key]: value }));
  }

  function buildThemeConfig(): PortalThemeConfig {
    return themePreset === "custom" ? { preset: "custom", custom: themeCustom } : { preset: themePreset };
  }

  function buildEmbedOptions(): EmbedOptions | undefined {
    const hidden = Array.from(hiddenActions);
    const hasOptions = hidden.length > 0 || hideLiveboardHeader || hideTabPanel || showPrimaryNavbar;
    if (!hasOptions) return undefined;
    return {
      hiddenActions: hidden.length > 0 ? hidden : undefined,
      hideLiveboardHeader: hideLiveboardHeader || undefined,
      hideTabPanel: hideTabPanel || undefined,
      showPrimaryNavbar: showPrimaryNavbar || undefined,
    };
  }

  function updateDemoUser(idx: number, field: keyof DemoUser, value: string) {
    setDemoUsers((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  }

  function updateLiveboard(idx: number, field: keyof DemoLiveboard, value: string) {
    setLiveboards((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  }

  async function fetchLiveboards() {
    if (!tsInstance || !pickerUsername.trim()) return;
    setPickerLoading(true); setPickerError(""); setPickerResults([]); setPickerSelected(new Set());
    const params = new URLSearchParams({ instance: tsInstance, username: pickerUsername.trim() });
    const res = await fetch(`/api/admin/ts-liveboards?${params}`);
    const data = await res.json().catch(() => ({})) as DemoLiveboard[] | { error: string };
    setPickerLoading(false);
    if (!res.ok || "error" in data) setPickerError((data as { error: string }).error ?? "Fetch failed");
    else setPickerResults(data as DemoLiveboard[]);
  }

  function addSelectedLiveboards() {
    const toAdd = pickerResults.filter((lb) => pickerSelected.has(lb.id));
    const existingIds = new Set(liveboards.map((lb) => lb.id));
    setLiveboards((prev) => [...prev, ...toAdd.filter((lb) => !existingIds.has(lb.id))]);
    setPickerSelected(new Set()); setPickerSearch(""); setPickerOpen(false);
  }

  async function handleAiAssist() {
    setAiLoading(true); setAiMessage(null);
    const res = await fetch("/api/ai/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, website, useCase, tsInstance }),
    });
    setAiLoading(false);
    const json = await res.json().catch(() => ({})) as {
      error?: string; prompt?: string; sampleQuestions?: string[];
      useSpotter?: boolean; spotterName?: string; reportDesigner?: boolean; rlsRequired?: boolean;
    };
    if (!res.ok || json.error) { setAiMessage({ type: "error", text: json.error ?? "AI Assist failed." }); return; }
    if (json.prompt) setPrompt(json.prompt);
    if (json.sampleQuestions) setSampleQuestions(json.sampleQuestions.join("\n"));
    if (typeof json.useSpotter === "boolean") setUseSpotter(json.useSpotter);
    if (json.spotterName) setSpotterName(json.spotterName);
    if (typeof json.reportDesigner === "boolean") setReportDesigner(json.reportDesigner);
    if (typeof json.rlsRequired === "boolean") setRlsRequired(json.rlsRequired);
    setAiMessage({ type: "success", text: "AI filled in the suggestions — review and save." });
  }

  async function handleSave() {
    setSaving(true); setSaveStatus("idle"); setErrorMsg("");
    const patch: Partial<Demo> = {
      companyName, website: website || undefined, useCase,
      prompt: prompt || undefined,
      sampleQuestions: sampleQuestions.split("\n").map((q) => q.trim()).filter(Boolean),
      status, tsInstance, embedType: embedType as Demo["embedType"],
      useSpotter, spotterName: spotterName || undefined, analystName: analystName || undefined, worksheetId: worksheetId || undefined,
      reportDesigner, rlsRequired, rlsRules: rlsRules || undefined, rlsRuleRows,
      dataModel: {
        warehouse: warehouse || undefined, cdw: cdw || undefined,
        database: database || undefined, schema: schema || undefined,
        tables: tables.filter((t) => t.name.trim()).map((t) => ({
          name: t.name.trim(),
          columns: t.columns.map((c) => c.trim()).filter(Boolean),
        })),
      },
      theme: { custom: demo.theme?.custom ?? null, primaryColor: demo.theme?.primaryColor ?? "", logoUrl: demo.theme?.logoUrl, liveboards },
      trustedAuthEnabled, credentialsHint: credentialsHint || undefined,
      demoUsers: demoUsers.filter((u) => u.label.trim() && u.tsUsername.trim()),
      embedOptions: buildEmbedOptions(), themeConfig: buildThemeConfig(),
      mcpConnectors: mcpConnectors.filter((c) => c.enabled),
    };
    const res = await fetch(`/api/demos/${demo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    if (res.ok) {
      setSaveStatus("saved"); router.refresh();
      setTimeout(() => setSaveStatus("fading"), 2000);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg((body as { error?: string }).error ?? "Save failed."); setSaveStatus("error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the "${companyName}" demo? This cannot be undone.`)) return;
    const res = await fetch(`/api/demos/${demo.id}`, { method: "DELETE" });
    if (res.ok) router.push("/demos");
    else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg((body as { error?: string }).error ?? "Delete failed."); setSaveStatus("error");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 57px)", fontFamily: "inherit" }}>

      {/* ── Left sidebar nav ── */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid #e5e7eb",
          background: "#fafafa",
          position: "sticky",
          top: 57,
          height: "calc(100vh - 57px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "20px 12px",
          gap: 2,
        }}
      >
        <div style={{ marginBottom: 8, paddingLeft: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}>
            Edit Demo
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {companyName || "Untitled"}
          </p>
        </div>

        {NAV_ITEMS.map(({ key, emoji, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => scrollTo(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 10px",
              borderRadius: 9,
              background: activeSection === key ? (key === "danger" ? "#fef2f2" : "#eff6ff") : "transparent",
              color: activeSection === key ? (key === "danger" ? "#dc2626" : "#1d4ed8") : (key === "danger" ? "#ef4444" : "#374151"),
              fontWeight: activeSection === key ? 700 : 500,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "background 0.15s, color 0.15s",
              borderLeft: activeSection === key ? `3px solid ${key === "danger" ? "#dc2626" : "#2770ef"}` : "3px solid transparent",
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{emoji}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          </button>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          {(saveStatus === "saved" || saveStatus === "fading") && (
            <div style={{
              marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "#f0fdf4",
              color: "#15803d", fontSize: 12, fontWeight: 600, textAlign: "center",
              opacity: saveStatus === "fading" ? 0 : 1, transition: "opacity 0.5s",
            }}>
              Saved ✓
            </div>
          )}
          {saveStatus === "error" && (
            <div style={{ marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "#fef2f2", color: "#dc2626", fontSize: 11 }}>
              {errorMsg}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              borderRadius: 10,
              background: "#2770ef",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              transition: "background 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </aside>

      {/* ── Main content (single scroll) ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 48px", maxWidth: "calc(100vw - 220px)" }}>
        <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* ── Basic Info ──────────────────────────────────────────────────── */}
          <SectionCard id="section-basic" title="Basic Info">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Fill in Company Name and Use Case, then click AI Assist to auto-populate.</span>
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={aiLoading}
                className="rounded-xl border border-[#2770ef] px-4 py-2 text-sm font-semibold text-[#2770ef] hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{ flexShrink: 0 }}
              >
                {aiLoading ? "Thinking…" : "✨ AI Assist"}
              </button>
            </div>

            {aiMessage && (
              <div className={`rounded-xl px-4 py-3 text-sm ${aiMessage.type === "success" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
                {aiMessage.text}
                {aiMessage.type === "error" && aiMessage.text.includes("No API key") && (
                  <span className="ml-2 text-sm text-[#2770ef] cursor-pointer underline" onClick={() => scrollTo("danger")}>
                    Set up Claude Account ↑
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Company Name">
                <input className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>
              <Field label="Website">
                <input type="url" className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Status" hint="Controls visibility in the Demo Library.">
                <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Demo["status"])}>
                  <option value="draft">Draft — In development, not shared</option>
                  <option value="pending">Pending — Waiting for approval</option>
                  <option value="building">Building — Being configured</option>
                  <option value="live">Live — Active &amp; shared with customers</option>
                </select>
              </Field>
            </div>

            <Field label="Use Case">
              <textarea rows={3} className={inputClass} value={useCase} onChange={(e) => setUseCase(e.target.value)} />
            </Field>
            <Field label="AI Prompt" hint="System prompt for the embedded Spotter AI persona.">
              <textarea rows={3} className={inputClass} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="System prompt for AI persona…" />
            </Field>
            <Field label="Sample Questions" hint="One per line. Shown as conversation starters in the demo.">
              <textarea rows={4} className={inputClass} value={sampleQuestions} onChange={(e) => setSampleQuestions(e.target.value)} placeholder={"Which reps have the highest connect rates?\nShow pipeline by stage."} />
            </Field>

            {/* ── Screenshots (last in section) ───────────────────────────────── */}
            <Field label="App Screenshots" hint="Upload screenshots showing what the logged-in application looks like. First image is used as the hero card image. PNG, JPG, GIF — max 5 MB each.">
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleScreenshotUpload(file);
                  e.target.value = "";
                }}
              />

              {screenshotUrls.length > 0 && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  {screenshotUrls.map((url, i) => (
                    <div key={url} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", width: 200, height: 112, flexShrink: 0, background: "#f3f4f6" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`screenshot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                      {i === 0 && (
                        <span style={{ position: "absolute", top: 6, left: 6, background: "#2770ef", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 6px", letterSpacing: "0.05em" }}>PRIMARY</span>
                      )}
                      <span style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 9, borderRadius: 4, padding: "2px 6px" }}>{i + 1} of {screenshotUrls.length}</span>
                      <button
                        type="button"
                        title="Delete this screenshot"
                        onClick={() => handleScreenshotDelete(url)}
                        style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                        className="hover:bg-red-600"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => screenshotInputRef.current?.click()}
                disabled={screenshotUploading}
                style={{ width: "100%", borderRadius: 12, border: "2px dashed #d1d5db", background: "#f9fafb", cursor: "pointer", padding: screenshotUrls.length > 0 ? "14px 16px" : "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#9ca3af" }}
                className="hover:border-[#2770ef] hover:text-[#2770ef] transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleScreenshotUpload(file);
                }}
              >
                {screenshotUploading ? (
                  <span style={{ fontSize: 13 }}>Uploading…</span>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {screenshotUrls.length > 0 ? "Add another screenshot" : "Click to upload or drag & drop"}
                    </span>
                    {screenshotUrls.length === 0 && <span style={{ fontSize: 11 }}>PNG, JPG, GIF up to 5 MB</span>}
                  </>
                )}
              </button>
            </Field>
          </SectionCard>

          {/* ── ThoughtSpot ─────────────────────────────────────────────────── */}
          <SectionCard id="section-ts" title="ThoughtSpot">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Cluster">
                <select
                  className={inputClass}
                  value={tsInstances.some((i) => i.url === tsInstance) ? tsInstance : "__custom__"}
                  onChange={(e) => { if (e.target.value !== "__custom__") setTsInstance(e.target.value); }}
                >
                  {tsInstances.map((inst) => (<option key={inst.url} value={inst.url}>{inst.name}</option>))}
                  <option value="__custom__">Custom URL…</option>
                </select>
              </Field>
              <Field label="Embed Type">
                <select className={inputClass} value={embedType} onChange={(e) => setEmbedType(e.target.value)}>
                  <option value="liveboard">Liveboard</option>
                  <option value="fullApp">Full App</option>
                  <option value="search">Search</option>
                </select>
              </Field>
            </div>

            {!tsInstances.some((i) => i.url === tsInstance) && (
              <Field label="Custom Instance URL">
                <input className={inputClass} value={tsInstance} onChange={(e) => setTsInstance(e.target.value)} placeholder="https://your-instance.thoughtspot.cloud" />
              </Field>
            )}

            {/* Liveboards */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>Liveboards</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setPickerOpen(true); setPickerError(""); setPickerResults([]); setPickerSearch(""); }}
                    disabled={!tsInstance}
                    className="rounded-lg border border-[#2770ef] px-3 py-1 text-xs font-semibold text-[#2770ef] hover:bg-blue-50 disabled:opacity-40 transition-colors"
                  >
                    Browse ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveboards((prev) => [...prev, { id: "", name: "" }])}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    + Manual
                  </button>
                </div>
              </div>

              {/* Liveboard table */}
              {liveboards.length > 0 && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb", width: "40%" }}>Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>UUID</th>
                        <th style={{ padding: "8px 4px", borderBottom: "1px solid #e5e7eb", width: 32 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {liveboards.map((lb, i) => (
                        <tr key={i} style={{ borderBottom: i < liveboards.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                          <td style={{ padding: "6px 12px" }}>
                            <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12 }} placeholder="Display name" value={lb.name} onChange={(e) => updateLiveboard(i, "name", e.target.value)} />
                          </td>
                          <td style={{ padding: "6px 12px" }}>
                            <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12, fontFamily: "monospace" }} placeholder="xxxxxxxx-xxxx-…" value={lb.id} onChange={(e) => updateLiveboard(i, "id", e.target.value)} />
                          </td>
                          <td style={{ padding: "6px 4px" }}>
                            <button type="button" onClick={() => setLiveboards((prev) => prev.filter((_, idx) => idx !== i))} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px" }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {liveboards.length === 0 && !pickerOpen && (
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>No liveboards yet. Browse from ThoughtSpot or add manually.</p>
              )}

              {pickerOpen && (
                <div className="rounded-xl border border-[#2770ef]/30 bg-blue-50/30 p-4 space-y-3">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                      Browse liveboards on {new URL(tsInstance).hostname.split(".")[0]}
                    </span>
                    <button type="button" onClick={() => { setPickerOpen(false); setPickerResults([]); setPickerError(""); }} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className={`${inputClass} flex-1`}
                      placeholder="Your ThoughtSpot username"
                      value={pickerUsername}
                      onChange={(e) => setPickerUsername(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void fetchLiveboards(); } }}
                    />
                    <button
                      type="button"
                      onClick={() => void fetchLiveboards()}
                      disabled={pickerLoading || !pickerUsername.trim()}
                      className="rounded-lg bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {pickerLoading ? "Fetching…" : "Fetch ↓"}
                    </button>
                  </div>
                  {pickerError && <p style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", borderRadius: 6, padding: "6px 10px" }}>{pickerError}</p>}
                  {pickerResults.length > 0 && (
                    <>
                      <input className={inputClass} placeholder="Search liveboards…" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} autoFocus />
                      <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
                        {pickerResults.filter((lb) => lb.name.toLowerCase().includes(pickerSearch.toLowerCase())).map((lb) => (
                          <label key={lb.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }} className="hover:bg-blue-50">
                            <input
                              type="checkbox"
                              checked={pickerSelected.has(lb.id)}
                              onChange={(e) => {
                                setPickerSelected((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(lb.id); else next.delete(lb.id);
                                  return next;
                                });
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[#2770ef]"
                            />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lb.name}</p>
                              <p style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", margin: 0 }}>{lb.id}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{pickerSelected.size} selected · {pickerResults.length} total</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" onClick={() => setPickerSelected(new Set())} style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
                          <button
                            type="button"
                            disabled={pickerSelected.size === 0}
                            onClick={addSelectedLiveboards}
                            className="rounded-lg bg-[#2770ef] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-40 transition-colors"
                          >
                            Add {pickerSelected.size > 0 ? `(${pickerSelected.size})` : ""} →
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Worksheet / Model ID */}
            <Field label="Worksheet / Model ID" hint="GUID of the ThoughtSpot worksheet Spotter queries. Auto-resolved from the first liveboard if left blank.">
              <input className={inputClass} style={{ fontFamily: "monospace" }} value={worksheetId} onChange={(e) => setWorksheetId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (optional — auto-resolved)" />
            </Field>

            {/* Feature toggles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#f9fafb", borderRadius: 12, padding: 16 }}>
              <Toggle label="Use Spotter (AI Assistant)" checked={useSpotter} onChange={setUseSpotter} />
              <Toggle label="Report Designer (Search Builder)" checked={reportDesigner} onChange={setReportDesigner} />
            </div>

            {useSpotter && (
              <Field label="Spotter Name" hint="How the AI assistant is branded in this demo.">
                <input className={inputClass} value={spotterName} onChange={(e) => setSpotterName(e.target.value)} placeholder="e.g. Ask Clarity" />
              </Field>
            )}
            <Field label="Analyst Name" hint="Name of the assigned ThoughtSpot Analyst. Enables the 'Analysts' view in the Analysis Menu.">
              <input className={inputClass} value={analystName} onChange={(e) => setAnalystName(e.target.value)} placeholder="e.g. Alex Chen (leave blank to disable Analysts view)" />
            </Field>
          </SectionCard>

          {/* ── Access & Authentication ───────────────────────────────────────── */}
          <SectionCard id="section-access" title="Access & Authentication">
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
              <Toggle
                label="Enable Trusted Authentication"
                checked={trustedAuthEnabled}
                onChange={setTrustedAuthEnabled}
                hint="When enabled, visitors get auto-logged in — no login page."
              />
              {trustedAuthEnabled && (
                <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1d4ed8" }}>
                  Set env var{" "}
                  <code style={{ background: "#dbeafe", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 11 }}>
                    TS_AUTH_SECRET_{instanceSlug(tsInstance).toUpperCase().replace(/-/g, "_")}
                  </code>{" "}
                  in Vercel. Never paste secrets into this form.
                </div>
              )}
            </div>

            <Field label="Credentials Hint" hint='Shown on the login page when trusted auth is off, e.g. "demo / demo"'>
              <input className={inputClass} value={credentialsHint} onChange={(e) => setCredentialsHint(e.target.value)} placeholder="demo / demo" />
            </Field>

            {/* Demo Users table */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>
                  Demo Users <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— for role picker / RLS</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDemoUsers((prev) => [...prev, { label: "", tsUsername: "" }])}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  + Add User
                </button>
              </div>
              {demoUsers.length > 0 ? (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Display Label</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>TS Username</th>
                        <th style={{ padding: "8px 4px", borderBottom: "1px solid #e5e7eb", width: 32 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {demoUsers.map((user, i) => (
                        <tr key={i} style={{ borderBottom: i < demoUsers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                          <td style={{ padding: "6px 12px" }}>
                            <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12 }} placeholder="County A" value={user.label} onChange={(e) => updateDemoUser(i, "label", e.target.value)} />
                          </td>
                          <td style={{ padding: "6px 12px" }}>
                            <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12, fontFamily: "monospace" }} placeholder="ts_username" value={user.tsUsername} onChange={(e) => updateDemoUser(i, "tsUsername", e.target.value)} />
                          </td>
                          <td style={{ padding: "6px 4px" }}>
                            <button type="button" onClick={() => setDemoUsers((prev) => prev.filter((_, idx) => idx !== i))} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#9ca3af" }}>No demo users yet. Click + Add User to start.</p>
              )}
            </div>
          </SectionCard>

          {/* ── Data & Security ──────────────────────────────────────────────── */}
          <SectionCard id="section-security" title="Data & Security">
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
              <Toggle label="Row-Level Security (RLS) Required" checked={rlsRequired} onChange={setRlsRequired} />
            </div>

            {rlsRequired && (
              <>
                {/* RLS Rules table */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>RLS Rules</label>
                    <button
                      type="button"
                      onClick={addRlsRow}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      + Add Rule
                    </button>
                  </div>

                  {rlsRuleRows.length > 0 ? (
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            {["Table", "Column", "Operator", "Value / Variable"].map((h) => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                            ))}
                            <th style={{ borderBottom: "1px solid #e5e7eb", width: 32 }} />
                          </tr>
                        </thead>
                        <tbody>
                          {rlsRuleRows.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i < rlsRuleRows.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "6px 8px" }}>
                                <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12 }} placeholder="SALES_FACT" value={row.table} onChange={(e) => updateRlsRow(i, "table", e.target.value)} />
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12, fontFamily: "monospace" }} placeholder="REGION" value={row.column} onChange={(e) => updateRlsRow(i, "column", e.target.value)} />
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                <select className={inputClass} style={{ padding: "4px 8px", fontSize: 12 }} value={row.operator} onChange={(e) => updateRlsRow(i, "operator", e.target.value)}>
                                  <option value="=">=</option>
                                  <option value="!=">!=</option>
                                  <option value="IN">IN</option>
                                  <option value="NOT IN">NOT IN</option>
                                  <option value="CONTAINS">CONTAINS</option>
                                </select>
                              </td>
                              <td style={{ padding: "6px 8px" }}>
                                <input className={inputClass} style={{ padding: "4px 8px", fontSize: 12, fontFamily: "monospace" }} placeholder="{ts_username}" value={row.value} onChange={(e) => updateRlsRow(i, "value", e.target.value)} />
                              </td>
                              <td style={{ padding: "6px 4px" }}>
                                <button type="button" onClick={() => removeRlsRow(i)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>No rules yet. Click + Add Rule to define column-level filters.</p>
                  )}
                </div>

                {/* Free-text fallback */}
                <Field label="Additional Notes / Complex Rules" hint="Free-text description for complex RLS logic not captured above.">
                  <textarea rows={3} className={inputClass} value={rlsRules} onChange={(e) => setRlsRules(e.target.value)} placeholder="Describe any complex RLS conditions, variable mappings, or special cases…" />
                </Field>
              </>
            )}
          </SectionCard>

          {/* ── Data Model ──────────────────────────────────────────────────── */}
          <SectionCard id="section-data" title="Data Model">
            {/* Connection metadata */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Warehouse Platform">
                <input className={inputClass} value={warehouse} onChange={(e) => setWarehouse(e.target.value)} placeholder="e.g. Snowflake" />
              </Field>
              <Field label="Compute Warehouse / CDW">
                <input className={inputClass} value={cdw} onChange={(e) => setCdw(e.target.value)} placeholder="e.g. MY_WAREHOUSE" />
              </Field>
              <Field label="Database">
                <input className={inputClass} value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="e.g. SALES_DB" />
              </Field>
              <Field label="Schema">
                <input className={inputClass} value={schema} onChange={(e) => setSchema(e.target.value)} placeholder="e.g. PUBLIC" />
              </Field>
            </div>

            {/* Tables */}
            <div>
              {dataModelLocked && (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#92400e" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1, color: "#d97706" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div>
                    <strong style={{ display: "block", marginBottom: 2 }}>Data model is locked</strong>
                    Existing tables and columns cannot be deleted — removing them would break connected liveboards and searches.
                    You can still add new tables and columns. To rebuild from scratch, <strong>Fork this demo</strong>.
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280" }}>Tables</label>
                <button
                  type="button"
                  onClick={() => setTables((prev) => [...prev, { name: "", columns: [] }])}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  + Add Table
                </button>
              </div>

              {tables.length === 0 && (
                <p style={{ fontSize: 12, color: "#9ca3af" }}>No tables defined yet. Click + Add Table to document your schema.</p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {tables.map((table, tableIdx) => (
                  <div key={tableIdx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                    {/* Table header */}
                    <div style={{ background: "#f9fafb", padding: "10px 14px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
                      </svg>
                      <input
                        className={inputClass}
                        style={{ padding: "3px 8px", fontSize: 13, fontWeight: 700, fontFamily: "monospace", flex: 1, background: "transparent", border: "1px solid transparent" }}
                        placeholder="TABLE_NAME"
                        value={table.name}
                        onChange={(e) => updateTableName(tableIdx, e.target.value)}
                        onFocus={(e) => (e.target.style.border = "1px solid #d1d5db")}
                        onBlur={(e) => (e.target.style.border = "1px solid transparent")}
                      />
                      <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{table.columns.filter(Boolean).length} cols</span>
                      {!dataModelLocked && (
                        <button type="button" onClick={() => removeTable(tableIdx)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
                      )}
                    </div>

                    {/* Columns table */}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ padding: "6px 14px", textAlign: "left", fontWeight: 600, color: "#9ca3af", borderBottom: "1px solid #f3f4f6", width: 36, fontSize: 11 }}>#</th>
                          <th style={{ padding: "6px 14px", textAlign: "left", fontWeight: 600, color: "#9ca3af", borderBottom: "1px solid #f3f4f6", fontSize: 11 }}>Column Name</th>
                          <th style={{ padding: "6px 4px", borderBottom: "1px solid #f3f4f6", width: 32 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((col, colIdx) => (
                          <tr key={colIdx} style={{ borderBottom: "1px solid #f9fafb" }}>
                            <td style={{ padding: "4px 14px", color: "#d1d5db", fontFamily: "monospace", fontSize: 11 }}>{colIdx + 1}</td>
                            <td style={{ padding: "4px 8px" }}>
                              <input
                                className={inputClass}
                                style={{ padding: "3px 8px", fontSize: 12, fontFamily: "monospace" }}
                                placeholder="COLUMN_NAME"
                                value={col}
                                onChange={(e) => updateTableColumn(tableIdx, colIdx, e.target.value)}
                              />
                            </td>
                            <td style={{ padding: "4px 4px" }}>
                              {!dataModelLocked && (
                                <button type="button" onClick={() => removeTableColumn(tableIdx, colIdx)} style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", fontSize: 14 }} className="hover:text-red-400">×</button>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3} style={{ padding: "6px 14px" }}>
                            <button
                              type="button"
                              onClick={() => addTableColumn(tableIdx)}
                              style={{ fontSize: 11, color: "#2770ef", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                            >
                              + Add Column
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* ── MCP Connectors ──────────────────────────────────────────────── */}
          <SectionCard id="section-connectors" title="MCP Connectors">
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
              Select which MCP servers Claude can access in this demo. Enabled connectors are passed to the AI context.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {MCP_CATALOG.map((connector) => {
                const cfg = getMcpConnector(connector.id);
                const enabled = cfg?.enabled ?? false;

                return (
                  <div
                    key={connector.id}
                    style={{
                      border: `1px solid ${enabled ? "#bfdbfe" : "#e5e7eb"}`,
                      borderRadius: 12,
                      padding: 16,
                      background: enabled ? "#f0f7ff" : "#fafafa",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: enabled && connector.fields.length > 0 ? 12 : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{connector.emoji}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{connector.name}</p>
                          <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0", lineHeight: 1.4 }}>{connector.description}</p>
                        </div>
                      </div>
                      <div
                        onClick={() => toggleMcpConnector(connector.id, !enabled)}
                        style={{
                          width: 36, height: 20, borderRadius: 999, flexShrink: 0, marginTop: 2,
                          background: enabled ? "#2770ef" : "#d1d5db", cursor: "pointer",
                          position: "relative", transition: "background 0.2s",
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 2, left: enabled ? 18 : 2,
                          width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          transition: "left 0.2s",
                        }} />
                      </div>
                    </div>

                    {enabled && connector.fields.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {connector.fields.map((f) => (
                          <div key={f.key}>
                            <label style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", display: "block", marginBottom: 4 }}>{f.label}</label>
                            <input
                              className={inputClass}
                              style={{ fontSize: 12 }}
                              placeholder={f.placeholder}
                              value={cfg?.config?.[f.key] ?? ""}
                              onChange={(e) => setMcpConfig(connector.id, f.key, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Embed Options ─────────────────────────────────────────────────── */}
          <SectionCard id="section-embed" title="Embed Options">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                Hidden Actions
                <span style={{ fontSize: 12, fontWeight: 400, color: "#9ca3af", marginLeft: 8 }}>
                  — remove these buttons from the ThoughtSpot toolbar
                </span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 24px" }}>
                {([
                  { id: "share",            label: "Share" },
                  { id: "edit",             label: "Edit" },
                  { id: "pin",              label: "Pin" },
                  { id: "addToFavorites",   label: "Add to Favorites" },
                  { id: "download",         label: "Download (all)" },
                  { id: "downloadAsCSV",    label: "Download CSV" },
                  { id: "downloadAsPDF",    label: "Download PDF" },
                  { id: "downloadAsXLSX",   label: "Download XLSX" },
                  { id: "spotIQAnalyze",    label: "SpotIQ Analyze" },
                  { id: "explore",          label: "Explore" },
                  { id: "schedule",         label: "Schedule" },
                  { id: "reportError",      label: "Report Error" },
                  { id: "requestAccess",    label: "Request Access" },
                  { id: "shareWithSlack",   label: "Share via Slack" },
                  { id: "presentationMode", label: "Presentation Mode" },
                ] as const).map(({ id, label }) => (
                  <label key={id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#374151" }}>
                    <input
                      type="checkbox"
                      checked={hiddenActions.has(id)}
                      onChange={() => toggleAction(id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#2770ef]"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {hiddenActions.size > 0 && (
                <button type="button" onClick={() => setHiddenActions(new Set())} style={{ marginTop: 10, fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", margin: 0 }}>Display</p>
              <Toggle label="Hide liveboard header" checked={hideLiveboardHeader} onChange={setHideLiveboardHeader} />
              <Toggle label="Hide tab panel" checked={hideTabPanel} onChange={setHideTabPanel} />
              <Toggle label="Show ThoughtSpot primary navbar (full-app mode)" checked={showPrimaryNavbar} onChange={setShowPrimaryNavbar} />
            </div>

            {(hiddenActions.size > 0 || hideLiveboardHeader || hideTabPanel || showPrimaryNavbar) && (
              <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "#1d4ed8" }}>
                {hiddenActions.size > 0 && <p style={{ margin: "0 0 4px" }}><strong>Hidden:</strong> {Array.from(hiddenActions).join(", ")}</p>}
                {hideLiveboardHeader && <p style={{ margin: "0 0 4px" }}>Liveboard header hidden</p>}
                {hideTabPanel && <p style={{ margin: "0 0 4px" }}>Tab panel hidden</p>}
                {showPrimaryNavbar && <p style={{ margin: 0 }}>Primary navbar visible</p>}
              </div>
            )}
          </SectionCard>

          {/* ── Portal Theme ─────────────────────────────────────────────────── */}
          <SectionCard id="section-theme" title="Portal Theme">
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Choose how your public demo portal looks. Applies to the login page, header, and surrounding chrome — also passed to ThoughtSpot embed for matching.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {(Object.keys(THEME_META) as ThemePreset[]).map((preset) => {
                const meta = THEME_META[preset];
                const isSelected = themePreset === preset;
                const baseVars = preset !== "custom" ? THEMES[preset] : null;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setThemePreset(preset)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${isSelected ? "border-[#2770ef] bg-blue-50 shadow-md" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}`}
                  >
                    {baseVars ? (
                      <div style={{ display: "flex", gap: 4, borderRadius: 8, overflow: "hidden", height: 28, marginBottom: 12 }}>
                        <div style={{ flex: 1, background: baseVars.bg.startsWith("linear") ? "#1a1a2e" : baseVars.bg }} />
                        <div style={{ flex: 1, background: baseVars.surface }} />
                        <div style={{ flex: 1, background: baseVars.accent }} />
                        <div style={{ flex: 1, background: baseVars.headerBg }} />
                      </div>
                    ) : (
                      <div style={{ height: 28, borderRadius: 8, background: "linear-gradient(to right, #f472b6, #a78bfa, #60a5fa)", marginBottom: 12 }} />
                    )}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#1d4ed8" : "#111827", margin: 0 }}>{meta.label}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", lineHeight: 1.3 }}>{meta.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {themePreset === "custom" && (
              <div style={{ border: "1px dashed #c4b5fd", borderRadius: 14, background: "#faf5ff", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7c3aed", marginBottom: 16 }}>Custom Theme — CSS Variables</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {([
                    { key: "bg",         label: "Background" },
                    { key: "surface",    label: "Card Surface" },
                    { key: "accent",     label: "Accent Color" },
                    { key: "accentFg",   label: "Accent Text" },
                    { key: "headerBg",   label: "Header BG" },
                    { key: "headerText", label: "Header Text" },
                    { key: "text",       label: "Body Text" },
                    { key: "textMuted",  label: "Muted Text" },
                    { key: "border",     label: "Border Color" },
                    { key: "inputBg",    label: "Input BG" },
                  ] as { key: keyof CustomThemeVars; label: string }[]).map(({ key, label }) => {
                    const current = themeCustom[key] ?? THEMES.light[key];
                    return (
                      <div key={key}>
                        <label style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", display: "block", marginBottom: 6 }}>{label}</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input type="color" value={current.startsWith("#") ? current : "#2770ef"} onChange={(e) => updateCustomVar(key, e.target.value)} style={{ width: 34, height: 34, border: "1px solid #e5e7eb", borderRadius: 6, padding: 2, cursor: "pointer" }} />
                          <input type="text" className={inputClass} style={{ fontFamily: "monospace", fontSize: 11 }} value={current} onChange={(e) => updateCustomVar(key, e.target.value)} placeholder={THEMES.light[key]} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Theme preview */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600,
                background: themePreset === "custom" ? (themeCustom.headerBg ?? THEMES.light.headerBg) : (THEMES[themePreset]?.headerBg ?? THEMES.light.headerBg),
                color: themePreset === "custom" ? (themeCustom.headerText ?? THEMES.light.headerText) : (THEMES[themePreset]?.headerText ?? THEMES.light.headerText),
              }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: themePreset === "custom" ? (themeCustom.accent ?? THEMES.light.accent) : (THEMES[themePreset]?.accent ?? THEMES.light.accent) }} />
                {THEME_META[themePreset].emoji} {THEME_META[themePreset].label} — Portal Header Preview
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", padding: "28px", fontSize: 12,
                background: (() => {
                  const bg = themePreset === "custom" ? (themeCustom.bg ?? THEMES.light.bg) : (THEMES[themePreset]?.bg ?? THEMES.light.bg);
                  return bg.startsWith("linear") ? "#1a1a2e" : bg;
                })(),
                color: themePreset === "custom" ? (themeCustom.textMuted ?? THEMES.light.textMuted) : (THEMES[themePreset]?.textMuted ?? THEMES.light.textMuted),
              }}>
                ▤ Liveboard embed area
              </div>
            </div>
          </SectionCard>

          {/* ── Danger Zone ──────────────────────────────────────────────────── */}
          <div id="section-danger" style={{ scrollMarginTop: 72 }}>
            <div style={{ border: "1px solid #fecaca", borderRadius: 16, background: "#fff", overflow: "hidden" }}>
              <div style={{ padding: "14px 24px", borderBottom: "1px solid #fecaca", background: "#fff5f5" }}>
                <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f87171", margin: 0 }}>Danger Zone</h2>
              </div>
              <div style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Delete this demo</p>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Permanently removes this demo. This action cannot be undone.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{ borderRadius: 10, border: "1px solid #fecaca", background: "#fff5f5", padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "#dc2626", cursor: "pointer", flexShrink: 0 }}
                >
                  Delete Demo
                </button>
              </div>
            </div>
          </div>

          {/* Bottom padding */}
          <div style={{ height: 64 }} />
        </div>
      </main>
    </div>
  );
}
