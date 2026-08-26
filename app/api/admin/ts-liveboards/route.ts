import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/roles";
import { getTsSecret } from "@/lib/tsSecrets";

export async function GET(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || (callerRole !== "admin" && callerRole !== "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instance = (searchParams.get("instance") ?? "").replace(/\/+$/, "");
  const username = (searchParams.get("username") ?? "").trim();

  if (!instance) {
    return NextResponse.json({ error: "instance query param required" }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: "username query param required" }, { status: 400 });
  }

  const secret = getTsSecret(instance);
  if (!secret) {
    return NextResponse.json(
      {
        error: `No trusted auth secret found for this cluster. Add TS_AUTH_SECRET_${
          new URL(instance).hostname.split(".")[0].toUpperCase().replace(/-/g, "_")
        } to your Vercel env vars.`,
      },
      { status: 503 },
    );
  }

  // 1. Get a token via trusted auth
  let token: string;
  try {
    const tokenRes = await fetch(`${instance}/callosum/v1/session/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret_key: secret, username, access_level: "FULL" }).toString(),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => tokenRes.statusText);
      return NextResponse.json(
        { error: `ThoughtSpot auth failed (${tokenRes.status}): ${text.slice(0, 200)}` },
        { status: 502 },
      );
    }
    token = (await tokenRes.text()).trim();
  } catch (err) {
    return NextResponse.json({ error: `Could not reach ThoughtSpot: ${String(err)}` }, { status: 502 });
  }

  // 2. Search for liveboards via REST API v2
  let liveboards: Array<{ id: string; name: string }>;
  try {
    const searchRes = await fetch(`${instance}/api/rest/2.0/metadata/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        metadata: [{ type: "LIVEBOARD" }],
        record_size: 200,
        sort_options: { field_name: "NAME", order: "ASC" },
      }),
    });

    if (!searchRes.ok) {
      const text = await searchRes.text().catch(() => searchRes.statusText);
      return NextResponse.json(
        { error: `Liveboard search failed (${searchRes.status}): ${text.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const results = await searchRes.json() as Array<{
      metadata_id: string;
      metadata_name: string;
    }>;

    liveboards = results.map((r) => ({
      id: r.metadata_id,
      name: r.metadata_name,
    }));
  } catch (err) {
    return NextResponse.json({ error: `Liveboard search error: ${String(err)}` }, { status: 502 });
  }

  return NextResponse.json(liveboards);
}
