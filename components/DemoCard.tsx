"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Demo } from "@/lib/demos";
import { Role } from "@/lib/roles";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);

  const colors = [
    "bg-blue-500", "bg-violet-500", "bg-emerald-500",
    "bg-orange-500", "bg-rose-500", "bg-cyan-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={`flex h-full w-full items-center justify-center ${color}`}>
      <span className="text-3xl font-bold text-white uppercase">{letters}</span>
    </div>
  );
}

const STATUS_STYLES: Record<Demo["status"], { dot: string; label: string; bg: string }> = {
  live:     { dot: "bg-emerald-400",            label: "Live",      bg: "bg-emerald-50 text-emerald-700" },
  pending:  { dot: "bg-amber-400",              label: "Pending",   bg: "bg-amber-50 text-amber-700" },
  building: { dot: "bg-blue-400 animate-pulse", label: "Building…", bg: "bg-blue-50 text-blue-700" },
  draft:    { dot: "bg-gray-300",               label: "Draft",     bg: "bg-gray-50 text-gray-500" },
  failed:   { dot: "bg-red-400",                label: "Failed",    bg: "bg-red-50 text-red-700" },
};

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
  const db = dataModel.database;
  const sc = dataModel.schema;
  if (db && sc) return `${db}.${sc}`;
  if (db) return db;
  if (sc) return sc;
  return null;
}

export default function DemoCard({
  demo,
  userRole,
}: {
  demo: Demo;
  userRole?: Role;
}) {
  const router = useRouter();
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState("");
  const status = STATUS_STYLES[demo.status];

  const canEdit = !userRole || userRole === "admin" || userRole === "create";

  async function triggerBuild() {
    setBuilding(true);
    setBuildError("");
    const res = await fetch(`/api/demos/${demo.id}/build`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setBuildError(body.error ?? "Build trigger failed.");
      setBuilding(false);
    }
  }

  const instanceName = demo.tsInstance ? tsDisplayName(demo.tsInstance) : null;
  const dataset = datasetLabel(demo.dataModel);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        {demo.screenshotUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={demo.screenshotUrls[0]}
            alt={`${demo.companyName} screenshot`}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <Initials name={demo.companyName} />
        )}
        <span className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900">{demo.companyName}</h3>
            {demo.website && (
              <a
                href={demo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs text-[#2770ef] hover:underline"
              >
                ↗ site
              </a>
            )}
          </div>
          <p className="mt-1.5 line-clamp-3 text-sm text-gray-500">{demo.useCase}</p>
        </div>

        {/* TS Instance + Dataset badges */}
        {(instanceName || dataset) && (
          <div className="flex flex-wrap gap-1.5">
            {instanceName && (
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                ☁ {instanceName}
              </span>
            )}
            {dataset && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {dataset}
              </span>
            )}
          </div>
        )}

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1.5">
          {demo.rlsRequired && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">RLS</span>
          )}
          {demo.useSpotter && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              Spotter{demo.spotterName ? `: ${demo.spotterName}` : ""}
            </span>
          )}
          {demo.reportDesigner && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">Report Designer</span>
          )}
        </div>

        {/* Meta */}
        <div className="mt-auto space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-400">
          {demo.branch && (
            <p>Branch: <span className="font-mono text-gray-600">{demo.branch}</span></p>
          )}
          <p>Created: {demo.createdAt}</p>
        </div>

        {/* Build button — only for pending demos */}
        {(demo.status === "pending" || demo.status === "draft") && (
          <div className="mt-4">
            {buildError && (
              <p className="mb-2 text-xs text-red-500">{buildError}</p>
            )}
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
          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-2.5 text-center text-xs text-blue-600">
            GitHub Actions workflow running — check the Actions tab for progress
          </div>
        )}

        {demo.status === "live" && (
          <div className="mt-4 flex gap-2">
            {canEdit && (
              <Link
                href={`/demos/${demo.id}`}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
            )}
            <Link
              href={`/demo/${demo.id}`}
              className="flex-1 rounded-xl bg-[#2770ef] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
            >
              Go to Demo ↗
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
