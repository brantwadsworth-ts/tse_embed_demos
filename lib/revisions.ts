import { list, put } from "@vercel/blob";
import type { Demo } from "./demos";

const MAX_REVISIONS = 50;

export interface RevisionEntry {
  id: string;
  demoId: string;
  timestamp: string;
  author: string;
  summary: string;
  snapshot: Demo;
  changes: FieldChange[];
}

export interface FieldChange {
  field: string;
  label: string;
  from: string;
  to: string;
}

function blobKey(demoId: string) {
  return `revisions/${demoId}.json`;
}

export async function getRevisions(demoId: string): Promise<RevisionEntry[]> {
  try {
    const { blobs } = await list({ prefix: blobKey(demoId) });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as RevisionEntry[];
  } catch {
    return [];
  }
}

export async function addRevision(
  before: Demo,
  after: Demo,
  author: string,
): Promise<RevisionEntry> {
  const changes = diffDemo(before, after);
  const summary = changes.length
    ? changes.map((c) => c.label).join(", ")
    : "Saved (no field changes)";

  const entry: RevisionEntry = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    demoId: after.id,
    timestamp: new Date().toISOString(),
    author,
    summary,
    snapshot: after,
    changes,
  };

  const existing = await getRevisions(after.id);
  const updated = [entry, ...existing].slice(0, MAX_REVISIONS);

  await put(blobKey(after.id), JSON.stringify(updated, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  return entry;
}

// ─── Field diff helpers ────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function shortStr(v: unknown, max = 60): string {
  const s = str(v);
  return s.length > max ? s.slice(0, max) + "…" : s;
}

const WATCHED_FIELDS: { key: keyof Demo; label: string }[] = [
  { key: "companyName",       label: "Company name" },
  { key: "useCase",           label: "Use case" },
  { key: "status",            label: "Status" },
  { key: "tsInstance",        label: "TS instance" },
  { key: "embedType",         label: "Embed type" },
  { key: "useSpotter",        label: "Spotter" },
  { key: "spotterName",       label: "Spotter name" },
  { key: "reportDesigner",    label: "Report Designer" },
  { key: "rlsRequired",       label: "RLS" },
  { key: "trustedAuthEnabled",label: "Trusted auth" },
  { key: "worksheetId",       label: "Worksheet ID" },
  { key: "prompt",            label: "AI prompt" },
  { key: "analystName",       label: "Analyst name" },
];

function diffDemo(before: Demo, after: Demo): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const { key, label } of WATCHED_FIELDS) {
    const from = str(before[key]);
    const to = str(after[key]);
    if (from !== to) {
      changes.push({ field: key, label, from: shortStr(before[key]), to: shortStr(after[key]) });
    }
  }

  // Liveboards
  const lbBefore = JSON.stringify(before.theme?.liveboards ?? []);
  const lbAfter  = JSON.stringify(after.theme?.liveboards ?? []);
  if (lbBefore !== lbAfter) {
    const nb = before.theme?.liveboards?.length ?? 0;
    const na = after.theme?.liveboards?.length ?? 0;
    changes.push({ field: "liveboards", label: "Liveboards", from: `${nb} liveboard${nb !== 1 ? "s" : ""}`, to: `${na} liveboard${na !== 1 ? "s" : ""}` });
  }

  // Demo users
  const duBefore = JSON.stringify(before.demoUsers ?? []);
  const duAfter  = JSON.stringify(after.demoUsers ?? []);
  if (duBefore !== duAfter) {
    const nb = before.demoUsers?.length ?? 0;
    const na = after.demoUsers?.length ?? 0;
    changes.push({ field: "demoUsers", label: "Demo users", from: `${nb} user${nb !== 1 ? "s" : ""}`, to: `${na} user${na !== 1 ? "s" : ""}` });
  }

  // Theme
  const thBefore = JSON.stringify(before.themeConfig ?? {});
  const thAfter  = JSON.stringify(after.themeConfig ?? {});
  if (thBefore !== thAfter) {
    changes.push({ field: "themeConfig", label: "Theme", from: shortStr(before.themeConfig), to: shortStr(after.themeConfig) });
  }

  // RLS rules
  const rlsBefore = JSON.stringify(before.rlsRuleRows ?? []);
  const rlsAfter  = JSON.stringify(after.rlsRuleRows ?? []);
  if (rlsBefore !== rlsAfter) {
    const nb = before.rlsRuleRows?.length ?? 0;
    const na = after.rlsRuleRows?.length ?? 0;
    changes.push({ field: "rlsRuleRows", label: "RLS rules", from: `${nb} rule${nb !== 1 ? "s" : ""}`, to: `${na} rule${na !== 1 ? "s" : ""}` });
  }

  return changes;
}
