import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/roles";
import { getBearerToken } from "@/lib/tsAuth";
import { getTsSecret } from "@/lib/tsSecrets";

export interface TsAsset {
  id: string;
  name: string;
}

export interface TsConnectResult {
  liveboards: TsAsset[];
  worksheets: TsAsset[];
  authMethod: "trusted" | "password";
}


async function searchMetadata(
  instance: string,
  token: string,
  type: string,
): Promise<TsAsset[]> {
  const res = await fetch(`${instance}/api/rest/2.0/metadata/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      metadata: [{ type }],
      record_size: 300,
      sort_options: { field_name: "NAME", order: "ASC" },
    }),
  });
  if (!res.ok) return [];
  const results = await res.json() as Array<{ metadata_id: string; metadata_name: string }>;
  return results
    .map((r) => ({ id: r.metadata_id, name: r.metadata_name }))
    .filter((r) => r.id && r.name);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || (callerRole !== "admin" && callerRole !== "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    instance?: string;
    username?: string;
    password?: string;
  };

  const instance = (body.instance ?? "").replace(/\/+$/, "");
  const username = (body.username ?? "").trim();
  const password = (body.password ?? "").trim() || undefined;

  if (!instance) return NextResponse.json({ error: "instance is required" }, { status: 400 });
  if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 });

  let token: string;
  let authMethod: "trusted" | "password";

  try {
    token = await getBearerToken(instance, username, password);
    authMethod = getTsSecret(instance) ? "trusted" : "password";
  } catch (err) {
    return NextResponse.json({ error: String(err).replace(/^Error: /, "") }, { status: 502 });
  }

  const [liveboards, worksheets] = await Promise.all([
    searchMetadata(instance, token, "LIVEBOARD"),
    searchMetadata(instance, token, "WORKSHEET"),
  ]);

  return NextResponse.json({ liveboards, worksheets, authMethod } satisfies TsConnectResult);
}
