"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Demo } from "@/lib/demos";
import { Role } from "@/lib/roles";

// ── Helpers ────────────────────────────────────────────────────────────────

function tsDisplayName(url: string): string {
  try { return new URL(url).hostname.split(".")[0]; } catch { return url; }
}

function datasetLabel(dataModel?: Demo["dataModel"]): string | null {
  if (!dataModel) return null;
  const parts = [dataModel.warehouse, dataModel.database, dataModel.schema].filter(Boolean);
  return parts.length ? parts.join(".") : null;
}

const STATUS: Record<Demo["status"], { dot: string; label: string; bg: string; text: string; border: string }> = {
  live:     { dot: "bg-emerald-400",            label: "Live",      bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  pending:  { dot: "bg-amber-400",              label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  building: { dot: "bg-blue-400 animate-pulse", label: "Building",  bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  draft:    { dot: "bg-gray-300",               label: "Draft",     bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200"    },
};

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f97316","#f43f5e","#06b6d4"];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name: string) {
  const p = name.trim().split(" ");
  return p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2);
}

// ── Avatar thumbnail ───────────────────────────────────────────────────────

function Avatar({ demo, size = 36 }: { demo: Demo; size?: number }) {
  const color = avatarColor(demo.companyName);
  return demo.screenshotUrls?.[0] ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={demo.screenshotUrls[0]}
      alt={demo.companyName}
      style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", objectPosition: "top", flexShrink: 0 }}
    />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.36, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
        {initials(demo.companyName)}
      </span>
    </div>
  );
}

// ── Sidebar list row ───────────────────────────────────────────────────────

function SidebarRow({ demo, selected, onClick }: { demo: Demo; selected: boolean; onClick: () => void }) {
  const s = STATUS[demo.status];
  const cluster = demo.tsInstance ? tsDisplayName(demo.tsInstance) : null;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 14px",
        textAlign: "left",
        border: "none",
        background: selected ? "#eff6ff" : "transparent",
        borderLeft: selected ? "3px solid #2770ef" : "3px solid transparent",
        cursor: "pointer",
        transition: "background 0.12s",
      }}
      className={!selected ? "hover:bg-gray-50" : ""}
    >
      <Avatar demo={demo} size={34} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: selected ? "#1d4ed8" : "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {demo.companyName}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0 }} className={s.dot} />
          <span style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {s.label}{cluster ? ` · ${cluster}` : ""}
          </span>
        </div>
      </div>
      {demo.useSpotter && (
        <span style={{ fontSize: 10, background: "#eff6ff", color: "#3b82f6", borderRadius: 4, padding: "2px 5px", fontWeight: 600, flexShrink: 0 }}>AI</span>
      )}
    </button>
  );
}

// ── Detail panel ───────────────────────────────────────────────────────────

function MetaChip({ label, icon, color = "#6b7280", bg = "#f3f4f6" }: { label: string; icon?: string; color?: string; bg?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 8 }}>{title}</p>
      {children}
    </div>
  );
}

