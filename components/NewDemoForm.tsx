"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
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
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

export default function NewDemoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rlsRequired, setRlsRequired] = useState(false);
  const [useSpotter, setUseSpotter] = useState(false);
  const [reportDesigner, setReportDesigner] = useState(false);

  const screenshotRef = useRef<HTMLInputElement>(null);
  const sampleDataRef = useRef<HTMLInputElement>(null);
  const [screenshotNames, setScreenshotNames] = useState<string[]>([]);
  const [sampleDataName, setSampleDataName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    data.set("rlsRequired", String(rlsRequired));
    data.set("useSpotter", String(useSpotter));
    data.set("reportDesigner", String(reportDesigner));

    // Attach screenshot files
    const screenshots = screenshotRef.current?.files;
    if (screenshots) {
      data.delete("screenshots");
      for (const f of Array.from(screenshots)) data.append("screenshots", f);
    }

    const res = await fetch("/api/demos", { method: "POST", body: data });
    if (res.ok) {
      router.push("/demos?submitted=1");
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Submission failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Company Details */}
      <Section title="Company Details">
        <Field label="Company Name" required>
          <input name="companyName" required className={inputClass} placeholder="e.g. Acme Corp" />
        </Field>
        <Field label="Website">
          <input name="website" type="url" className={inputClass} placeholder="https://acme.com" />
        </Field>
      </Section>

      {/* Project Overview */}
      <Section title="Project Overview">
        <Field label="Use Case" required hint="Describe the business problem and what the embedded analytics should accomplish.">
          <textarea
            name="useCase"
            required
            rows={4}
            className={inputClass}
            placeholder="e.g. Give our brand partners a self-serve portal to track their sales performance across regions, with data scoped to each partner's own products…"
          />
        </Field>
        <Field label="Sample Questions" hint="Enter one question per line — these become Spotter suggested prompts.">
          <textarea
            name="sampleQuestions"
            rows={4}
            className={inputClass}
            placeholder={"What are my top selling items this month?\nHow does my region compare to last quarter?"}
          />
        </Field>
      </Section>

      {/* Existing Setup */}
      <Section title="Existing Setup (optional)">
        <Field label="Screenshots of Current Embedded Solution" hint="Upload any existing embed screenshots for reference. JPG, PNG accepted.">
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-[#2770ef]/50 transition-colors"
            onClick={() => screenshotRef.current?.click()}
          >
            <svg className="mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9.75h.008v.008H3V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {screenshotNames.length > 0 ? (
              <p className="text-sm text-gray-600">{screenshotNames.join(", ")}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500">Click to upload screenshots</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10MB each</p>
              </>
            )}
          </div>
          <input
            ref={screenshotRef}
            type="file"
            name="screenshots"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              setScreenshotNames(Array.from(e.target.files ?? []).map((f) => f.name))
            }
          />
        </Field>
      </Section>

      {/* Sample Data */}
      <Section title="Sample Data (optional)">
        <Field label="Data File" hint="Upload a CSV or Excel file with representative sample data.">
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-[#2770ef]/50 transition-colors"
            onClick={() => sampleDataRef.current?.click()}
          >
            <svg className="mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {sampleDataName ? (
              <p className="text-sm text-gray-600">{sampleDataName}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500">Click to upload data file</p>
                <p className="text-xs text-gray-400">CSV, XLSX up to 50MB</p>
              </>
            )}
          </div>
          <input
            ref={sampleDataRef}
            type="file"
            name="sampleData"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setSampleDataName(e.target.files?.[0]?.name ?? "")}
          />
        </Field>
      </Section>

      {/* ThoughtSpot Configuration */}
      <Section title="ThoughtSpot Configuration">
        <Field label="TS Instance" required hint="Full URL of the ThoughtSpot cluster (e.g. https://acme.thoughtspot.cloud).">
          <input name="tsInstance" required type="url" className={inputClass} placeholder="https://your-instance.thoughtspot.cloud" />
        </Field>

        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <Toggle label="RLS Required?" checked={rlsRequired} onChange={setRlsRequired} />
          {rlsRequired && (
            <Field label="RLS Rules" hint="Describe how data should be scoped — which columns, variable names, what values map to which users.">
              <textarea
                name="rlsRules"
                rows={3}
                className={inputClass}
                placeholder="e.g. Filter by region using formula variable 'user_region'. Each user is assigned one or more region values via the token API…"
              />
            </Field>
          )}
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <Toggle label="Use Spotter?" checked={useSpotter} onChange={setUseSpotter} />
          {useSpotter && (
            <Field label="Spotter / AI Persona Name" hint="The AI assistant name shown to end users in the embed.">
              <input name="spotterName" className={inputClass} placeholder="e.g. Acme Insights" />
            </Field>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <Toggle label="Report Designer?" checked={reportDesigner} onChange={setReportDesigner} />
        </div>
      </Section>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/demos")}
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting…" : "Submit Request →"}
        </button>
      </div>
    </form>
  );
}
