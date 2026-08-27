"use client";

import Link from "next/link";
import { Demo } from "@/lib/demos";

function InitialsHero({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-full w-full items-center justify-center ${color}`}>
      <span className="text-5xl font-bold text-white uppercase">{letters}</span>
    </div>
  );
}

function FeatureRow({
  icon,
  label,
  value,
  name,
  isText,
}: {
  icon: string;
  label: string;
  value: boolean | string | undefined;
  name?: string;
  isText?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <span>{icon}</span>
        {label}
      </span>
      {isText ? (
        <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
          {typeof value === "string" ? value : "—"}
        </span>
      ) : typeof value === "boolean" ? (
        value ? (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {name ? name : "✓ Enabled"}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            —
          </span>
        )
      ) : (
        <span className="text-sm text-gray-800">{value ?? "—"}</span>
      )}
    </div>
  );
}

export default function DemoDetail({
  demo,
  currentLogin,
  isAdmin,
}: {
  demo: Demo;
  currentLogin: string;
  isAdmin?: boolean;
}) {
  const isOwner = !!demo.owner && demo.owner === currentLogin;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Back link */}
        <Link
          href="/demos"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to demos
        </Link>

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden h-64 bg-gray-100 mb-8">
          {demo.screenshotUrls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={demo.screenshotUrls[0]}
              alt={`${demo.companyName} screenshot`}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <InitialsHero name={demo.companyName} />
          )}
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{demo.companyName}</h1>
            <p className="mt-1 text-gray-500">{demo.useCase}</p>
          </div>
          <div className="flex shrink-0 gap-3">
            {isOwner ? (
              <Link
                href={`/demos/${demo.id}/edit`}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit →
              </Link>
            ) : (
              <Link
                href={`/demos/${demo.id}/fork`}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fork this demo
              </Link>
            )}
            <Link
              href={`/demo/${demo.id}`}
              className="rounded-xl bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
            >
              Go to Demo ↗
            </Link>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Features card */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Features</h2>
            <FeatureRow icon="🤖" label="Spotter AI" value={demo.useSpotter} name={demo.spotterName} />
            <FeatureRow icon="📊" label="Report Designer" value={demo.reportDesigner} />
            <FeatureRow icon="🔒" label="Row-Level Security" value={demo.rlsRequired} />
            <FeatureRow icon="📌" label="Embed Type" value={demo.embedType ?? "liveboard"} isText />

            {/* ThoughtSpot Instance — clickable link */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <span>🌐</span>
                ThoughtSpot Instance
              </span>
              {demo.tsInstance ? (
                <a
                  href={demo.tsInstance}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#2770ef] hover:underline truncate max-w-[200px]"
                >
                  {demo.tsInstance}
                </a>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>

            {/* Liveboards */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Liveboards</p>
              {!demo.theme?.liveboards || demo.theme.liveboards.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  ⚠ No liveboards configured — go to Edit to add liveboard IDs.
                </div>
              ) : (
                <ul className="space-y-1">
                  {demo.theme.liveboards.map((lb) => (
                    <li key={lb.id} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-800 font-medium">{lb.name}</span>
                      <span className="font-mono text-xs text-gray-400 truncate max-w-[150px]">{lb.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Prompt card */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900 mb-4">AI Prompt</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {demo.prompt ?? "No prompt configured."}
            </p>
          </section>
        </div>

        {/* Data Model section */}
        {demo.dataModel && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-1">Data Model</h2>

            {/* Warehouse meta row */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
              {demo.dataModel.warehouse && (
                <span>
                  Warehouse:{" "}
                  <strong className="text-gray-800">{demo.dataModel.warehouse}</strong>
                </span>
              )}
              {demo.dataModel.cdw && (
                <span>
                  Compute: <strong className="text-gray-800">{demo.dataModel.cdw}</strong>
                </span>
              )}
              {demo.dataModel.database && (
                <span>
                  Database:{" "}
                  <strong className="text-gray-800">{demo.dataModel.database}</strong>
                </span>
              )}
              {demo.dataModel.schema && (
                <span>
                  Schema: <strong className="text-gray-800">{demo.dataModel.schema}</strong>
                </span>
              )}
            </div>

            {/* Tables grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demo.dataModel.tables?.map((table) => (
                <div
                  key={table.name}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="font-mono text-sm font-semibold text-gray-800 mb-2">
                    {table.name}
                  </p>
                  <ul className="space-y-1">
                    {table.columns.map((col) => (
                      <li key={col} className="text-xs text-gray-500 font-mono">
                        {col}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RLS rules */}
        {demo.rlsRequired && demo.rlsRules && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-2">RLS Configuration</h2>
            <p className="text-sm text-gray-600">{demo.rlsRules}</p>
          </section>
        )}

        {/* Owner footer */}
        <p className="text-xs text-gray-400 text-right">
          Created {demo.createdAt}
          {demo.owner ? ` · owner: @${demo.owner}` : ""}
        </p>
    </main>
  );
}
