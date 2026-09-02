"use client";

import React, { useCallback, useRef, useState } from "react";

const TS_INSTANCES = [
  { name: "SE Demo (se-thoughtspot-cloud)", url: "https://se-thoughtspot-cloud.thoughtspot.cloud" },
  { name: "Montana DPHHS", url: "https://montana.thoughtspot.cloud" },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#2770ef] focus:ring-2 focus:ring-[#2770ef]/20 transition-colors";

interface ProvisionedUser {
  username: string;
  displayName: string;
  email: string;
  status: "created" | "failed";
  error?: string;
}

type Mode = "sequential" | "csv";

export default function WorkshopProvisioner() {
  // Connection
  const [instance, setInstance] = useState(TS_INSTANCES[0].url);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");

  // Mode
  const [mode, setMode] = useState<Mode>("sequential");

  // Sequential options
  const [prefix, setPrefix] = useState("demo");
  const [count, setCount] = useState(10);
  const [startAt, setStartAt] = useState(1);
  const [padZeros, setPadZeros] = useState(true);

  // CSV options
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvText, setCsvText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared
  const [userPassword, setUserPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [groupIdentifiers, setGroupIdentifiers] = useState("");

  // Results
  const [provisioning, setProvisioning] = useState(false);
  const [results, setResults] = useState<ProvisionedUser[] | null>(null);
  const [provisionError, setProvisionError] = useState("");

  // Cleanup
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<Array<{ username: string; status: string }> | null>(null);

  const instanceLabel = TS_INSTANCES.find((i) => i.url === instance)?.name ?? new URL(instance).hostname.split(".")[0];

  // Derived preview for sequential mode
  const width = String(startAt + count - 1).length;
  const previewFirst = `${prefix}_${padZeros ? String(startAt).padStart(width, "0") : String(startAt)}`;
  const previewLast = `${prefix}_${padZeros ? String(startAt + count - 1).padStart(width, "0") : String(startAt + count - 1)}`;

  // Parse CSV text → emails
  const parseCsvText = useCallback((text: string) => {
    const lines = text.split(/[\n,;]+/).map((l) => l.trim().toLowerCase()).filter((l) => l.includes("@"));
    setCsvEmails(lines);
    setCsvText(text);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => parseCsvText((ev.target?.result as string) ?? "");
      reader.readAsText(file);
    },
    [parseCsvText],
  );

  async function testConnect() {
    if (!adminUsername.trim() || !adminPassword.trim()) return;
    setConnecting(true);
    setConnectError("");
    setConnected(false);
    try {
      const res = await fetch(`${instance}/api/rest/2.0/auth/token/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername.trim(), password: adminPassword.trim(), validity_time_in_sec: 60 }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Login failed (${res.status}): ${text.slice(0, 120)}`);
      }
      setConnected(true);
    } catch (err) {
      setConnectError(String(err).replace(/^Error: /, ""));
    } finally {
      setConnecting(false);
    }
  }

  async function provision() {
    if (!connected || !userPassword.trim() || provisioning) return;
    setProvisioning(true);
    setProvisionError("");
    setResults(null);
    setCleanupResults(null);
    try {
      const body =
        mode === "sequential"
          ? {
              instance,
              adminUsername: adminUsername.trim(),
              adminPassword: adminPassword.trim(),
              userPassword: userPassword.trim(),
              mode: "sequential" as const,
              prefix: prefix.trim() || "demo",
              count,
              startAt,
              padZeros,
              groupIdentifiers: groupIdentifiers.trim() ? groupIdentifiers.split(",").map((g) => g.trim()).filter(Boolean) : undefined,
            }
          : {
              instance,
              adminUsername: adminUsername.trim(),
              adminPassword: adminPassword.trim(),
              userPassword: userPassword.trim(),
              mode: "csv" as const,
              emails: csvEmails,
              groupIdentifiers: groupIdentifiers.trim() ? groupIdentifiers.split(",").map((g) => g.trim()).filter(Boolean) : undefined,
            };

      const res = await fetch("/api/admin/workshop/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { results?: ProvisionedUser[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Provisioning failed");
      setResults(data.results ?? []);
    } catch (err) {
      setProvisionError(String(err).replace(/^Error: /, ""));
    } finally {
      setProvisioning(false);
    }
  }

  async function cleanupAll() {
    if (!results || !connected) return;
    const createdUsernames = results.filter((r) => r.status === "created").map((r) => r.username);
    if (!createdUsernames.length) return;
    if (!confirm(`Delete ${createdUsernames.length} workshop users from ThoughtSpot? This cannot be undone.`)) return;
    setCleaning(true);
    setCleanupResults(null);
    try {
      const res = await fetch("/api/admin/workshop/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance,
          adminUsername: adminUsername.trim(),
          adminPassword: adminPassword.trim(),
          usernames: createdUsernames,
        }),
      });
      const data = (await res.json()) as { results?: Array<{ username: string; status: string }>; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Cleanup failed");
      setCleanupResults(data.results ?? []);
    } catch (err) {
      setProvisionError(String(err).replace(/^Error: /, ""));
    } finally {
      setCleaning(false);
    }
  }

  function downloadCredentials() {
    if (!results) return;
    const created = results.filter((r) => r.status === "created");
    const rows = [
      ["Username", "Password", "Display Name", "Email"],
      ...created.map((u) => [u.username, userPassword, u.displayName, u.email]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `workshop-credentials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const createdCount = results?.filter((r) => r.status === "created").length ?? 0;
  const failedCount = results?.filter((r) => r.status === "failed").length ?? 0;
  const readyToProvision =
    connected &&
    userPassword.trim().length >= 8 &&
    (mode === "sequential" ? prefix.trim().length > 0 && count > 0 : csvEmails.length > 0);

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Admin Connection ───────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
          1. Connect as ThoughtSpot Admin
        </h2>
        <div
          style={{
            background: connected ? "#f0fdf4" : "#f8fafc",
            border: `1px solid ${connected ? "#bbf7d0" : "#e5e7eb"}`,
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: connected ? 0 : 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: connected ? "#22c55e" : "#d1d5db",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: connected ? "#15803d" : "#6b7280" }}>
              {connected ? `Connected to ${instanceLabel} as ${adminUsername}` : `Connect to ThoughtSpot`}
            </span>
            {connected && (
              <button
                type="button"
                onClick={() => { setConnected(false); setResults(null); setCleanupResults(null); }}
                style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Disconnect
              </button>
            )}
          </div>
          {!connected && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    CLUSTER
                  </label>
                  <select
                    className={inputClass}
                    value={instance}
                    onChange={(e) => { setInstance(e.target.value); setConnected(false); setConnectError(""); }}
                  >
                    {TS_INSTANCES.map((i) => (
                      <option key={i.url} value={i.url}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    ADMIN USERNAME
                  </label>
                  <input
                    className={inputClass}
                    placeholder="tsadmin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void testConnect()}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    ADMIN PASSWORD
                  </label>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void testConnect()}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void testConnect()}
                  disabled={connecting || !adminUsername.trim() || !adminPassword.trim()}
                  className="rounded-lg bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors whitespace-nowrap"
                  style={{ height: 38 }}
                >
                  {connecting ? "Connecting…" : "Connect →"}
                </button>
              </div>
              {connectError && (
                <p style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", borderRadius: 6, padding: "6px 10px", marginTop: 8 }}>
                  {connectError}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── User Setup ─────────────────────────────────────────────────── */}
      <section style={{ opacity: connected ? 1 : 0.45, pointerEvents: connected ? "auto" : "none" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
          2. Configure Workshop Users
        </h2>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 0, border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 16, width: "fit-content" }}>
          {(["sequential", "csv"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: "7px 20px",
                fontSize: 13,
                fontWeight: 600,
                background: mode === m ? "#2770ef" : "#fff",
                color: mode === m ? "#fff" : "#6b7280",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {m === "sequential" ? "Sequential (demo1–N)" : "CSV / Email list"}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {mode === "sequential" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px auto", gap: 12, alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>USERNAME PREFIX</label>
                  <input
                    className={inputClass}
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    placeholder="demo"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>COUNT</label>
                  <input
                    className={inputClass}
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>START AT</label>
                  <input
                    className={inputClass}
                    type="number"
                    min={1}
                    value={startAt}
                    onChange={(e) => setStartAt(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", paddingBottom: 2, whiteSpace: "nowrap", cursor: "pointer" }}>
                  <input type="checkbox" checked={padZeros} onChange={(e) => setPadZeros(e.target.checked)} className="h-4 w-4 rounded" />
                  Pad zeros
                </label>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", background: "#fff", borderRadius: 8, padding: "8px 12px", margin: 0, border: "1px solid #e5e7eb" }}>
                Will create <strong>{count}</strong> users:{" "}
                <code style={{ fontFamily: "monospace", background: "#f3f4f6", padding: "1px 5px", borderRadius: 4 }}>{previewFirst}</code>
                {" → "}
                <code style={{ fontFamily: "monospace", background: "#f3f4f6", padding: "1px 5px", borderRadius: 4 }}>{previewLast}</code>
              </p>
            </>
          ) : (
            <>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                  UPLOAD CSV OR PASTE EMAILS
                </label>
                <div
                  style={{ border: "2px dashed #d1d5db", borderRadius: 8, padding: "20px", textAlign: "center", background: "#fff", cursor: "pointer", marginBottom: 8 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                    {csvEmails.length > 0
                      ? `${csvEmails.length} email${csvEmails.length !== 1 ? "s" : ""} loaded`
                      : "Click to upload CSV, or paste emails below"}
                  </p>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFileChange} />
                <textarea
                  className={inputClass}
                  rows={4}
                  placeholder={"alice@acme.com\nbob@acme.com\ncarol@acme.com"}
                  value={csvText}
                  onChange={(e) => parseCsvText(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                />
              </div>
              {csvEmails.length > 0 && (
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  Usernames will be derived from the email prefix (e.g. <code style={{ fontFamily: "monospace" }}>alice@acme.com</code> → <code style={{ fontFamily: "monospace" }}>alice</code>)
                </p>
              )}
            </>
          )}

          {/* Shared: password + group */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                USER PASSWORD <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className={inputClass}
                  type={showUserPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword((v) => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 12 }}
                >
                  {showUserPassword ? "hide" : "show"}
                </button>
              </div>
              {userPassword.length > 0 && userPassword.length < 8 && (
                <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Must be at least 8 characters</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                TS GROUP(S) <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                className={inputClass}
                placeholder="workshop-group, another-group"
                value={groupIdentifiers}
                onChange={(e) => setGroupIdentifiers(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Provision Button ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => void provision()}
          disabled={!readyToProvision || provisioning}
          className="rounded-xl bg-[#2770ef] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1a56c4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {provisioning
            ? "Creating users…"
            : `Create ${mode === "sequential" ? count : csvEmails.length} Users`}
        </button>
        {!connected && <span style={{ fontSize: 12, color: "#9ca3af" }}>Connect first</span>}
        {connected && !userPassword.trim() && <span style={{ fontSize: 12, color: "#9ca3af" }}>Set a user password</span>}
        {connected && userPassword.trim().length >= 8 && mode === "csv" && csvEmails.length === 0 && (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Upload or paste emails</span>
        )}
      </div>

      {provisionError && (
        <p style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "10px 14px", margin: 0 }}>
          {provisionError}
        </p>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {results && (
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
              Results — {createdCount} created{failedCount > 0 ? `, ${failedCount} failed` : ""}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              {createdCount > 0 && (
                <button
                  type="button"
                  onClick={downloadCredentials}
                  className="rounded-lg border border-[#2770ef] px-3 py-1.5 text-xs font-semibold text-[#2770ef] hover:bg-blue-50 transition-colors"
                >
                  Download credentials CSV
                </button>
              )}
              {createdCount > 0 && connected && (
                <button
                  type="button"
                  onClick={() => void cleanupAll()}
                  disabled={cleaning}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {cleaning ? "Deleting…" : `Delete all ${createdCount} users`}
                </button>
              )}
            </div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>#</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Username</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Email</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.username} style={{ borderBottom: i < results.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "7px 12px", color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ padding: "7px 12px", fontFamily: "monospace", fontWeight: 500 }}>{r.username}</td>
                    <td style={{ padding: "7px 12px", color: "#6b7280" }}>{r.email}</td>
                    <td style={{ padding: "7px 12px" }}>
                      {r.status === "created" ? (
                        <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 999, padding: "2px 8px", fontWeight: 600, fontSize: 11 }}>
                          Created
                        </span>
                      ) : (
                        <span title={r.error} style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 999, padding: "2px 8px", fontWeight: 600, fontSize: 11, cursor: "help" }}>
                          Failed {r.error ? "ⓘ" : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cleanupResults && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
              Cleanup: {cleanupResults.filter((r) => r.status === "deleted").length} deleted,{" "}
              {cleanupResults.filter((r) => r.status !== "deleted").length} failed.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
