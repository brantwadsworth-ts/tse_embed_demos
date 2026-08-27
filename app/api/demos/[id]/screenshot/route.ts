import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { readDemos, writeDemos } from "@/lib/store";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files accepted" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "png";
  const blob = await put(`screenshots/${id}/${Date.now()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  });

  const screenshotUrls = [blob.url, ...(demos[idx].screenshotUrls ?? []).slice(0, 2)];
  demos[idx] = { ...demos[idx], screenshotUrls };
  await writeDemos(demos);

  return NextResponse.json({ url: blob.url, screenshotUrls });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { url } = (await req.json()) as { url: string };
  if (!url) return NextResponse.json({ error: "No url" }, { status: 400 });

  try { await del(url); } catch { /* already gone */ }

  const screenshotUrls = (demos[idx].screenshotUrls ?? []).filter((u) => u !== url);
  demos[idx] = { ...demos[idx], screenshotUrls };
  await writeDemos(demos);

  return NextResponse.json({ screenshotUrls });
}
