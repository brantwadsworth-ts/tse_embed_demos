import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return Response.json({ error: "no url" }, { status: 400 });

  let url: URL;
  try {
    url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DemoPortalPreview/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return Response.json({ error: `upstream ${res.status}` }, { status: 502 });

    const html = await res.text();

    // og:image — try both attribute orders
    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];

    // og:title → <title> fallback
    const ogTitle = (
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1] ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
    )?.trim();

    // og:description → meta description fallback
    const ogDescription = (
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1] ??
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]
    )?.trim();

    // Favicon — prefer apple-touch-icon, fall back to /favicon.ico
    const faviconHref =
      html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i)?.[1] ??
      html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1];

    const favicon = faviconHref
      ? new URL(faviconHref, url.origin).toString()
      : `${url.origin}/favicon.ico`;

    // Resolve relative og:image
    const resolvedOgImage = ogImage
      ? (ogImage.startsWith("http") ? ogImage : new URL(ogImage, url.origin).toString())
      : undefined;

    return Response.json({
      ogImage: resolvedOgImage,
      ogTitle,
      ogDescription,
      favicon,
      origin: url.origin,
    });
  } catch {
    return Response.json({ error: "fetch failed" }, { status: 502 });
  }
}
