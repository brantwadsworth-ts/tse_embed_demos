import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readDemos, writeDemos } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    liveUrl?: string;
    branch?: string;
    coolifyUrl?: string;
  };

  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Demo not found" }, { status: 404 });
  }

  demos[idx] = {
    ...demos[idx],
    status: "live",
    ...(body.liveUrl && { liveUrl: body.liveUrl }),
    ...(body.branch && { branch: body.branch }),
    ...(body.coolifyUrl && { coolifyUrl: body.coolifyUrl }),
  };

  await writeDemos(demos);
  return NextResponse.json({ ok: true, demo: demos[idx] });
}
