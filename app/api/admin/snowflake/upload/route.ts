import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import { buildCreateTableSql, inferColumns, TmlColumn } from "@/lib/tml-builder";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import snowflake from "snowflake-sdk";

function getSnowflakeConnection(database: string, schema: string) {
  const account = process.env.SNOWFLAKE_ACCOUNT ?? "THOUGHTSPOT_PARTNER";
  const username = process.env.SNOWFLAKE_USER ?? "SE_DEMO_KP";
  const role = process.env.SNOWFLAKE_ROLE ?? "SE_ROLE";
  const warehouse = process.env.SNOWFLAKE_WAREHOUSE ?? "SE_DEMO_WH";

  // Key pair auth: prefer env var content, fall back to file
  let privateKey: string | undefined;
  const keyEnv = process.env.SNOWFLAKE_PRIVATE_KEY;
  if (keyEnv) {
    privateKey = keyEnv.replace(/\\n/g, "\n");
  } else {
    const keyPath =
      process.env.SNOWFLAKE_PRIVATE_KEY_PATH ??
      join(homedir(), ".snowflake", "rsa_key.p8");
    try {
      privateKey = readFileSync(keyPath, "utf8");
    } catch {
      throw new Error(
        `Snowflake private key not found at ${keyPath}. Set SNOWFLAKE_PRIVATE_KEY or SNOWFLAKE_PRIVATE_KEY_PATH env var.`,
      );
    }
  }

  return snowflake.createConnection({
    account,
    username,
    privateKey,
    authenticator: "SNOWFLAKE_JWT",
    role,
    warehouse,
    database,
    schema,
  });
}

function connectAsync(conn: ReturnType<typeof snowflake.createConnection>): Promise<void> {
  return new Promise((res, rej) =>
    conn.connect((err) => (err ? rej(err) : res())),
  );
}

function execAsync(
  conn: ReturnType<typeof snowflake.createConnection>,
  sql: string,
  binds?: unknown[],
): Promise<unknown[]> {
  return new Promise((res, rej) =>
    conn.execute({
      sqlText: sql,
      binds: binds as snowflake.Binds,
      complete: (err, _stmt, rows) => (err ? rej(err) : res(rows ?? [])),
    }),
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getRole(login);
  if (role !== "admin" && role !== "create") {
    return NextResponse.json({ error: "Admin or create role required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    csvContent: string;
    database: string;
    schema: string;
    tableName: string;
    columns?: TmlColumn[];
  };

  const { csvContent, database, schema, tableName } = body;
  if (!csvContent || !database || !schema || !tableName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── Parse CSV ────────────────────────────────────────────────────────────────
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
  }

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        result.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  const headers = parseCsvLine(lines[0]);
  const dataRows = lines.slice(1).map((l) => parseCsvLine(l));
  const columns = body.columns ?? inferColumns(headers, dataRows);

  // ── Connect to Snowflake ─────────────────────────────────────────────────────
  const conn = getSnowflakeConnection(database, schema);
  try {
    await connectAsync(conn);
  } catch (e) {
    return NextResponse.json(
      { error: `Snowflake connection failed: ${String(e)}` },
      { status: 502 },
    );
  }

  try {
    // Ensure schema exists
    await execAsync(conn, `CREATE SCHEMA IF NOT EXISTS "${database}"."${schema}"`);

    // Create table
    const ddl = buildCreateTableSql(database, schema, tableName, columns);
    await execAsync(conn, ddl);

    // Insert data in batches of 500
    const BATCH = 500;
    const placeholders = columns.map(() => "?").join(", ");
    const insertSql = `INSERT INTO "${database}"."${schema}"."${tableName}" VALUES (${placeholders})`;

    for (let i = 0; i < dataRows.length; i += BATCH) {
      const batch = dataRows.slice(i, i + BATCH);
      for (const row of batch) {
        const values = columns.map((c, ci) => {
          const raw = row[ci]?.trim() ?? null;
          if (!raw) return null;
          if (c.kind === "MEASURE") return Number(raw.replace(/,/g, "")) || null;
          return raw;
        });
        await execAsync(conn, insertSql, values);
      }
    }

    return NextResponse.json({
      ok: true,
      database,
      schema,
      tableName,
      rowCount: dataRows.length,
      columns,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Snowflake error: ${String(e)}` },
      { status: 500 },
    );
  } finally {
    conn.destroy(() => {});
  }
}
