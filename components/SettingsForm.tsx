"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ hasKey }: { hasKey: boolean }) {
  const router = useRouter();
  const [showInput, setShowInput] = useState(!hasKey);
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "removed" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave() {
    if (!keyValue.trim()) return;
    setSaving(true);
    setStatus("idle");
    setErrorMsg("");
    const res = await fetch("/api/user/apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyValue.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus("saved");
      setKeyValue("");
      setShowInput(false);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg((body as { error?: string }).error ?? "Failed to save key.");
      setStatus("error");
    }
  }

  async function handleRemove() {
    if (!window.confirm("Remove your API key? You will need to re-enter it to use AI Assist.")) return;
    setRemoving(true);
    setStatus("idle");
    setErrorMsg("");
    const res = await fetch("/api/user/apikey", { method: "DELETE" });
    setRemoving(false);
    if (res.ok) {
      setStatus("removed");
      setShowInput(true);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg((body as { error?: string }).error ?? "Failed to remove key.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-gray-400">
        Anthropic API Key
      </h2>
      <p className="mb-5 text-xs text-gray-400">
        Your key is stored securely and used only when you click AI Assist. It is never shared.
      </p>

      {status === "saved" && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          API key saved successfully.
        </div>
      )}
      {status === "removed" && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          API key removed.
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {!showInput && hasKey && status !== "removed" ? (
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <span className="text-emerald-500">✓</span> API key saved
          </span>
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Replace Key
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {removing ? "Removing…" : "Remove Key"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="password"
            placeholder="sk-ant-…"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !keyValue.trim()}
              className="rounded-xl bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Key"}
            </button>
            {hasKey && status !== "removed" && (
              <button
                type="button"
                onClick={() => { setShowInput(false); setKeyValue(""); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
