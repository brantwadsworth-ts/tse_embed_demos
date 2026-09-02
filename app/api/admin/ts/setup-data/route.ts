import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import { getBearerToken } from "@/lib/tsAuth";
import {
  buildDataModelTml,
  buildLiveboardTml,
  TmlColumn,
} from "@/lib/tml-builder";

async function importTml(
  host: string,
  token: string,
  tmlContent: string,
  kind: string,
): Promise<string> {
  const body = {
    metadata_tmls: [{ metadata_type: kind, content: tmlContent }],
    import_policy: "PARTIAL",
    create_new: true,
  };

  const res = await fetch(`${host}/api/rest/2.0/metadata/tml/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`TML import failed (${res.status}): ${text}`);

  const result = JSON.parse(text) as Array<{
    response: { header: { object_id: string }; status: { status_code: string } };
  }>;

  const first = result[0];
  if (!first?.response?.header?.object_id) {
    throw new Error(`TML import returned no object_id: ${text}`);
  }
  return first.response.header.object_id;
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
    tsHost: string;
    tsUsername?: string;
    tsPassword?: string;
    connectionId: string;
    connectionName: string;
    database: string;
    schema: string;
    tableName: string;
    modelName: string;
    liveboardName: string;
    columns: TmlColumn[];
  };

  const {
    tsHost,
    tsUsername,
    tsPassword,
    connectionId,
    connectionName,
    database,
    schema,
    tableName,
    modelName,
    liveboardName,
    columns,
  } = body;

  if (!tsHost || !connectionId || !database || !schema || !tableName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const host = tsHost.startsWith("http") ? tsHost : `https://${tsHost}`;
  const token = await getBearerToken(host, tsUsername ?? "", tsPassword).catch(() => null);
  if (!token) {
    return NextResponse.json(
      { error: "Could not authenticate with ThoughtSpot." },
      { status: 401 },
    );
  }

  // ── Create data model ────────────────────────────────────────────────────────
  const dataModelTml = buildDataModelTml({
    modelName,
    database,
    schema,
    tableName,
    connectionGuid: connectionId,
    connectionName,
    columns,
  });

  let dataModelId: string;
  try {
    dataModelId = await importTml(host, token, dataModelTml, "WORKSHEET");
  } catch (e) {
    return NextResponse.json(
      { error: `Data model creation failed: ${String(e)}` },
      { status: 500 },
    );
  }

  // ── Create liveboard ─────────────────────────────────────────────────────────
  const liveboardTml = buildLiveboardTml({
    liveboardName,
    dataModelName: modelName,
    dataModelGuid: dataModelId,
    tableName,
    columns,
  });

  let liveboardId: string;
  try {
    liveboardId = await importTml(host, token, liveboardTml, "LIVEBOARD");
  } catch (e) {
    // Liveboard failure is non-fatal — return partial success with data model ID
    return NextResponse.json({
      ok: "partial",
      dataModelId,
      liveboardId: null,
      liveboardError: String(e),
    });
  }

  return NextResponse.json({ ok: true, dataModelId, liveboardId });
}
