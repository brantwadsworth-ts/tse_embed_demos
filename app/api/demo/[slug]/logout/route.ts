import { NextRequest } from "next/server";
import { getDemoById } from "@/lib/demos";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const demo = await getDemoById(slug);
  if (!demo) return Response.json({ error: "Demo not found" }, { status: 404 });

  // Proxy the TS session logout server-side to avoid CORS issues
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const tsRes = await fetch(`${demo.tsInstance}/callosum/v1/session/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    const response = Response.json({ ok: true });

    // Forward any Set-Cookie headers (to clear the TS session cookie on the browser)
    tsRes.headers.getSetCookie?.()?.forEach((c) => {
      response.headers.append("Set-Cookie", c);
    });

    return response;
  } catch {
    // Even if TS logout fails, we reset client state — return ok
    return Response.json({ ok: true });
  }
}
