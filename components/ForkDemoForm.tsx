"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Demo } from "@/lib/demos";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

export default function ForkDemoForm({
  demo,
  currentLogin,
}: {
  demo: Demo;
  currentLogin: string;
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // currentLogin is available for display / future use
  void currentLogin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    // Build the fork payload — copy all fields except id / owner / createdAt,
    // override companyName, and record the source id.
    const { id: _id, owner: _owner, createdAt: _createdAt, ...rest } = demo;
    void _id; void _owner; void _createdAt;

    const payload = {
      ...rest,
      companyName: companyName.trim(),
      forkedFrom: demo.id,
    };

    const res = await fetch("/api/demos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const newDemo = (await res.json()) as Demo;
      router.push(`/demos/${newDemo.id}`);
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "Fork failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8">
      {/* Context banner */}
      <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
        You&apos;re creating a copy of{" "}
        <span className="font-semibold">{demo.companyName}</span>. Give it a new name
        and customize it.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            New Company Name <span className="text-red-400">*</span>
          </label>
          <input
            autoFocus
            className={inputClass}
            placeholder={`e.g. ${demo.companyName} (Copy)`}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">
            This will become the new demo ID (slug). All other settings are copied from
            the original and can be edited after forking.
          </p>
        </div>

        {/* Summarise what will be copied */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-700 mb-2">What gets copied</p>
          <p>Use case, prompt, TS instance, embed type, data model, and theme.</p>
          <p>Status will be set to <span className="font-mono">draft</span> and you will be the new owner.</p>
          {demo.forkedFrom && (
            <p className="text-xs text-gray-400">
              (This demo was itself forked from <span className="font-mono">{demo.forkedFrom}</span>.)
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/demos/${demo.id}`)}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Forking…" : "Fork Demo →"}
          </button>
        </div>
      </form>
    </div>
  );
}
