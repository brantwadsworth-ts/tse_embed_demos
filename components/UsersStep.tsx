"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupConfig {
  key: string;
  label: string;
  color: string;
  placeholder: string;
}

const GROUPS: GroupConfig[] = [
  {
    key: "business",
    label: "Business",
    color: "amber",
    placeholder:
      "Paste emails, one per line or comma-separated.\nNames + emails work too:\nJohn Smith – john.smith@acme.com",
  },
  {
    key: "data",
    label: "Data",
    color: "blue",
    placeholder: "faisal.ghoury@kearney.com\naakash.sharan@kearney.com",
  },
  {
    key: "developer",
    label: "Developer",
    color: "violet",
    placeholder: "dev1@acme.com, dev2@acme.com",
  },
  {
    key: "admin",
    label: "Admin",
    color: "emerald",
    placeholder: "admin@acme.com",
  },
];

export interface ProvisionResult {
  groupName: string;
  created: number;
  skipped: number;
  errors: string[];
}

export interface UsersStepProps {
  defaultTsHost?: string;
  defaultTsUsername?: string;
  onComplete?: (results: ProvisionResult[]) => void;
}

// ─── Email extraction ─────────────────────────────────────────────────────────

function extractEmailsWithNames(raw: string): { email: string; displayName?: string }[] {
  const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const results: { email: string; displayName?: string }[] = [];
  const seen = new Set<string>();

  for (const line of raw.split(/[\n,]+/)) {
    const t = line.trim();
    if (!t) continue;
    const matches = t.match(EMAIL_RE);
    if (!matches) continue;
    const email = matches[0].toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);

    // Try "Name – email" or "Name <email>" or "[display](mailto:email)" patterns
    let displayName: string | undefined;
    const dashMatch = t.match(/^(.+?)\s*[–\-—]\s*[^@\s]+@/);
    const angleMatch = t.match(/^(.+?)\s*<[^@\s]+@/);
    const raw2 = dashMatch?.[1]?.trim() ?? angleMatch?.[1]?.trim();
    if (raw2 && raw2.length > 1 && raw2.length < 60 && !raw2.includes("@")) {
      displayName = raw2;
    }
    if (!displayName) {
      // Derive from local part of email: "faisal.ghoury" → "Faisal Ghoury"
      const local = email.split("@")[0];
      displayName = local
        .split(/[._\-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    results.push({ email, displayName });
  }
  return results;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

const COLOR_CLASSES: Record<string, { badge: string; border: string; dot: string }> = {
  amber: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  violet: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersStep({
  defaultTsHost = "",
  defaultTsUsername = "",
  onComplete,
}: UsersStepProps) {
  const [tsHost, setTsHost] = useState(defaultTsHost);
  const [tsUsername, setTsUsername] = useState(defaultTsUsername);
  const [tsPassword, setTsPassword] = useState("");
  const [defaultPassword, setDefaultPassword] = useState("");
  const [emailsByGroup, setEmailsByGroup] = useState<Record<string, string>>(
    Object.fromEntries(GROUPS.map((g) => [g.key, ""])),
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProvisionResult[] | null>(null);
  const [error, setError] = useState("");

  function setGroup(key: string, value: string) {
    setEmailsByGroup((prev) => ({ ...prev, [key]: value }));
  }

  function emailCount(key: string) {
    return extractEmailsWithNames(emailsByGroup[key]).length;
  }

  const totalEmails = GROUPS.reduce((n, g) => n + emailCount(g.key), 0);

  async function handleProvision() {
    if (!tsHost.trim()) {
      setError("ThoughtSpot instance URL is required.");
      return;
    }
    if (!defaultPassword.trim()) {
      setError("A default password is required for new users.");
      return;
    }
    if (totalEmails === 0) {
      setError("Add at least one email address to provision.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    const groups = GROUPS.filter((g) => emailCount(g.key) > 0).map((g) => ({
      name: g.label,
      displayName: g.label,
      users: extractEmailsWithNames(emailsByGroup[g.key]),
    }));

    try {
      const res = await fetch("/api/admin/ts/provision-users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tsHost, tsUsername, tsPassword, defaultPassword, groups }),
      });

      const data = (await res.json()) as { results?: ProvisionResult[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Provisioning failed.");
        return;
      }
      setResults(data.results ?? []);
      onComplete?.(data.results ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Provision POC users</p>
        <p className="text-blue-600">
          Creates groups (Business, Data, Developer, Admin) in your ThoughtSpot instance and adds
          users. Skip this step if the instance already has users set up.
        </p>
      </div>

      {/* TS Credentials */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">ThoughtSpot credentials</h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
              Instance URL
            </label>
            <input
              value={tsHost}
              onChange={(e) => setTsHost(e.target.value)}
              className={inputClass}
              placeholder="https://your-instance.thoughtspot.cloud"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Admin username
              </label>
              <input
                value={tsUsername}
                onChange={(e) => setTsUsername(e.target.value)}
                className={inputClass}
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Admin password
              </label>
              <input
                type="password"
                value={tsPassword}
                onChange={(e) => setTsPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
              Default password for new users
            </label>
            <input
              value={defaultPassword}
              onChange={(e) => setDefaultPassword(e.target.value)}
              className={inputClass}
              placeholder="e.g. POC_Demo_2025!"
            />
            <p className="mt-1 text-xs text-gray-400">
              All newly created users will get this temporary password.
            </p>
          </div>
        </div>
      </div>

      {/* Group inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GROUPS.map((g) => {
          const cc = COLOR_CLASSES[g.color];
          const count = emailCount(g.key);
          return (
            <div key={g.key} className={`rounded-2xl border bg-white p-4 ${cc.border}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${cc.dot}`} />
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cc.badge}`}>
                  {g.label}
                </span>
                {count > 0 && (
                  <span className="ml-auto text-xs font-medium text-gray-400">
                    {count} user{count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <textarea
                value={emailsByGroup[g.key]}
                onChange={(e) => setGroup(g.key, e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20 resize-none font-mono"
                placeholder={g.placeholder}
              />
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Provision button */}
      {!results && (
        <button
          type="button"
          onClick={handleProvision}
          disabled={loading || totalEmails === 0}
          className="rounded-xl bg-[#2770ef] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-40 transition-colors"
        >
          {loading
            ? `Creating ${totalEmails} user${totalEmails !== 1 ? "s" : ""}…`
            : `Create ${totalEmails > 0 ? `${totalEmails} ` : ""}User${totalEmails !== 1 ? "s" : ""} & Groups →`}
        </button>
      )}

      {/* Results */}
      {results && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-sm font-semibold text-emerald-800">Provisioning complete</p>
          <div className="space-y-2">
            {results.map((r) => {
              const hasErrors = r.errors.length > 0;
              return (
                <div key={r.groupName} className="rounded-xl bg-white border border-emerald-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{r.groupName}</span>
                    {r.created > 0 && (
                      <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                        {r.created} created
                      </span>
                    )}
                    {r.skipped > 0 && (
                      <span className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs font-medium">
                        {r.skipped} already existed
                      </span>
                    )}
                    {hasErrors && (
                      <span className="rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-xs font-medium">
                        {r.errors.length} error{r.errors.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {hasErrors && (
                    <ul className="mt-2 space-y-0.5">
                      {r.errors.map((e, i) => (
                        <li key={i} className="text-xs text-red-500">
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
