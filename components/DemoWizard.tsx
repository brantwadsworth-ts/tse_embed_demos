"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Demo, DemoDataModel } from "@/lib/demos";
import DatasetStep, { DatasetResult } from "@/components/DatasetStep";
import UsersStep from "@/components/UsersStep";

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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

// ─── Form state type ──────────────────────────────────────────────────────────

type FormData = {
  companyName: string;
  website: string;
  useCase: string;
  tsInstance: string;
  embedType: "liveboard" | "fullApp" | "search";
  useSpotter: boolean;
  spotterName: string;
  reportDesigner: boolean;
  rlsRequired: boolean;
  rlsRules: string;
  dataModel: DemoDataModel;
  prompt: string;
  sampleQuestions: string[];
  tables: string;
};

const EMPTY_FORM: FormData = {
  companyName: "",
  website: "",
  useCase: "",
  tsInstance: "",
  embedType: "liveboard",
  useSpotter: false,
  spotterName: "",
  reportDesigner: false,
  rlsRequired: false,
  rlsRules: "",
  dataModel: {
    warehouse: "Snowflake",
    cdw: "",
    database: "",
    schema: "",
    tables: [],
  },
  prompt: "",
  sampleQuestions: ["", "", ""],
  tables: "",
};

function demoToFormData(d: Partial<Demo>): Partial<FormData> {
  return {
    companyName: d.companyName ?? "",
    website: d.website ?? "",
    useCase: d.useCase ?? "",
    tsInstance: d.tsInstance ?? "",
    embedType: d.embedType ?? "liveboard",
    useSpotter: d.useSpotter ?? false,
    spotterName: d.spotterName ?? "",
    reportDesigner: d.reportDesigner ?? false,
    rlsRequired: d.rlsRequired ?? false,
    rlsRules: d.rlsRules ?? "",
    dataModel: d.dataModel ?? {
      warehouse: "Snowflake",
      cdw: "",
      database: "",
      schema: "",
      tables: [],
    },
    prompt: d.prompt ?? "",
    sampleQuestions:
      Array.isArray(d.sampleQuestions) && d.sampleQuestions.length > 0
        ? [...d.sampleQuestions, "", ""].slice(0, 3)
        : ["", "", ""],
    tables: Array.isArray(d.dataModel?.tables)
      ? d.dataModel!.tables!.map((t) => (typeof t === "string" ? t : t.name)).join("\n")
      : "",
  };
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Company", "ThoughtSpot", "Dataset", "Data", "AI Polish", "Users", "Review"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#2770ef] text-white"
                  : done
                  ? "bg-[#2770ef]/20 text-[#2770ef]"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {done ? "✓" : step}
            </div>
            {step < total && (
              <div
                className={`h-0.5 w-8 transition-colors ${done ? "bg-[#2770ef]/30" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-3 text-xs text-gray-400 font-medium">
        {STEP_LABELS[current - 1]} — step {current} of {total}
      </span>
    </div>
  );
}

// ─── Review helpers ───────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-800">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </span>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface DemoWizardProps {
  prefillData?: Partial<Demo>;
  hasPrefill?: boolean;
}

export default function DemoWizard({ prefillData, hasPrefill }: DemoWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(hasPrefill ? 6 : 1);
  const [datasetResult, setDatasetResult] = useState<DatasetResult | null>(null);
  const [formData, setFormData] = useState<FormData>(() => ({
    ...EMPTY_FORM,
    ...(prefillData ? demoToFormData(prefillData) : {}),
  }));

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (prefillData) {
      setFormData((prev) => ({ ...prev, ...demoToFormData(prefillData) }));
    }
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function setDataModel<K extends keyof DemoDataModel>(key: K, value: DemoDataModel[K]) {
    setFormData((prev) => ({
      ...prev,
      dataModel: { ...prev.dataModel, [key]: value },
    }));
  }

  function setSampleQuestion(idx: number, value: string) {
    setFormData((prev) => {
      const qs = [...prev.sampleQuestions];
      qs[idx] = value;
      return { ...prev, sampleQuestions: qs };
    });
  }

  // ── Dataset complete callback ───────────────────────────────────────────
  function handleDatasetComplete(result: DatasetResult) {
    setDatasetResult(result);
    if (result.tsHost && !formData.tsInstance) {
      set("tsInstance", result.tsHost.startsWith("http") ? result.tsHost : `https://${result.tsHost}`);
    }
    if (result.database) setDataModel("database", result.database);
    if (result.schema) setDataModel("schema", result.schema);
    if (result.tableName) {
      set("tables", result.tableName);
    }
    setStep((s) => s + 1);
  }

  // ── AI assist (structured) ──────────────────────────────────────────────
  async function handleAiAssist() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          website: formData.website,
          useCase: formData.useCase,
          tsInstance: formData.tsInstance,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = (body as { error?: string }).error ?? "AI assist failed.";
        if (msg.includes("No API key")) {
          setAiError("Go to Settings to add your API key.");
        } else {
          setAiError(msg);
        }
        return;
      }

      const data = await res.json() as {
        prompt?: string;
        sampleQuestions?: string[];
        useSpotter?: boolean;
        spotterName?: string;
        reportDesigner?: boolean;
        rlsRequired?: boolean;
      };

      setFormData((prev) => ({
        ...prev,
        prompt: data.prompt ?? prev.prompt,
        sampleQuestions:
          Array.isArray(data.sampleQuestions) && data.sampleQuestions.length > 0
            ? [...data.sampleQuestions, "", ""].slice(0, 3)
            : prev.sampleQuestions,
        useSpotter: data.useSpotter ?? prev.useSpotter,
        spotterName: data.spotterName ?? prev.spotterName,
        reportDesigner: data.reportDesigner ?? prev.reportDesigner,
        rlsRequired: data.rlsRequired ?? prev.rlsRequired,
      }));
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleCreate() {
    setSubmitLoading(true);
    setSubmitError("");

    const tables = formData.tables
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({ name, columns: [] }));

    const payload: Partial<Demo> = {
      companyName: formData.companyName,
      website: formData.website || undefined,
      useCase: formData.useCase,
      tsInstance: formData.tsInstance,
      embedType: formData.embedType,
      useSpotter: formData.useSpotter,
      spotterName: formData.spotterName || undefined,
      reportDesigner: formData.reportDesigner,
      rlsRequired: formData.rlsRequired,
      rlsRules: formData.rlsRules || undefined,
      prompt: formData.prompt || undefined,
      sampleQuestions: formData.sampleQuestions.filter(Boolean),
      dataModel: {
        warehouse: formData.dataModel.warehouse,
        cdw: formData.dataModel.cdw,
        database: formData.dataModel.database,
        schema: formData.dataModel.schema,
        tables: tables.length > 0 ? tables : undefined,
      },
    };

    try {
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json() as Demo;
        router.push(`/demos/${created.id}`);
      } else {
        const body = await res.json().catch(() => ({}));
        setSubmitError((body as { error?: string }).error ?? "Submission failed. Please try again.");
        setSubmitLoading(false);
      }
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitLoading(false);
    }
  }

  // ─── Step renders ───────────────────────────────────────────────────────

  const stepContent = () => {
    switch (step) {
      // ── Step 1: Company ──────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <Field label="Company Name" required>
              <input
                value={formData.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className={inputClass}
                placeholder="e.g. Acme Corp"
              />
            </Field>
            <Field label="Website" hint="Optional — used for context when generating AI suggestions.">
              <input
                value={formData.website}
                onChange={(e) => set("website", e.target.value)}
                type="url"
                className={inputClass}
                placeholder="https://acme.com"
              />
            </Field>
            <Field
              label="Use Case"
              required
              hint="Describe the business problem and what the embedded analytics should accomplish."
            >
              <textarea
                value={formData.useCase}
                onChange={(e) => set("useCase", e.target.value)}
                rows={5}
                className={inputClass}
                placeholder="Give our brand partners a self-serve portal to track their sales performance across regions, with data scoped to each partner's own products…"
              />
            </Field>
          </div>
        );

      // ── Step 2: ThoughtSpot ──────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-5">
            <Field
              label="ThoughtSpot Instance URL"
              required
              hint="Full URL of the ThoughtSpot cluster."
            >
              <input
                value={formData.tsInstance}
                onChange={(e) => set("tsInstance", e.target.value)}
                type="url"
                className={inputClass}
                placeholder="https://your-instance.thoughtspot.cloud"
              />
            </Field>
            <Field label="Embed Type" hint="How ThoughtSpot will be embedded in the application.">
              <select
                value={formData.embedType}
                onChange={(e) => set("embedType", e.target.value as FormData["embedType"])}
                className={inputClass}
              >
                <option value="liveboard">Liveboard</option>
                <option value="fullApp">Full App</option>
                <option value="search">Search</option>
              </select>
            </Field>
            <div className="space-y-4 rounded-xl bg-gray-50 p-4">
              <Toggle
                label="Use Spotter AI?"
                checked={formData.useSpotter}
                onChange={(v) => set("useSpotter", v)}
              />
              {formData.useSpotter && (
                <Field
                  label="Spotter / AI Persona Name"
                  hint="The AI assistant name shown to end users in the embed."
                >
                  <input
                    value={formData.spotterName}
                    onChange={(e) => set("spotterName", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Acme Insights"
                  />
                </Field>
              )}
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <Toggle
                label="Report Designer?"
                checked={formData.reportDesigner}
                onChange={(v) => set("reportDesigner", v)}
              />
            </div>
          </div>
        );

      // ── Step 3: Dataset upload ───────────────────────────────────────
      case 3:
        return (
          <DatasetStep
            onComplete={handleDatasetComplete}
            defaultTsHost={formData.tsInstance}
          />
        );

      // ── Step 4: Data ─────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-5">
            <div className="space-y-4 rounded-xl bg-gray-50 p-4">
              <Toggle
                label="RLS Required?"
                checked={formData.rlsRequired}
                onChange={(v) => set("rlsRequired", v)}
              />
              {formData.rlsRequired && (
                <Field
                  label="RLS Rules"
                  hint="Describe how data should be scoped — which columns, variable names, what values map to which users."
                >
                  <textarea
                    value={formData.rlsRules}
                    onChange={(e) => set("rlsRules", e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="Filter by region using formula variable 'user_region'. Each user is assigned one or more region values via the token API…"
                  />
                </Field>
              )}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Data Model</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Warehouse">
                  <select
                    value={formData.dataModel.warehouse ?? "Snowflake"}
                    onChange={(e) => setDataModel("warehouse", e.target.value)}
                    className={inputClass}
                  >
                    <option>Snowflake</option>
                    <option>BigQuery</option>
                    <option>Redshift</option>
                    <option>Databricks</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="CDW / Connection Name">
                  <input
                    value={formData.dataModel.cdw ?? ""}
                    onChange={(e) => setDataModel("cdw", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. SE_DEMO_WH"
                  />
                </Field>
                <Field label="Database">
                  <input
                    value={formData.dataModel.database ?? ""}
                    onChange={(e) => setDataModel("database", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. ACME_DB"
                  />
                </Field>
                <Field label="Schema">
                  <input
                    value={formData.dataModel.schema ?? ""}
                    onChange={(e) => setDataModel("schema", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. PUBLIC"
                  />
                </Field>
              </div>
              <Field label="Tables" hint="One table name per line.">
                <textarea
                  value={formData.tables}
                  onChange={(e) => set("tables", e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder={"SALES_FACT\nPRODUCT_DIM\nREGION_DIM"}
                />
              </Field>
            </div>
          </div>
        );

      // ── Step 5: AI Polish ─────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#2770ef]/20 bg-[#2770ef]/5 p-5">
              <p className="mb-4 text-sm text-gray-600">
                Click <strong>✨ AI Assist</strong> to auto-generate a Spotter prompt and sample
                questions based on your company and use case. You can edit everything afterwards.
              </p>
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={aiLoading}
                className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
              >
                {aiLoading ? "Generating…" : "✨ AI Assist"}
              </button>
              {aiError && (
                <div className="mt-3 text-sm text-red-600">
                  {aiError.includes("Settings") ? (
                    <>
                      {aiError.split("Settings")[0]}
                      <a href="/settings" className="font-medium underline text-[#2770ef]">
                        Settings
                      </a>
                      {aiError.split("Settings")[1]}
                    </>
                  ) : (
                    aiError
                  )}
                </div>
              )}
            </div>

            <Field
              label="AI Prompt"
              hint="The Spotter system prompt — sets tone and context for the embedded AI assistant."
            >
              <textarea
                value={formData.prompt}
                onChange={(e) => set("prompt", e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="You are a helpful analytics assistant for Acme Corp…"
              />
            </Field>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Sample Questions</label>
              {formData.sampleQuestions.map((q, i) => (
                <input
                  key={i}
                  value={q}
                  onChange={(e) => setSampleQuestion(i, e.target.value)}
                  className={inputClass}
                  placeholder={`Question ${i + 1}`}
                />
              ))}
            </div>
          </div>
        );

      // ── Step 6: Users ─────────────────────────────────────────────────
      case 6:
        return (
          <UsersStep
            defaultTsHost={formData.tsInstance}
            onComplete={() => setStep((s) => s + 1)}
          />
        );

      // ── Step 7: Review ────────────────────────────────────────────────
      case 7:
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Company
              </h3>
              <ReviewRow label="Name" value={formData.companyName} />
              <ReviewRow label="Website" value={formData.website} />
              <ReviewRow label="Use Case" value={formData.useCase} />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                ThoughtSpot
              </h3>
              <ReviewRow label="Instance" value={formData.tsInstance} />
              <ReviewRow label="Embed Type" value={formData.embedType} />
              <ReviewRow label="Spotter AI" value={formData.useSpotter} />
              {formData.useSpotter && <ReviewRow label="Spotter Name" value={formData.spotterName} />}
              <ReviewRow label="Report Designer" value={formData.reportDesigner} />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Data
              </h3>
              <ReviewRow label="RLS" value={formData.rlsRequired} />
              {formData.rlsRequired && <ReviewRow label="RLS Rules" value={formData.rlsRules} />}
              <ReviewRow label="Warehouse" value={formData.dataModel.warehouse} />
              <ReviewRow label="Database" value={formData.dataModel.database} />
              <ReviewRow label="Schema" value={formData.dataModel.schema} />
              <ReviewRow label="Tables" value={formData.tables.split("\n").filter(Boolean).join(", ")} />
            </div>

            {(formData.prompt || formData.sampleQuestions.some(Boolean)) && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  AI Configuration
                </h3>
                <ReviewRow label="Prompt" value={formData.prompt} />
                {formData.sampleQuestions.filter(Boolean).length > 0 && (
                  <ReviewRow
                    label="Sample Qs"
                    value={formData.sampleQuestions.filter(Boolean).join(" · ")}
                  />
                )}
              </div>
            )}

            {submitError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.companyName.trim() !== "" && formData.useCase.trim() !== "";
    if (step === 2) return formData.tsInstance.trim() !== "";
    return true;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Demo — Wizard</h1>
        <p className="mt-1 text-sm text-gray-500">Fill in each section to configure your demo.</p>
      </div>

      <StepIndicator current={step} total={7} />

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 mb-6">
        {stepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => (step === 1 ? router.push("/demos/new") : setStep((s) => s - 1))}
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {step === 1 ? "← Cancel" : "← Back"}
        </button>

        {step < 7 && step !== 3 && step !== 6 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
          >
            Next →
          </button>
        ) : step === 3 ? (
          datasetResult ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Skip →
            </button>
          )
        ) : step === 6 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Skip →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitLoading}
            className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
          >
            {submitLoading ? "Creating…" : "Create Demo →"}
          </button>
        )}
      </div>
    </div>
  );
}
