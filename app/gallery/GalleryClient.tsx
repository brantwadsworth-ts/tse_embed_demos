"use client";

import { useState } from "react";
import Link from "next/link";
import type { Demo } from "@/lib/demos";

type Filter = "all" | "spotter" | "rls" | "reports";

const FILTER_LABELS: { key: Filter; label: string; emoji: string }[] = [
  { key: "all",     label: "All Demos",       emoji: "✦" },
  { key: "spotter", label: "Spotter AI",       emoji: "🤖" },
  { key: "rls",     label: "Row-Level Security", emoji: "🛡️" },
  { key: "reports", label: "Report Designer",  emoji: "📊" },
];

const THEME_GRADIENTS: Record<string, string> = {
  light:    "linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)",
  dark:     "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
  minimal:  "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
  glass:    "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
  midnight: "linear-gradient(135deg, #070b14 0%, #0e1628 100%)",
  custom:   "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
};

const THEME_ACCENT: Record<string, string> = {
  light: "#2770ef", dark: "#2f81f7", minimal: "#000000",
  glass: "#e94560", midnight: "#6366f1", custom: "#a78bfa",
};

export default function GalleryClient({ demos }: { demos: Demo[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = demos.filter((d) => {
    if (filter === "spotter") return d.useSpotter;
    if (filter === "rls")     return d.rlsRequired;
    if (filter === "reports") return d.reportDesigner;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,14,26,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2770ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>ThoughtSpot</span>
              <span style={{ fontSize: 12, color: "#475569", marginLeft: 8 }}>Demo Gallery</span>
            </div>
          </div>
          <Link
            href="/login"
            style={{ background: "#2770ef", color: "#fff", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}
          >
            Sign in to build →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 48px" }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2770ef" }}>Live Demos</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#2770ef", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "#475569" }}>{demos.length} demos available</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#f8fafc", margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          See what&apos;s possible<br />
          <span style={{ background: "linear-gradient(90deg, #2770ef, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            with ThoughtSpot
          </span>
        </h1>
        <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
          Real embedded analytics demos built for enterprise customers. Click any demo to explore it live.
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTER_LABELS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: filter === key ? "1px solid #2770ef" : "1px solid rgba(255,255,255,0.1)",
                background: filter === key ? "rgba(39,112,239,0.15)" : "rgba(255,255,255,0.04)",
                color: filter === key ? "#93c5fd" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 15 }}>{emoji}</span>
              {label}
              {key !== "all" && (
                <span style={{ fontSize: 11, background: filter === key ? "rgba(39,112,239,0.3)" : "rgba(255,255,255,0.08)", borderRadius: 999, padding: "1px 7px", marginLeft: 2 }}>
                  {key === "spotter" ? demos.filter(d => d.useSpotter).length
                    : key === "rls" ? demos.filter(d => d.rlsRequired).length
                    : demos.filter(d => d.reportDesigner).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Demo grid ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#475569" }}>
            <p style={{ fontSize: 16 }}>No demos match this filter yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {filtered.map((demo) => {
              const preset = demo.themeConfig?.preset ?? "light";
              const gradient = THEME_GRADIENTS[preset] ?? THEME_GRADIENTS.light;
              const accent = THEME_ACCENT[preset] ?? "#2770ef";
              const hasScreenshot = (demo.screenshotUrls?.length ?? 0) > 0;

              return (
                <div
                  key={demo.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(39,112,239,0.4)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(39,112,239,0.15)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  {/* Card hero */}
                  <div style={{ height: 180, overflow: "hidden", position: "relative", background: gradient }}>
                    {hasScreenshot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={demo.screenshotUrls![0]}
                        alt={`${demo.companyName} demo`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                      />
                    ) : (
                      // Placeholder showing mock TS UI with theme colors
                      <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* Mock nav bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,0.2)" }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, opacity: 0.9 }} />
                          <div style={{ height: 6, width: 80, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} />
                          <div style={{ marginLeft: "auto", height: 6, width: 40, borderRadius: 3, background: "rgba(255,255,255,0.15)" }} />
                        </div>
                        {/* Mock chart tiles */}
                        <div style={{ display: "flex", gap: 8, flex: 1 }}>
                          <div style={{ flex: 1, borderRadius: 8, background: "rgba(0,0,0,0.2)", padding: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4 }}>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 50 }}>
                              {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                                <div key={i} style={{ flex: 1, background: accent, opacity: 0.7 + (i % 3) * 0.1, borderRadius: "2px 2px 0 0", height: `${h}%` }} />
                              ))}
                            </div>
                            <div style={{ height: 4, width: "60%", borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
                          </div>
                          <div style={{ flex: 1, borderRadius: 8, background: "rgba(0,0,0,0.2)", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ height: 5, width: "70%", borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
                            <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>$2.4M</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: "6px solid #22c55e" }} />
                              <div style={{ height: 4, width: "40%", borderRadius: 2, background: "rgba(34,197,94,0.5)" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Theme badge */}
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {preset}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>{demo.companyName}</h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {demo.useCase}
                    </p>

                    {/* Feature tags */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                      {demo.useSpotter && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}>🤖 Spotter AI</span>
                      )}
                      {demo.rlsRequired && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}>🛡️ RLS</span>
                      )}
                      {demo.reportDesigner && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "rgba(251,146,60,0.1)", color: "#fdba74", border: "1px solid rgba(251,146,60,0.2)" }}>📊 Reports</span>
                      )}
                    </div>

                    <Link
                      href={`/demo/${demo.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        width: "100%", padding: "9px 16px", borderRadius: 9,
                        background: "rgba(39,112,239,0.12)", color: "#93c5fd",
                        border: "1px solid rgba(39,112,239,0.25)",
                        fontSize: 13, fontWeight: 600, textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                    >
                      View Demo
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>Ready to build your own?</p>
        <p style={{ fontSize: 14, color: "#475569", margin: "0 0 24px" }}>Sign in with your ThoughtSpot GitHub account to create and customize demos.</p>
        <Link
          href="/login"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2770ef", color: "#fff", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          Sign in with GitHub
        </Link>
      </div>
    </div>
  );
}
