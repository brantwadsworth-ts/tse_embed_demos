"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { TmlColumn, inferColumns } from "@/lib/tml-builder";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DatasetResult {
  database: string;
  schema: string;
  tableName: string;
  rowCount: number;
  columns: TmlColumn[];
  dataModelId: string;
  liveboardId: string | null;
  tsHost: string;
  tsUsername: string;
}

interface Props {
  onComplete: (result: DatasetResult) => void;
  defaultTsHost?: string;
  defaultTsUsername?: string;
}

type Phase = "upload" | "columns" | "destinations" | "creating" | "done";

interface Connection {
  id: string;
  name: string;
  type: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inp =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DatasetStep({ onComplete, defaultTsHost = "", defaultTsUsername = "" }: Props) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [csvContent, setCsvContent] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Column editor state
  const [columns, setColumns] = useState<TmlColumn[]>([]);

  // Destination state
  const [database, setDatabase] = useState("SE_DEMO_DB");
  const [schema, setSchema] = useState("");
  const [tableName, setTableName] = useState("");
  const [modelName, setModelName] = useState("");
  const [liveboardName, setLiveboardName] = useState("");

  // TS state
  const [tsHost, setTsHost] = useState(defaultTsHost);
  const [tsUsername, setTsUsername] = useState(defaultTsUsername);
  const [tsPassword, setTsPassword] = useState("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionId, setConnectionId] = useState("");
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Result
  const [result, setResult] = useState<DatasetResult | null>(null);

  // Drag-over state
  const [dragOver, setDragOver] = useState(false);

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
      Papa.parse<string[]>(text, {
        skipEmptyLines: true,
        complete: ({ data }) => {
          if (data.length < 2) { setError("File must have a header row and data rows."); return; }
          const [hdrs, ...rows] = data;
          setHeaders(hdrs);
          setPreviewRows(rows.slice(0, 8));
          setTotalRows(rows.length);
          setColumns(inferColumns(hdrs, rows as string[][]));
          setPhase("columns");
          setError(null);
        },
        error: (err: { message: string }) => setError(`Parse error: ${err.message}`),
      });
    };
    reader.readAsText(file);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  async function loadConnections() {
    setLoadingConnections(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ts/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tsHost, tsUsername, tsPassword }),
      });
      const data = await res.json() as { connections?: Connection[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load connections");
      setConnections(data.connections ?? []);
      if (data.connections?.length === 1) setConnectionId(data.connections[0].id);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingConnections(false);
    }
  }

  async function handleCreate() {
    if (!connectionId) { setError("Select a Snowflake connection first."); return; }
    if (!schema || !tableName) { setError("Schema and table name are required."); return; }
    setPhase("creating");
    setError(null);

    // Step 1: Upload CSV to Snowflake
    const uploadRes = await fetch("/api/admin/snowflake/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvContent, database, schema, tableName, columns }),
    });
    const uploadData = await uploadRes.json() as { ok?: boolean; error?: string; rowCount?: number };
    if (!uploadRes.ok) {
      setError(`Snowflake upload failed: ${uploadData.error}`);
      setPhase("destinations");
      return;
    }

    // Step 2: Create TS data model + liveboard
    const selectedConn = connections.find((c) => c.id === connectionId);
    const setupRes = await fetch("/api/admin/ts/setup-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tsHost,
        tsUsername,
        tsPassword,
        connectionId,
        connectionName: selectedConn?.name ?? "Snowflake Connection",
        database,
        schema,
        tableName,
        modelName: modelName || tableName,
        liveboardName: liveboardName || `${tableName} Dashboard`,
        columns,
      }),
    });
    const setupData = await setupRes.json() as {
      ok?: string | boolean;
      dataModelId?: string;
      liveboardId?: string | null;
      liveboardError?: string;
      error?: string;
    };
    if (!setupRes.ok) {
      setError(`TS setup failed: ${setupData.error}`);
      setPhase("destinations");
      return;
    }

    const finalResult: DatasetResult = {
      database,
      schema,
      tableName,
      rowCount: uploadData.rowCount ?? 0,
      columns,
      dataModelId: setupData.dataModelId ?? "",
      liveboardId: setupData.liveboardId ?? null,
      tsHost,
      tsUsername,
    };
    setResult(finalResult);
    setPhase("done");
    onComplete(finalResult);
  }

  // ── Phase: upload ─────────────────────────────────────────────────────────────

  if (phase === "upload") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Upload a CSV to create a Snowflake table and ThoughtSpot data model automatically.
          The builder will pre-fill your TS IDs when done.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
            dragOver
              ? "border-[#2770ef] bg-[#2770ef]/5"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <div className="mb-3 text-4xl">📂</div>
          <p className="text-sm font-medium text-gray-700">
            Drop a CSV here or <span className="text-[#2770ef]">browse</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">CSV format, any size</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <p className="text-xs text-gray-400 text-center">
          No dataset yet? Skip this step and add your ThoughtSpot IDs manually.
        </p>
      </div>
    );
  }

  // ── Phase: columns ────────────────────────────────────────────────────────────

  if (phase === "columns") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
            <p className="text-xs text-gray-400">{totalRows} rows · {headers.length} columns</p>
          </div>
          <button
            type="button"
            onClick={() => { setPhase("upload"); setCsvContent(""); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Change file
          </button>
        </div>

        {/* Preview table */}
        <div className="overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-32 truncate">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Column type editor */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Column types (edit if auto-detection was wrong)
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {columns.map((col, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <span className="flex-1 truncate text-sm font-medium text-gray-800">{col.name}</span>
                <span className="font-mono text-xs text-gray-400">{col.dbName}</span>
                <select
                  value={col.kind}
                  onChange={(e) => {
                    const k = e.target.value as TmlColumn["kind"];
                    const dt = k === "MEASURE" ? "FLOAT" : k === "DATE" ? "TIMESTAMP_NTZ" : "VARCHAR";
                    setColumns((prev) => prev.map((c, ci) => ci === i ? { ...c, kind: k, dataType: dt } : c));
                  }}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value="ATTRIBUTE">Attribute</option>
                  <option value="MEASURE">Measure</option>
                  <option value="DATE">Date</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPhase("destinations")}
          className="w-full rounded-xl bg-[#2770ef] py-2.5 text-sm font-semibold text-white hover:bg-[#1d5fd4]"
        >
          Looks good → Set destinations
        </button>
      </div>
    );
  }

  // ── Phase: destinations ───────────────────────────────────────────────────────

  if (phase === "destinations") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Snowflake destination (SE Demo)</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Database" required>
              <input className={inp} value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="SE_DEMO_DB" />
            </Field>
            <Field label="Schema" required hint="Will be created if it doesn't exist">
              <input className={inp} value={schema} onChange={(e) => setSchema(e.target.value)} placeholder="DEMO_ACME" />
            </Field>
            <Field label="Table name" required>
              <input className={inp} value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="SALES_DATA" />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">ThoughtSpot</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ThoughtSpot host" required>
              <input className={inp} value={tsHost} onChange={(e) => setTsHost(e.target.value)} placeholder="https://your-co.thoughtspot.cloud" />
            </Field>
            <Field label="TS username">
              <input className={inp} value={tsUsername} onChange={(e) => setTsUsername(e.target.value)} placeholder="admin@company.com" />
            </Field>
            <Field label="TS password" hint="Only used to fetch connections — not stored">
              <input type="password" className={inp} value={tsPassword} onChange={(e) => setTsPassword(e.target.value)} />
            </Field>
          </div>
          <button
            type="button"
            onClick={loadConnections}
            disabled={!tsHost || loadingConnections}
            className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loadingConnections ? "Loading…" : "Load Snowflake connections →"}
          </button>
          {connections.length > 0 && (
            <Field label="Select connection" required>
              <select className={inp} value={connectionId} onChange={(e) => setConnectionId(e.target.value)}>
                <option value="">— choose —</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Data model name" hint="Shown in ThoughtSpot">
            <input className={inp} value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder={tableName || "My Data Model"} />
          </Field>
          <Field label="Starter liveboard name">
            <input className={inp} value={liveboardName} onChange={(e) => setLiveboardName(e.target.value)} placeholder={tableName ? `${tableName} Dashboard` : "Starter Dashboard"} />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPhase("columns")}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!schema || !tableName || !connectionId}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Upload to Snowflake + Create TS Model →
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: creating ───────────────────────────────────────────────────────────

  if (phase === "creating") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2770ef] border-t-transparent" />
        <p className="text-sm font-medium text-gray-700">
          Uploading to Snowflake and creating ThoughtSpot model…
        </p>
        <p className="text-xs text-gray-400">This takes 15–60 seconds</p>
      </div>
    );
  }

  // ── Phase: done ───────────────────────────────────────────────────────────────

  if (phase === "done" && result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Dataset created successfully</p>
            <p className="text-xs text-emerald-600">{result.rowCount} rows uploaded</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {[
            ["Snowflake table", `${result.database}.${result.schema}.${result.tableName}`],
            ["Data model ID", result.dataModelId],
            ["Liveboard ID", result.liveboardId ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex border-b border-gray-100 last:border-0">
              <div className="w-40 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500">{k}</div>
              <div className="px-4 py-3 font-mono text-xs text-gray-900 break-all">{v}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          These IDs have been pre-filled into the wizard. Continue to the next step.
        </p>
      </div>
    );
  }

  return null;
}
