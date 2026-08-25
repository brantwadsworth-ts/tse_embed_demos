"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Demo } from "@/lib/demos";
import { Role } from "@/lib/roles";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function tsDisplayName(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0];
  } catch {
    return url;
  }
}

function datasetLabel(dataModel?: Demo["dataModel"]): string | null {
  if (!dataModel) return null;
  const parts = [dataModel.warehouse, dataModel.database, dataModel.schema].filter(Boolean);
  return parts.length ? parts.join(".") : null;
}

const STATUS_STYLES: Record<
  Demo["status"],
  { dot: string; label: string; bg: string; text: string }
> = {
  live:     { dot: "bg-emerald-400",            label: "Live",      bg: "bg-emerald-50", text: "text-emerald-700" },
  pending:  { dot: "bg-amber-400",              label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700"   },
  building: { dot: "bg-blue-400 animate-pulse", label: "Building…", bg: "bg-blue-50",    text: "text-blue-700"    },
  draft:    { dot: "bg-gray-300",               label: "Draft",     bg: "bg-gray-50",    text: "text-gray-500"    },
};

const COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-orange-500", "bg-rose-500", "bg-cyan-500",
];

function Initials({ name, className }: { name: string; className?: string }) {
  const parts = name.trim().split(" ");
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div className={`flex items-center justify-center ${color} ${className ?? ""}`}>
      <span className="font-bold text-white uppercase text-sm">{letters}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Compact Card — grid view
// ────────────────────────────────────────────────────────────

function CompactCard({
  demo,
  selected,
  userRole,
  onClick,
}: {
  demo: Demo;
  selected: boolean;
  userRole: Role;
  onClick: () => void;
}) {
  const router = useRouter();
  const status = STATUS_STYLES[demo.status];
  const instanceName = demo.tsInstance ? tsDisplayName(demo.tsInstance) : null;
  const dataset = datasetLabel(demo.dataModel);
  const canEdit = userRole === "admin" || userRole === "create";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border transition-all bg-white ${
        selected
          ? "border-[#2770ef] shadow-md ring-1 ring-[#2770ef]/20"
          : "border-gray-200 hover:shadow-sm hover:border-gray-300"
      }`}
    >
      {/* Thumbnail — clicking opens the detail panel */}
      <button
        onClick={onClick}
        className="relative h-20 w-full overflow-hidden bg-gray-100 shrink-0 text-left"
        aria-label={`View ${demo.companyName} details`}
      >
        {demo.screenshotUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={demo.screenshotUrls[0]}
            alt={`${demo.companyName} screenshot`}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <Initials name={demo.companyName} className="h-full w-full" />
        )}
        <span
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </button>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1.5">
        <button onClick={onClick} className="text-left">
          <p className="font-semibold text-gray-900 text-sm truncate">{demo.companyName}</p>
        </button>

        {(instanceName || dataset) && (
          <div className="flex flex-wrap gap-1">
            {instanceName && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {instanceName}
              </span>
            )}
            {dataset && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {dataset}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {demo.rlsRequired && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">RLS</span>
          )}
          {demo.useSpotter && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Spotter</span>
          )}
        </div>
      </div>

      {/* Action buttons — always visible on the card */}
      <div className="mt-auto flex gap-1.5 border-t border-gray-100 p-2.5">
        {canEdit && (
          <>
            <button
              onClick={() => router.push(`/demos/${demo.id}/edit`)}
              className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => router.push(`/demos/${demo.id}/fork`)}
              className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fork
            </button>
          </>
        )}
        <a
          href={`/demo/${demo.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 rounded-lg bg-[#2770ef] py-1.5 text-center text-xs font-semibold text-white hover:bg-[#1a56c4] transition-colors"
        >
          View ↗
        </a>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// List Row — list view sidebar
// ────────────────────────────────────────────────────────────

function ListRow({
  demo,
  selected,
  onClick,
}: {
  demo: Demo;
  selected: boolean;
  onClick: () => void;
}) {
  const status = STATUS_STYLES[demo.status];
  const instanceName = demo.tsInstance ? tsDisplayName(demo.tsInstance) : null;
  const dataset = datasetLabel(demo.dataModel);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
        selected
          ? "bg-[#2770ef]/10 text-[#2770ef]"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <span className={`shrink-0 h-2 w-2 rounded-full ${status.dot}`} />
      <span className="font-medium text-sm truncate flex-1">{demo.companyName}</span>
      {instanceName && (
        <span className="shrink-0 text-xs text-gray-400 hidden sm:block">{instanceName}</span>
      )}
      {dataset && (
        <span className="shrink-0 text-xs text-gray-400 hidden md:block truncate max-w-[80px]">
          {dataset}
        </span>
      )}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Detail Panel
// ────────────────────────────────────────────────────────────

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

  const status = STATUS_STYLES[demo.status];
  const instanceName = demo.tsInstance ? tsDisplayName(demo.tsInstance) : null;
  const dataset = datasetLabel(demo.dataModel);
  const canEdit = userRole === "admin" || userRole === "create";

  const promptPreview =
    demo.prompt && demo.prompt.length > 100
      ? demo.prompt.slice(0, 100) + "…"
      : demo.prompt;

  async function triggerBuild() {
    setBuilding(true);
    setBuildError("");
    const res = await fetch(`/api/demos/${demo.id}/build`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setBuildError((body as { error?: string }).error ?? "Build trigger failed.");
      setBuilding(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900 truncate">{demo.companyName}</h2>
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          {demo.website && (
            <a
              href={demo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block text-xs text-[#2770ef] hover:underline truncate"
            >
              {demo.website} ↗
            </a>
          )}
        </div>
        {inDrawer && onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Instance + Dataset */}
        {(instanceName || dataset) && (
          <div className="flex flex-wrap gap-2">
            {instanceName && (
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                ☁ {instanceName}
              </span>
            )}
            {dataset && (
              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                {dataset}
              </span>
            )}
          </div>
        )}

        {/* Use Case */}
        {demo.useCase && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Use Case
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{demo.useCase}</p>
          </div>
        )}

        {/* Liveboards */}
        {demo.theme?.liveboards && demo.theme.liveboards.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Liveboards
            </p>
            <ul className="space-y-1">
              {demo.theme.liveboards.map((lb) => (
                <li key={lb.id} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-gray-800 font-medium">{lb.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feature badges */}
        {(demo.rlsRequired || demo.useSpotter || demo.reportDesigner) && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Features
            </p>
            <div className="flex flex-wrap gap-1.5">
              {demo.rlsRequired && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  RLS
                </span>
              )}
              {demo.useSpotter && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Spotter{demo.spotterName ? `: ${demo.spotterName}` : ""}
                </span>
              )}
              {demo.reportDesigner && (
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                  Report Designer
                </span>
              )}
            </div>
          </div>
        )}

        {/* Prompt */}
        {demo.prompt && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Prompt
            </p>
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed">
              {promptExpanded ? demo.prompt : promptPreview}
              {demo.prompt.length > 100 && (
                <button
                  onClick={() => setPromptExpanded(!promptExpanded)}
                  className="ml-1 text-xs font-medium text-[#2770ef] hover:underline"
                >
                  {promptExpanded ? "show less" : "show more"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sample Questions */}
        {demo.sampleQuestions && demo.sampleQuestions.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Sample Questions
            </p>
            <ul className="space-y-1">
              {demo.sampleQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="shrink-0 text-gray-400">›</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Model */}
        {demo.dataModel && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Data Model
            </p>
            <div className="rounded-lg border border-gray-200 p-3">
              {[demo.dataModel.warehouse, demo.dataModel.database, demo.dataModel.schema].filter(
                Boolean,
              ).length > 0 && (
                <p className="font-mono text-xs text-gray-500 mb-2">
                  {[demo.dataModel.warehouse, demo.dataModel.database, demo.dataModel.schema]
                    .filter(Boolean)
                    .join(".")}
                </p>
              )}
              {demo.dataModel.tables && demo.dataModel.tables.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {demo.dataModel.tables.map((t) => (
                    <span
                      key={t.name}
                      className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owner + Created */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {demo.owner && <span>Owner: @{demo.owner}</span>}
          <span>Created: {demo.createdAt}</span>
        </div>

        {/* Build action */}
        {(demo.status === "pending" || demo.status === "draft") && canEdit && (
          <div>
            {buildError && <p className="mb-2 text-xs text-red-500">{buildError}</p>}
            <button
              onClick={triggerBuild}
              disabled={building}
              className="w-full rounded-xl bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
            >
              {building ? "Triggering build…" : "Build Demo →"}
            </button>
          </div>
        )}

        {demo.status === "building" && (
          <div className="rounded-xl bg-blue-50 px-4 py-2.5 text-center text-xs text-blue-600">
            GitHub Actions workflow running — check the Actions tab for progress
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
        {canEdit && (
          <>
            <button
              onClick={() => router.push(`/demos/${demo.id}/edit`)}
              className="flex-1 min-w-[72px] rounded-xl border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit →
            </button>
            <button
              onClick={() => router.push(`/demos/${demo.id}/fork`)}
              className="flex-1 min-w-[72px] rounded-xl border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fork
            </button>
          </>
        )}
        <a
          href={`/demo/${demo.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[100px] rounded-xl bg-[#2770ef] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
        >
          Go to Demo ↗
        </a>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main DemoLibrary component
// ────────────────────────────────────────────────────────────

export default function DemoLibrary({
  demos,
  userRole,
  currentLogin,
}: {
  demos: Demo[];
  userRole: Role;
  currentLogin: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const gridSelectedDemo = demos.find((d) => d.id === selectedId) ?? null;

  // List view always has something selected — default to first demo
  const listEffectiveId = selectedId ?? demos[0]?.id ?? null;
  const listSelectedDemo = demos.find((d) => d.id === listEffectiveId) ?? null;

  function selectDemo(id: string) {
    setSelectedId(id);
  }

  function closeDrawer() {
    setSelectedId(null);
  }

  // When switching views, reset selection so the drawer doesn't bleed into list
  function switchView(v: "grid" | "list") {
    setSelectedId(null);
    setView(v);
  }

  return (
    <div className="relative">
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Demo Library</h1>
          <span className="text-sm text-gray-400">
            {demos.length} demo{demos.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => switchView("grid")}
              title="Grid view"
              className={`p-2 transition-colors ${
                view === "grid" ? "bg-[#2770ef] text-white" : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              {/* 2×2 grid icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
                <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
                <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
                <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => switchView("list")}
              title="List view"
              className={`p-2 transition-colors ${
                view === "list" ? "bg-[#2770ef] text-white" : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              {/* Horizontal lines icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2.5" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="7"   width="14" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="11.5" width="14" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── Empty state ── */}
      {demos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <p className="text-gray-400">No demos yet.</p>
          {userRole !== "view" && (
            <a
              href="/demos/new"
              className="mt-3 text-sm font-medium text-[#2770ef] hover:underline"
            >
              Create your first demo →
            </a>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {view === "grid" && demos.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <CompactCard
                key={demo.id}
                demo={demo}
                selected={selectedId === demo.id}
                userRole={userRole}
                onClick={() => selectDemo(demo.id)}
              />
            ))}
          </div>

          {/* Backdrop */}
          {gridSelectedDemo && (
            <div
              className="fixed inset-0 z-30 bg-black/20"
              onClick={closeDrawer}
            />
          )}

          {/* Drawer — slides in from right */}
          <div
            className={`fixed inset-y-0 right-0 z-40 flex w-full flex-col sm:w-[400px] shadow-xl transition-transform duration-200 ${
              gridSelectedDemo ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {gridSelectedDemo && (
              <DetailPanel
                demo={gridSelectedDemo}
                userRole={userRole}
                onClose={closeDrawer}
                inDrawer
              />
            )}
          </div>
        </>
      )}

      {/* ── List view ── */}
      {view === "list" && demos.length > 0 && (
        <div
          className="flex overflow-hidden rounded-xl border border-gray-200 bg-white"
          style={{ minHeight: "520px" }}
        >
          {/* Sidebar */}
          <div className="w-[280px] shrink-0 border-r border-gray-200 overflow-y-auto">
            <div className="p-2 space-y-0.5">
              {demos.map((demo) => (
                <ListRow
                  key={demo.id}
                  demo={demo}
                  selected={demo.id === listEffectiveId}
                  onClick={() => selectDemo(demo.id)}
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
            {listSelectedDemo ? (
              <DetailPanel
                demo={listSelectedDemo}
                userRole={userRole}
                inDrawer={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Select a demo
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
