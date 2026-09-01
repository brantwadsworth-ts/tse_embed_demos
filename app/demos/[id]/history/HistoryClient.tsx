"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Demo } from "@/lib/demos";
import type { RevisionEntry } from "@/lib/revisions";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const FIELD_ICONS: Record<string, string> = {
  status: "●", companyName: "🏢", useCase: "📝", tsInstance: "⚡",
  embedType: "📦", useSpotter: "🤖", spotterName: "🤖", reportDesigner: "📊",
  rlsRequired: "🛡️", rlsRuleRows: "🛡️", trustedAuthEnabled: "🔐",
  worksheetId: "🗃️", liveboards: "📊", demoUsers: "👤",
  themeConfig: "🎨", prompt: "💬", analystName: "🧑‍💼",
};

export default function HistoryClient({
  demo,
  revisions,
  isOwner,
}: {
  demo: Demo;
  revisions: RevisionEntry[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(revisions[0]?.id ?? null);
  const [rolling, setRolling] = useState<string | null>(null);
  const [rollError, setRollError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleRollback(revId: string) {
    setRolling(revId);
    setRollError(null);
    try {
      const res = await fetch(`/api/demos/${demo.id}/revisions/${revId}/rollback`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setRollError(body.error ?? "Rollback failed.");
      } else {
        router.push(`/demos/${demo.id}/edit`);
        router.refresh();
      }
    } catch (e) {
      setRollError(String(e));
    }
    setRolling(null);
    setConfirmId(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href={`/demos/${demo.id}`} style={{ color: "#6b7280", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to demo
        </Link>
        <div style={{ width: 1, height: 16, background: "#e5e7eb" }} />
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>{demo.companyName}</h1>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Revision History</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280", background: "#f1f5f9", borderRadius: 999, padding: "3px 10px" }}>
            {revisions.length} revision{revisions.length !== 1 ? "s" : ""}
          </div>
          <Link
            href={`/demos/${demo.id}/edit`}
            style={{ background: "#2770ef", color: "#fff", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Edit Demo →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        {revisions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No revisions yet</p>
            <p style={{ fontSize: 13 }}>Every time you save this demo, a revision will be recorded here.</p>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: 17, top: 24, bottom: 24, width: 2, background: "#e5e7eb", zIndex: 0 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {revisions.map((rev, i) => {
                const isExpanded = expanded === rev.id;
                const isFirst = i === 0;

                return (
                  <div key={rev.id} style={{ position: "relative", zIndex: 1 }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: "absolute", left: 8, top: 16, width: 18, height: 18, borderRadius: "50%",
                      background: isFirst ? "#2770ef" : "#fff",
                      border: `2px solid ${isFirst ? "#2770ef" : "#d1d5db"}`,
                      zIndex: 2,
                    }} />

                    {/* Card */}
                    <div style={{ marginLeft: 36, background: "#fff", border: `1px solid ${isExpanded ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.15s" }}>
                      {/* Card header — always visible, clickable */}
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : rev.id)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            {isFirst && (
                              <span style={{ fontSize: 10, fontWeight: 700, background: "#eff6ff", color: "#2770ef", borderRadius: 4, padding: "1px 6px", letterSpacing: "0.05em" }}>
                                CURRENT
                              </span>
                            )}
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {rev.summary}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#6b7280" }}>
                            <span title={fullDate(rev.timestamp)}>{timeAgo(rev.timestamp)}</span>
                            <span>·</span>
                            <span>@{rev.author}</span>
                            {rev.changes.length > 0 && (
                              <>
                                <span>·</span>
                                <span>{rev.changes.length} field{rev.changes.length !== 1 ? "s" : ""} changed</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>{rev.id.slice(-8)}</span>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                          >
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </button>

                      {/* Expanded diff + rollback */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #f1f5f9" }}>
                          {/* Change diff */}
                          {rev.changes.length > 0 ? (
                            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9ca3af", margin: "0 0 6px" }}>Changes</p>
                              {rev.changes.map((c) => (
                                <div key={c.field} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                                  <span style={{ fontSize: 14, flexShrink: 0 }}>{FIELD_ICONS[c.field] ?? "·"}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontWeight: 600, color: "#374151" }}>{c.label}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                                      {c.from && (
                                        <code style={{ fontSize: 11, background: "#fee2e2", color: "#b91c1c", borderRadius: 4, padding: "1px 6px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                          − {c.from || "(empty)"}
                                        </code>
                                      )}
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                      <code style={{ fontSize: 11, background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "1px 6px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        + {c.to || "(empty)"}
                                      </code>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ padding: "10px 16px", fontSize: 12, color: "#9ca3af" }}>No tracked field changes in this save.</div>
                          )}

                          {/* Rollback */}
                          {isOwner && !isFirst && (
                            <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              {rollError && confirmId === rev.id && (
                                <span style={{ fontSize: 12, color: "#dc2626" }}>{rollError}</span>
                              )}
                              {confirmId === rev.id ? (
                                <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmId(null)}
                                    style={{ fontSize: 12, color: "#6b7280", background: "#f1f5f9", border: "none", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleRollback(rev.id)}
                                    disabled={rolling === rev.id}
                                    style={{ fontSize: 12, color: "#fff", background: "#ef4444", border: "none", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontWeight: 600, opacity: rolling === rev.id ? 0.6 : 1 }}
                                  >
                                    {rolling === rev.id ? "Rolling back…" : "Yes, restore this version"}
                                  </button>
                                </div>
                              ) : (
                                <div style={{ marginLeft: "auto" }}>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmId(rev.id)}
                                    style={{ fontSize: 12, color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}
                                  >
                                    ↩ Restore this version
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
