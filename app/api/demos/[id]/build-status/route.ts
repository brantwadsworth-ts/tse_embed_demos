import { NextRequest, NextResponse } from "next/server";
import { updateDemoFields } from "@/lib/demos";
import { createHmac, timingSafeEqual } from "crypto";

const WEBHOOK_SECRET = process.env.BUILD_WEBHOOK_SECRET;

function verifySignature(body: string, sigHeader: string | null): boolean {
  if (!WEBHOOK_SECRET) return false;
  if (!sigHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
  const received = sigHeader.slice(7);
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

// POST /api/demos/[id]/build-status
// Called by GitHub Actions at the end of demo-factory.yml.
// Verified via HMAC-SHA256 signature in X-Build-Signature header.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rawBody = await request.text();
  const sig = request.headers.get("x-build-signature");

  if (!verifySignature(rawBody, sig)) {
    return NextResponse.json({ error: "Invalid or missing signature." }, { status: 401 });
  }

  let body: { status?: string; branch?: string; liveUrl?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { status, branch, liveUrl } = body;
  if (status !== "live" && status !== "failed") {
    return NextResponse.json({ error: "status must be 'live' or 'failed'." }, { status: 400 });
  }

  try {
    await updateDemoFields(id, {
      status,
      ...(branch ? { branch } : {}),
      ...(liveUrl ? { liveUrl } : {}),
    });
  } catch (err) {
    console.error("[build-status] updateDemoFields failed:", err);
    return NextResponse.json({ error: "Failed to update demo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id, status });
}
