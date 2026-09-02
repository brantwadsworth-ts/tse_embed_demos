import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import { getBearerToken } from "@/lib/tsAuth";

export async function POST(request: NextRequest) {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getRole(login);
  if (role !== "admin" && role !== "create") {
    return NextResponse.json({ error: "Admin or create role required" }, { status: 403 });
  }

  const { tsHost, tsUsername, tsPassword } = (await request.json()) as {
    tsHost: string;
    tsUsername?: string;
    tsPassword?: string;
  };
  if (!tsHost) return NextResponse.json({ error: "tsHost required" }, { status: 400 });

  const host = tsHost.startsWith("http") ? tsHost : `https://${tsHost}`;

  const token = await getBearerToken(host, tsUsername ?? "", tsPassword).catch(() => null);
  if (!token) {
    return NextResponse.json(
      { error: "Could not authenticate with ThoughtSpot. Check host / credentials." },
      { status: 401 },
    );
  }

  const res = await fetch(`${host}/api/rest/2.0/connection/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ data_warehouse_types: ["SNOWFLAKE"] }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `TS connection search failed: ${text}` }, { status: res.status });
  }

  const data = (await res.json()) as Array<{
    id: string;
    name: string;
    data_warehouse_type: string;
  }>;

  return NextResponse.json({
    connections: (Array.isArray(data) ? data : []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.data_warehouse_type,
    })),
  });
}
