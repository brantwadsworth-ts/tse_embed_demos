import { Demo } from "@/lib/demos";

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
  live:    { dot: "bg-emerald-400", label: "Live",    bg: "bg-emerald-50 text-emerald-700" },
  pending: { dot: "bg-amber-400",   label: "Pending", bg: "bg-amber-50 text-amber-700" },
  draft:   { dot: "bg-gray-300",    label: "Draft",   bg: "bg-gray-50 text-gray-500" },
};

export default function DemoCard({ demo }: { demo: Demo }) {
  const status = STATUS_STYLES[demo.status];

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
          {demo.tsInstance && (
            <p className="truncate">Instance: <span className="text-gray-600">{demo.tsInstance}</span></p>
          )}
          <p>Created: {demo.createdAt}</p>
        </div>
      </div>
    </div>
  );
}
