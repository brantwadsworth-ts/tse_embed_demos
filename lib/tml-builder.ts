// ─── ThoughtSpot TML Builder ──────────────────────────────────────────────────
// Generates YAML TML strings for Data Model (worksheet) and starter Liveboards.
// ThoughtSpot uses "worksheet" as the TML kind even though the UI calls it
// "Data model" in recent versions.

export type ColKind = "ATTRIBUTE" | "MEASURE" | "DATE";

export interface TmlColumn {
  name: string;         // display name
  dbName: string;       // raw column name in Snowflake
  kind: ColKind;
  dataType: string;     // VARCHAR, NUMBER, FLOAT, DATE, TIMESTAMP_NTZ
}

export interface DataModelParams {
  modelName: string;
  database: string;
  schema: string;
  tableName: string;
  connectionGuid: string;
  connectionName: string;
  columns: TmlColumn[];
}

export interface LiveboardParams {
  liveboardName: string;
  dataModelName: string;
  dataModelGuid: string;
  tableName: string;
  columns: TmlColumn[];
}

// ── Data model (worksheet) TML ────────────────────────────────────────────────

export function buildDataModelTml(p: DataModelParams): string {
  const colLines = p.columns
    .map((c) => {
      const agg = c.kind === "MEASURE" ? "\n      aggregation: SUM" : "";
      const idx =
        c.kind === "DATE"
          ? "\n      index_type: DONT_INDEX"
          : c.kind === "ATTRIBUTE" && c.dataType === "VARCHAR"
            ? "\n      index_type: DONT_INDEX_LARGE"
            : "";
      return `  - name: "${c.name}"
    column_id: "${p.tableName}::${c.dbName}"
    properties:
      column_type: ${c.kind === "DATE" ? "ATTRIBUTE" : c.kind}${agg}${idx}`;
    })
    .join("\n");

  return `worksheet:
  name: "${p.modelName}"
  tables:
  - name: "${p.tableName}"
    id: "${p.tableName}"
    db_table: "${p.tableName}"
    db: "${p.database}"
    schema: "${p.schema}"
    fqn: "${p.connectionGuid}"
    connection:
      name: "${p.connectionName}"
      fqn: "${p.connectionGuid}"
  worksheet_columns:
${colLines}
`;
}

// ── Liveboard TML ─────────────────────────────────────────────────────────────

export function buildLiveboardTml(p: LiveboardParams): string {
  const measures = p.columns.filter((c) => c.kind === "MEASURE");
  const attributes = p.columns.filter(
    (c) => c.kind === "ATTRIBUTE" && c.dataType === "VARCHAR",
  );
  const dateCol = p.columns.find((c) => c.kind === "DATE");

  const vizList: string[] = [];
  let vizIdx = 0;

  // 1. KPI: row count
  vizList.push(`  - id: viz_${vizIdx++}
    answer:
      name: "Total Records"
      tables:
      - id: "${p.dataModelGuid}"
        name: "${p.dataModelName}"
        fqn: "${p.dataModelGuid}"
      search_query: "count"
      chart:
        type: KPI`);

  // 2. Bar: first measure by first attribute
  if (measures.length > 0 && attributes.length > 0) {
    const m = measures[0];
    const a = attributes[0];
    vizList.push(`  - id: viz_${vizIdx++}
    answer:
      name: "${m.name} by ${a.name}"
      tables:
      - id: "${p.dataModelGuid}"
        name: "${p.dataModelName}"
        fqn: "${p.dataModelGuid}"
      search_query: "[${m.name}] by [${a.name}]"
      chart:
        type: BAR`);
  }

  // 3. Line: first measure over time
  if (measures.length > 0 && dateCol) {
    const m = measures[0];
    vizList.push(`  - id: viz_${vizIdx++}
    answer:
      name: "${m.name} over time"
      tables:
      - id: "${p.dataModelGuid}"
        name: "${p.dataModelName}"
        fqn: "${p.dataModelGuid}"
      search_query: "[${m.name}] [${dateCol.name}] by monthly"
      chart:
        type: LINE`);
  }

  // 4. Second attribute breakdown if available
  if (measures.length > 0 && attributes.length > 1) {
    const m = measures[0];
    const a = attributes[1];
    vizList.push(`  - id: viz_${vizIdx++}
    answer:
      name: "${m.name} by ${a.name}"
      tables:
      - id: "${p.dataModelGuid}"
        name: "${p.dataModelName}"
        fqn: "${p.dataModelGuid}"
      search_query: "[${m.name}] by [${a.name}]"
      chart:
        type: COLUMN`);
  }

  return `liveboard:
  name: "${p.liveboardName}"
  visualizations:
${vizList.join("\n")}
`;
}

// ── Snowflake DDL builder ─────────────────────────────────────────────────────

export function buildCreateTableSql(
  database: string,
  schema: string,
  tableName: string,
  columns: TmlColumn[],
): string {
  const colDefs = columns
    .map((c) => `  "${c.dbName}" ${c.dataType}`)
    .join(",\n");
  return `CREATE OR REPLACE TABLE "${database}"."${schema}"."${tableName}" (\n${colDefs}\n)`;
}

// ── Column type inference ─────────────────────────────────────────────────────

export function inferColumns(
  headers: string[],
  rows: string[][],
): TmlColumn[] {
  return headers.map((h, colIdx) => {
    const samples = rows
      .slice(0, 50)
      .map((r) => r[colIdx]?.trim() ?? "")
      .filter(Boolean);

    const dbName = h.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const display = h
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // Date detection
    const dateRe =
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{4}/;
    if (samples.every((v) => !v || dateRe.test(v))) {
      return { name: display, dbName, kind: "DATE", dataType: "TIMESTAMP_NTZ" };
    }

    // Number detection
    const numRe = /^-?[\d,]+(\.\d+)?$/;
    if (samples.length > 0 && samples.every((v) => !v || numRe.test(v))) {
      const hasDecimal = samples.some((v) => v.includes("."));
      return {
        name: display,
        dbName,
        kind: "MEASURE",
        dataType: hasDecimal ? "FLOAT" : "NUMBER(38,0)",
      };
    }

    return { name: display, dbName, kind: "ATTRIBUTE", dataType: "VARCHAR" };
  });
}
