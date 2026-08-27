import { NextRequest, NextResponse } from "next/server";
import { getDemoById } from "@/lib/demos";
import { getTsSecret } from "@/lib/tsSecrets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractWorksheetId(item: any): string | null {
  if (!item || typeof item !== "object") return null;

  // Try all known TS metadata response shapes
  const candidates = [
    item.complete_detail?.header,
    item.complete_detail,
    item.header,
    item.metadata_detail?.header,
    item,
  ];

  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    for (const key of ["dataSourceGuid", "dataSourceGUID", "data_source_guid"]) {
      const val = c[key];
      if (Array.isArray(val) && val[0]) return String(val[0]);
      if (typeof val === "string" && val) return val;
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const liveboardId = request.nextUrl.searchParams.get("liveboardId");

  if (!liveboardId) {
    return NextResponse.json({ error: "liveboardId required" }, { status: 400 });
  }

  const demo = await getDemoById(slug);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Prefer trusted auth if available; otherwise forward browser session cookies
  const secret = getTsSecret(demo.tsInstance);
  if (secret) {
    const username = demo.demoUsers?.[0]?.tsUsername ?? "demo";
    try {
      const tokenRes = await fetch(`${demo.tsInstance}/callosum/v1/session/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret_key: secret, username, access_level: "FULL" }).toString(),
      });
      if (tokenRes.ok) {
        const token = (await tokenRes.text()).trim();
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch { /* fall through to cookie auth */ }
  }

  // If no bearer token was set, forward the browser's TS session cookies
  if (!headers["Authorization"]) {
    const cookie = request.headers.get("cookie");
    if (cookie) headers["Cookie"] = cookie;
  }

  let metaRes: Response;
  try {
    metaRes = await fetch(`${demo.tsInstance}/api/rest/2.0/metadata/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        metadata: [{ type: "LIVEBOARD", identifier: liveboardId }],
        include_details: true,
      }),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }

  if (!metaRes.ok) {
    return NextResponse.json(
      { error: `TS metadata API returned ${metaRes.status}` },
      { status: 502 },
    );
  }

  const data = await metaRes.json();
  const items = Array.isArray(data) ? data : data?.results ?? [];
  const worksheetId = extractWorksheetId(items[0]) ?? null;

  return NextResponse.json({ worksheetId });
}
