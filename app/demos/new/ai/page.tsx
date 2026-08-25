"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

export default function AIQuickStartPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ freeform: description.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const config = await res.json();
      const encoded = btoa(JSON.stringify(config));
      router.push(`/demos/new/wizard?prefill=${encoded}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full">
      <Nav isAdmin={false} />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-2xl font-bold text-gray-900">Quick Start with AI</h1>
          </div>
          <p className="text-sm text-gray-500">
            Describe what you want to build and Claude will generate a complete demo configuration for you to review and adjust.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Describe the demo you want to build. Include:
            </label>
            <ul className="mb-4 space-y-1 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#2770ef]">•</span>
                The company or industry
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#2770ef]">•</span>
                What ThoughtSpot instance to use
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#2770ef]">•</span>
                What the demo should show
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#2770ef]">•</span>
                Any special requirements (RLS, Spotter, etc.)
              </li>
            </ul>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              required
              className={inputClass}
              placeholder={`Build a demo for Acme Corp, a retail analytics company.\nUse the se-thoughtspot-cloud instance. The demo should show\nsales performance by region with row-level security by territory.\nEnable Spotter AI named 'Acme Insights'.`}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/demos/new")}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="rounded-xl bg-[#2770ef] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
            >
              {loading ? "Claude is building your config…" : "Build Demo Config →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
