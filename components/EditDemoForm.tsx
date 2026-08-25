"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Demo, DemoLiveboard, DemoUser } from "@/lib/demos";
import { instanceSlug } from "@/lib/tsSecrets";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

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
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#2770ef]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

type TableRow = { name: string; columns: string };

export default function EditDemoForm({ demo }: { demo: Demo }) {
  const router = useRouter();

  // Basic Info
  const [companyName, setCompanyName] = useState(demo.companyName);
  const [website, setWebsite] = useState(demo.website ?? "");
  const [useCase, setUseCase] = useState(demo.useCase);
  const [prompt, setPrompt] = useState(demo.prompt ?? "");
  const [status, setStatus] = useState<Demo["status"]>(demo.status);

  // ThoughtSpot Config
  const [tsInstance, setTsInstance] = useState(demo.tsInstance);
  const [embedType, setEmbedType] = useState<string>(demo.embedType ?? "liveboard");
  const [useSpotter, setUseSpotter] = useState(demo.useSpotter);
  const [spotterName, setSpotterName] = useState(demo.spotterName ?? "");
  const [reportDesigner, setReportDesigner] = useState(demo.reportDesigner);

  // Data & Security
  const [rlsRequired, setRlsRequired] = useState(demo.rlsRequired);
  const [rlsRules, setRlsRules] = useState(demo.rlsRules ?? "");

  // Access & Authentication
  const [trustedAuthEnabled, setTrustedAuthEnabled] = useState(
    demo.trustedAuthEnabled ?? false,
  );
  const [credentialsHint, setCredentialsHint] = useState(
    demo.credentialsHint ?? "",
  );
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>(
    demo.demoUsers ?? [],
  );

  // Data Model
  const [warehouse, setWarehouse] = useState(demo.dataModel?.warehouse ?? "");
  const [cdw, setCdw] = useState(demo.dataModel?.cdw ?? "");
  const [database, setDatabase] = useState(demo.dataModel?.database ?? "");
  const [schema, setSchema] = useState(demo.dataModel?.schema ?? "");
  const [tables, setTables] = useState<TableRow[]>(
    (demo.dataModel?.tables ?? []).map((t) => ({
      name: t.name,
      columns: t.columns.join("\n"),
    })),
  );

  // Liveboards
  const [liveboards, setLiveboards] = useState<DemoLiveboard[]>(
    demo.theme?.liveboards ?? [],
  );

  // Sample Questions
  const [sampleQuestions, setSampleQuestions] = useState(
    (demo.sampleQuestions ?? []).join("\n"),
  );

  // AI Assist state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Save / delete state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "fading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function updateDemoUser(idx: number, field: keyof DemoUser, value: string) {
    setDemoUsers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }


  function updateTable(idx: number, field: keyof TableRow, value: string) {
    setTables((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function updateLiveboard(idx: number, field: keyof DemoLiveboard, value: string) {
    setLiveboards((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  async function handleAiAssist() {
    setAiLoading(true);
    setAiMessage(null);
    const res = await fetch("/api/ai/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, website, useCase, tsInstance }),
    });
    setAiLoading(false);
    const json = await res.json().catch(() => ({})) as {
      error?: string;
      prompt?: string;
      sampleQuestions?: string[];
      useSpotter?: boolean;
      spotterName?: string;
      reportDesigner?: boolean;
      rlsRequired?: boolean;
    };
    if (!res.ok || json.error) {
      setAiMessage({ type: "error", text: json.error ?? "AI Assist failed." });
      return;
    }
    if (json.prompt) setPrompt(json.prompt);
    if (json.sampleQuestions) setSampleQuestions(json.sampleQuestions.join("\n"));
    if (typeof json.useSpotter === "boolean") setUseSpotter(json.useSpotter);
    if (json.spotterName) setSpotterName(json.spotterName);
    if (typeof json.reportDesigner === "boolean") setReportDesigner(json.reportDesigner);
    if (typeof json.rlsRequired === "boolean") setRlsRequired(json.rlsRequired);
    setAiMessage({ type: "success", text: "AI filled in the suggestions — review and save." });
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    setErrorMsg("");

    const patch: Partial<Demo> = {
      companyName,
      website: website || undefined,
      useCase,
      prompt: prompt || undefined,
      sampleQuestions: sampleQuestions
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean),
      status,
      tsInstance,
      embedType: embedType as Demo["embedType"],
      useSpotter,
      spotterName: spotterName || undefined,
      reportDesigner,
      rlsRequired,
      rlsRules: rlsRules || undefined,
      dataModel: {
        warehouse: warehouse || undefined,
        cdw: cdw || undefined,
        database: database || undefined,
        schema: schema || undefined,
        tables: tables
          .filter((t) => t.name.trim())
          .map((t) => ({
            name: t.name.trim(),
            columns: t.columns
              .split("\n")
              .map((c) => c.trim())
              .filter(Boolean),
          })),
      },
      theme: {
        custom: demo.theme?.custom ?? null,
        primaryColor: demo.theme?.primaryColor ?? "",
        logoUrl: demo.theme?.logoUrl,
        liveboards,
      },
      trustedAuthEnabled,
      credentialsHint: credentialsHint || undefined,
      demoUsers: demoUsers.filter((u) => u.label.trim() && u.tsUsername.trim()),
    };

    const res = await fetch(`/api/demos/${demo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (res.ok) {
      setSaveStatus("saved");
      router.refresh();
      setTimeout(() => setSaveStatus("fading"), 2000);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg((body as { error?: string }).error ?? "Save failed.");
      setSaveStatus("error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete the "${companyName}" demo? This cannot be undone.`,
      )
    )
      return;

    const res = await fetch(`/api/demos/${demo.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/demos");
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg((body as { error?: string }).error ?? "Delete failed.");
      setSaveStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      {(saveStatus === "saved" || saveStatus === "fading") && (
        <div
          className={`rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 transition-opacity duration-500 ${
            saveStatus === "fading" ? "opacity-0" : "opacity-100"
          }`}
        >
          Saved ✓
        </div>
      )}
      {saveStatus === "error" && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {/* ── Basic Info ── */}
      <Section title="Basic Info">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Fill in Company Name, Website, and Use Case, then click AI Assist to auto-populate suggestions.</span>
          <button
            type="button"
            onClick={handleAiAssist}
            disabled={aiLoading}
            className="rounded-xl border border-[#2770ef] px-4 py-2 text-sm font-semibold text-[#2770ef] hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? "Thinking…" : "✨ AI Assist"}
          </button>
        </div>

        {aiMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              aiMessage.type === "success"
                ? "bg-blue-50 text-blue-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {aiMessage.text}
            {aiMessage.type === "error" && aiMessage.text.includes("No API key") && (
              <a href="/settings" className="ml-2 underline font-medium">
                Go to Settings
              </a>
            )}
          </div>
        )}

        <Field label="Company Name">
          <input
            className={inputClass}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </Field>
        <Field label="Website">
          <input
            type="url"
            className={inputClass}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </Field>
        <Field label="Use Case">
          <textarea
            rows={4}
            className={inputClass}
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
          />
        </Field>
        <Field label="AI Prompt">
          <textarea
            rows={4}
            className={inputClass}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="System prompt for the embedded Spotter AI persona…"
          />
        </Field>
        <Field label="Sample Questions" hint="One question per line. Shown as conversation starters in the demo.">
          <textarea
            rows={4}
            className={inputClass}
            value={sampleQuestions}
            onChange={(e) => setSampleQuestions(e.target.value)}
            placeholder={"Which reps have the highest connect rates?\nShow pipeline by stage."}
          />
        </Field>
        <Field label="Status">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as Demo["status"])}
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="building">Building</option>
            <option value="live">Live</option>
          </select>
        </Field>
      </Section>

      {/* ── ThoughtSpot Config ── */}
      <Section title="ThoughtSpot Config">
        <Field label="TS Instance URL">
          <input
            className={inputClass}
            value={tsInstance}
            onChange={(e) => setTsInstance(e.target.value)}
            placeholder="https://your-instance.thoughtspot.cloud"
          />
        </Field>
        <Field label="Embed Type">
          <select
            className={inputClass}
            value={embedType}
            onChange={(e) => setEmbedType(e.target.value)}
          >
            <option value="liveboard">Liveboard</option>
            <option value="fullApp">Full App</option>
            <option value="search">Search</option>
          </select>
        </Field>
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <Toggle label="Use Spotter?" checked={useSpotter} onChange={setUseSpotter} />
          {useSpotter && (
            <Field label="Spotter Name">
              <input
                className={inputClass}
                value={spotterName}
                onChange={(e) => setSpotterName(e.target.value)}
                placeholder="e.g. Acme Insights"
              />
            </Field>
          )}
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <Toggle
            label="Report Designer?"
            checked={reportDesigner}
            onChange={setReportDesigner}
          />
        </div>
      </Section>

      {/* ── Access & Authentication ── */}
      <Section title="Access &amp; Authentication">
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <Toggle
            label="Enable Trusted Authentication (no login page for visitors)"
            checked={trustedAuthEnabled}
            onChange={setTrustedAuthEnabled}
          />
          {trustedAuthEnabled && (
            <p className="text-xs text-gray-400">
              When enabled, the portal generates auth tokens server-side. Set{" "}
              <code className="rounded bg-gray-200 px-1 font-mono text-xs text-gray-700">
                TS_AUTH_SECRET_{instanceSlug(tsInstance).toUpperCase().replace(/-/g, "_")}
              </code>{" "}
              in Vercel environment variables.
            </p>
          )}
        </div>

        <Field
          label="Credentials Hint"
          hint={`Shown on the login page when trusted auth is off, e.g. "demo / demo"`}
        >
          <input
            className={inputClass}
            value={credentialsHint}
            onChange={(e) => setCredentialsHint(e.target.value)}
            placeholder="demo / demo"
          />
        </Field>

        {/* Demo Users */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Demo Users{" "}
              <span className="text-xs font-normal text-gray-400">
                (for role picker / RLS)
              </span>
            </span>
            <button
              type="button"
              onClick={() =>
                setDemoUsers((prev) => [
                  ...prev,
                  { label: "", tsUsername: "" },
                ])
              }
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              + Add User
            </button>
          </div>
          <div className="space-y-2">
            {demoUsers.map((user, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  className={inputClass}
                  placeholder="Label (e.g. County A)"
                  value={user.label}
                  onChange={(e) => updateDemoUser(i, "label", e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="TS Username"
                  value={user.tsUsername}
                  onChange={(e) =>
                    updateDemoUser(i, "tsUsername", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setDemoUsers((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="shrink-0 text-sm text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {demoUsers.length === 0 && (
              <p className="text-sm text-gray-400">
                No demo users yet. Click + Add User to start.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Data & Security ── */}
      <Section title="Data &amp; Security">
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <Toggle label="RLS Required?" checked={rlsRequired} onChange={setRlsRequired} />
          {rlsRequired && (
            <Field
              label="RLS Rules"
              hint="Describe column filters, variable names, and how user attributes map to data."
            >
              <textarea
                rows={4}
                className={inputClass}
                value={rlsRules}
                onChange={(e) => setRlsRules(e.target.value)}
              />
            </Field>
          )}
        </div>
      </Section>

      {/* ── Data Model ── */}
      <Section title="Data Model">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Warehouse">
            <input
              className={inputClass}
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="e.g. Snowflake"
            />
          </Field>
          <Field label="CDW">
            <input
              className={inputClass}
              value={cdw}
              onChange={(e) => setCdw(e.target.value)}
              placeholder="e.g. MY_WAREHOUSE"
            />
          </Field>
          <Field label="Database">
            <input
              className={inputClass}
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              placeholder="e.g. SALES_DB"
            />
          </Field>
          <Field label="Schema">
            <input
              className={inputClass}
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="e.g. PUBLIC"
            />
          </Field>
        </div>

        {/* Tables */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tables</span>
            <button
              type="button"
              onClick={() => setTables((prev) => [...prev, { name: "", columns: "" }])}
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              + Add Table
            </button>
          </div>
          <div className="space-y-3">
            {tables.map((table, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <input
                    className={inputClass}
                    placeholder="Table name"
                    value={table.name}
                    onChange={(e) => updateTable(i, "name", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setTables((prev) => prev.filter((_, idx) => idx !== i))}
                    className="shrink-0 text-sm text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Column names, one per line"
                  value={table.columns}
                  onChange={(e) => updateTable(i, "columns", e.target.value)}
                />
              </div>
            ))}
            {tables.length === 0 && (
              <p className="text-sm text-gray-400">No tables yet. Click + Add Table to start.</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Liveboards ── */}
      <Section title="Liveboards">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Liveboard list</span>
            <button
              type="button"
              onClick={() => setLiveboards((prev) => [...prev, { id: "", name: "" }])}
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              + Add Liveboard
            </button>
          </div>
          <div className="space-y-3">
            {liveboards.map((lb, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  className={inputClass}
                  placeholder="Liveboard UUID"
                  value={lb.id}
                  onChange={(e) => updateLiveboard(i, "id", e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Display name"
                  value={lb.name}
                  onChange={(e) => updateLiveboard(i, "name", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    setLiveboards((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="shrink-0 text-sm text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {liveboards.length === 0 && (
              <p className="text-sm text-gray-400">
                No liveboards yet. Click + Add Liveboard to start.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Save button ── */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-[#2770ef] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-red-400">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Delete this demo</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Permanently removes this demo. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            Delete Demo
          </button>
        </div>
      </div>
    </div>
  );
}