function DetailPanel({
  demo,
  userRole,
  onClose,
  inDrawer,
}: {
  demo: Demo;
  userRole: Role;
  onClose?: () => void;
  inDrawer?: boolean;
}) {
  const router = useRouter();
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState("");
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [scaffolding, setScaffolding] = useState(false);
  const [scaffoldResult, setScaffoldResult] = useState<{ repoUrl: string; repoName: string } | null>(null);
  const [scaffoldError, setScaffoldError] = useState("");

  const s = STATUS[demo.status];
  const cluster = demo.tsInstance ? tsDisplayName(demo.tsInstance) : null;
  const dataset = datasetLabel(demo.dataModel);
  const canEdit = userRole === "admin" || userRole === "create";
  const color = avatarColor(demo.companyName);

  const promptPreview = demo.prompt && demo.prompt.length > 120 ? demo.prompt.slice(0, 120) + "…" : demo.prompt;

  async function triggerBuild() {
    setBuilding(true); setBuildError("");
    const res = await fetch(`/api/demos/${demo.id}/build`, { method: "POST" });
    if (res.ok) { router.refresh(); }
    else { const b = await res.json().catch(() => ({})); setBuildError((b as { error?: string }).error ?? "Build failed."); setBuilding(false); }
  }

  async function scaffoldRepo() {
    setScaffolding(true); setScaffoldError(""); setScaffoldResult(null);
    const res = await fetch("/api/admin/scaffold", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ demoId: demo.id }) });
    const body = await res.json().catch(() => ({})) as { ok?: boolean; repoUrl?: string; repoName?: string; error?: string };
    if (body.ok && body.repoUrl) setScaffoldResult({ repoUrl: body.repoUrl, repoName: body.repoName ?? "" });
    else setScaffoldError(body.error ?? "Scaffold failed.");
    setScaffolding(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>

      {/* ── Hero ── */}
      <div style={{ position: "relative", height: 168, flexShrink: 0, overflow: "hidden" }}>
        {demo.screenshotUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={demo.screenshotUrls[0]} alt={demo.companyName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${color}22 0%, ${color}55 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>{initials(demo.companyName)}</span>
            </div>
          </div>
        )}
        {/* Status badge */}
        <span style={{ position: "absolute", top: 10, left: 12, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 700 }} className={s.text}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0 }} className={s.dot} />
          {s.label}
        </span>
        {inDrawer && onClose && (
          <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#374151" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>

      {/* ── Name + meta ── */}
      <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.2 }}>{demo.companyName}</h2>
          <a
            href={`/demo/${demo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0, background: "#2770ef", color: "#fff", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
            className="hover:bg-[#1a56c4] transition-colors"
          >
            Open Demo ↗
          </a>
        </div>
        {demo.website && (
          <a href={demo.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2770ef", textDecoration: "none", marginTop: 4, display: "block" }} className="hover:underline">
            {demo.website.replace(/^https?:\/\//, "")} ↗
          </a>
        )}

        {/* Chips row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
          {cluster && <MetaChip icon="☁" label={cluster} />}
          {dataset && <MetaChip icon="🗄" label={dataset} bg="#eff6ff" color="#2563eb" />}
          {demo.useSpotter && <MetaChip icon="🤖" label={demo.spotterName ?? "Spotter AI"} bg="#f0f7ff" color="#2563eb" />}
          {demo.reportDesigner && <MetaChip icon="📊" label="Report Designer" bg="#fff7ed" color="#c2410c" />}
          {demo.rlsRequired && <MetaChip icon="🔒" label="RLS" bg="#f5f3ff" color="#7c3aed" />}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 18 }}>

        {demo.useCase && (
          <Section title="Use Case">
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{demo.useCase}</p>
          </Section>
        )}

        {demo.theme?.liveboards && demo.theme.liveboards.length > 0 && (
          <Section title="Liveboards">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {demo.theme.liveboards.map((lb) => (
                <div key={lb.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lb.name}</span>
                  <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{lb.id.slice(0, 8)}…</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {demo.prompt && (
          <Section title="AI Prompt">
            <div style={{ background: "#f8faff", border: "1px solid #e0eaff", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
              {promptExpanded ? demo.prompt : promptPreview}
              {demo.prompt.length > 120 && (
                <button onClick={() => setPromptExpanded(!promptExpanded)} style={{ marginLeft: 4, fontSize: 11, color: "#2770ef", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  {promptExpanded ? "show less" : "show more"}
                </button>
              )}
            </div>
          </Section>
        )}

        {demo.sampleQuestions && demo.sampleQuestions.length > 0 && (
          <Section title="Sample Questions">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {demo.sampleQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12, color: "#374151" }}>
                  <span style={{ color: "#2770ef", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
                  {q}
                </div>
              ))}
            </div>
          </Section>
        )}

        {demo.dataModel && (demo.dataModel.tables?.length ?? 0) > 0 && (
          <Section title="Data Model">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {demo.dataModel.tables?.map((t) => (
                <span key={t.name} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 8px", fontFamily: "monospace", fontSize: 11, color: "#374151" }}>
                  {t.name}
                  {t.columns.length > 0 && <span style={{ color: "#9ca3af", marginLeft: 4 }}>({t.columns.length})</span>}
                </span>
              ))}
            </div>
          </Section>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "#9ca3af" }}>
          {demo.owner && <span>@{demo.owner}</span>}
          {demo.createdAt && <span>Created {demo.createdAt}</span>}
        </div>

        {buildError && <p style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "8px 12px" }}>{buildError}</p>}

        {(demo.status === "pending" || demo.status === "draft") && canEdit && (
          <button onClick={triggerBuild} disabled={building} style={{ width: "100%", borderRadius: 10, background: "#2770ef", color: "#fff", border: "none", padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: building ? "not-allowed" : "pointer", opacity: building ? 0.6 : 1 }}>
            {building ? "Triggering build…" : "Build Demo →"}
          </button>
        )}
        {demo.status === "building" && (
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#2770ef", textAlign: "center" }}>
            GitHub Actions running — check the Actions tab
          </div>
        )}

        {(scaffoldResult || scaffoldError) && (
          <div style={{ borderRadius: 10, padding: "10px 14px", fontSize: 12, ...(scaffoldResult ? { background: "#f0fdf4", color: "#15803d" } : { background: "#fef2f2", color: "#dc2626" }) }}>
            {scaffoldResult ? <>Repo: <a href={scaffoldResult.repoUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "inherit" }}>{scaffoldResult.repoName} ↗</a></> : scaffoldError}
          </div>
        )}
      </div>

      {/* ── Action footer ── */}
      {canEdit && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 14px", display: "flex", gap: 6, flexShrink: 0, background: "#fafafa" }}>
          <button
            onClick={() => router.push(`/demos/${demo.id}/edit`)}
            style={{ flex: 1, borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#374151", cursor: "pointer" }}
            className="hover:bg-gray-50 transition-colors"
          >
            Edit →
          </button>
          <button
            onClick={() => router.push(`/demos/${demo.id}/fork`)}
            style={{ flex: 1, borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#374151", cursor: "pointer" }}
            className="hover:bg-gray-50 transition-colors"
          >
            Fork
          </button>
          <button
            onClick={scaffoldRepo}
            disabled={scaffolding}
            title="Create standalone GitHub repo"
            style={{ flex: 1, borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#374151", cursor: scaffolding ? "not-allowed" : "pointer", opacity: scaffolding ? 0.5 : 1 }}
            className="hover:bg-gray-50 transition-colors"
          >
            {scaffolding ? "…" : "GitHub ↗"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Compact grid card ──────────────────────────────────────────────────────

function GridCard({ demo, selected, userRole, onClick }: { demo: Demo; selected: boolean; userRole: Role; onClick: () => void }) {
  const router = useRouter();
  const s = STATUS[demo.status];
  const canEdit = userRole === "admin" || userRole === "create";
  const color = avatarColor(demo.companyName);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        border: selected ? "2px solid #2770ef" : "1px solid #e5e7eb",
        background: "#fff",
        overflow: "hidden",
        boxShadow: selected ? "0 0 0 3px #2770ef22" : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
    >
      {/* Thumbnail */}
      <button onClick={onClick} style={{ position: "relative", height: 100, overflow: "hidden", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
        {demo.screenshotUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={demo.screenshotUrls[0]} alt={demo.companyName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${color}22, ${color}55)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, textTransform: "uppercase" }}>{initials(demo.companyName)}</span>
            </div>
          </div>
        )}
        <span style={{ position: "absolute", top: 7, right: 7, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.92)", borderRadius: 20, padding: "2px 7px", fontSize: 10, fontWeight: 700 }} className={s.text}>
          <span style={{ width: 5, height: 5, borderRadius: "50%" }} className={s.dot} />
          {s.label}
        </span>
      </button>

      {/* Body */}
      <div style={{ padding: "10px 12px", flex: 1 }}>
        <button onClick={onClick} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{demo.companyName}</p>
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {demo.tsInstance && <MetaChip label={tsDisplayName(demo.tsInstance)} />}
          {demo.useSpotter && <MetaChip icon="🤖" label="AI" bg="#eff6ff" color="#2563eb" />}
          {demo.rlsRequired && <MetaChip icon="🔒" label="RLS" bg="#f5f3ff" color="#7c3aed" />}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 5, borderTop: "1px solid #f3f4f6", padding: "8px 10px", background: "#fafafa" }}>
        {canEdit && (
          <>
            <button onClick={() => router.push(`/demos/${demo.id}/edit`)} style={{ flex: 1, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", padding: "5px 0", fontSize: 11, fontWeight: 700, color: "#374151", cursor: "pointer" }} className="hover:bg-gray-50">Edit</button>
            <button onClick={() => router.push(`/demos/${demo.id}/fork`)} style={{ flex: 1, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", padding: "5px 0", fontSize: 11, fontWeight: 700, color: "#374151", cursor: "pointer" }} className="hover:bg-gray-50">Fork</button>
          </>
        )}
        <a href={`/demo/${demo.id}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, borderRadius: 8, background: "#2770ef", padding: "5px 0", fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none", textAlign: "center" }} className="hover:bg-[#1a56c4]">View ↗</a>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function DemoLibrary({ demos, userRole, currentLogin }: { demos: Demo[]; userRole: Role; currentLogin: string }) {
  const [view, setView] = useState<"grid" | "list">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = demos.filter((d) =>
    !search.trim() ||
    d.companyName.toLowerCase().includes(search.toLowerCase()) ||
    d.useCase?.toLowerCase().includes(search.toLowerCase()),
  );

  const listEffectiveId = selectedId ?? filtered[0]?.id ?? null;
  const listSelected = filtered.find((d) => d.id === listEffectiveId) ?? null;
  const gridSelected = filtered.find((d) => d.id === selectedId) ?? null;

  function switchView(v: "grid" | "list") { setSelectedId(null); setView(v); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Demo Library</h1>
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{demos.length} demo{demos.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Filter demos…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
              style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, borderRadius: 9, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, width: 180, outline: "none", color: "#374151" }}
            />
          </div>
          {/* View toggle */}
          <div style={{ display: "flex", borderRadius: 9, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <button
              onClick={() => switchView("grid")}
              title="Grid view"
              style={{ padding: "6px 9px", border: "none", cursor: "pointer", background: view === "grid" ? "#2770ef" : "#fff", color: view === "grid" ? "#fff" : "#9ca3af", transition: "background 0.15s" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/></svg>
            </button>
            <button
              onClick={() => switchView("list")}
              title="List view"
              style={{ padding: "6px 9px", border: "none", borderLeft: "1px solid #e5e7eb", cursor: "pointer", background: view === "list" ? "#2770ef" : "#fff", color: view === "list" ? "#fff" : "#9ca3af", transition: "background 0.15s" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="2.5" width="14" height="2" rx="1" fill="currentColor"/><rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/><rect x="1" y="11.5" width="14" height="2" rx="1" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty ── */}
      {demos.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #e5e7eb", borderRadius: 16, padding: "64px 24px", textAlign: "center" }}>
          <p style={{ color: "#9ca3af", margin: 0 }}>No demos yet.</p>
          {userRole !== "view" && <a href="/demos/new" style={{ marginTop: 10, fontSize: 13, color: "#2770ef", textDecoration: "none", fontWeight: 600 }} className="hover:underline">Create your first demo →</a>}
        </div>
      )}

      {filtered.length === 0 && demos.length > 0 && (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
          No demos match &ldquo;{search}&rdquo;
        </div>
      )}

      {/* ── Grid ── */}
      {view === "grid" && filtered.length > 0 && (
        <>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {filtered.map((d) => (
              <GridCard key={d.id} demo={d} selected={selectedId === d.id} userRole={userRole} onClick={() => setSelectedId(d.id)} />
            ))}
          </div>
          {gridSelected && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.2)" }} onClick={() => setSelectedId(null)} />
              <div style={{ position: "fixed", inset: "57px 0 0 auto", zIndex: 40, width: 400, boxShadow: "-4px 0 32px rgba(0,0,0,0.12)" }}>
                <DetailPanel demo={gridSelected} userRole={userRole} onClose={() => setSelectedId(null)} inDrawer />
              </div>
            </>
          )}
        </>
      )}

      {/* ── List ── */}
      {view === "list" && filtered.length > 0 && (
        <div style={{ display: "flex", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", minHeight: 560, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          {/* Sidebar */}
          <div style={{ width: 264, flexShrink: 0, borderRight: "1px solid #f3f4f6", overflowY: "auto", background: "#fafafa" }}>
            <div style={{ padding: "10px 0" }}>
              {filtered.map((d) => (
                <SidebarRow key={d.id} demo={d} selected={d.id === listEffectiveId} onClick={() => setSelectedId(d.id)} />
              ))}
            </div>
          </div>
          {/* Detail */}
          <div style={{ flex: 1, overflow: "hidden", height: "calc(100vh - 160px)" }}>
            {listSelected
              ? <DetailPanel demo={listSelected} userRole={userRole} inDrawer={false} />
              : <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>Select a demo</div>
            }
          </div>
        </div>
      )}
    </div>
  );
}
