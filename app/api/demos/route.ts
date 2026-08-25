import { NextRequest, NextResponse } from "next/server";
import { getAllDemos, saveSubmission, Demo } from "@/lib/demos";
import { readDemos, writeDemos } from "@/lib/store";
import { uploadToBlob } from "@/lib/upload";
import { isAuthenticated } from "@/lib/auth";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueId(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const demos = await getAllDemos();
  return NextResponse.json(demos);
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  // ── JSON body path (used by ForkDemoForm and programmatic creation) ──
  if (contentType.includes("application/json")) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const login = (session.user as { login?: string }).login ?? "";

    const body = (await request.json()) as Partial<Demo> & { forkedFrom?: string };

    const demos = await readDemos();
    const base = slugify(body.companyName ?? "demo");
    const id = uniqueId(base, demos.map((d) => d.id));
    const now = new Date().toISOString().slice(0, 10);

    const newDemo: Demo = {
      companyName: body.companyName ?? "Untitled Demo",
      useCase: body.useCase ?? "",
      tsInstance: body.tsInstance ?? "",
      rlsRequired: body.rlsRequired ?? false,
      useSpotter: body.useSpotter ?? false,
      reportDesigner: body.reportDesigner ?? false,
      ...body,
      id,
      status: "draft",
      createdAt: now,
      owner: login,
    };

    demos.push(newDemo);
    await writeDemos(demos);

    return NextResponse.json(newDemo);
  }

  // ── FormData path (used by NewDemoForm — original behaviour) ──
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const id = randomUUID().slice(0, 8);

  // Upload screenshots
  const screenshotFiles = formData.getAll("screenshots") as File[];
  const screenshotUrls: string[] = [];
  for (const file of screenshotFiles) {
    if (file.size > 0) {
      const url = await uploadToBlob(file, `demos/${id}/screenshots`);
      if (url) screenshotUrls.push(url);
    }
  }

  // Upload sample data
  const sampleDataFile = formData.get("sampleData") as File | null;
  let sampleDataUrl: string | null = null;
  if (sampleDataFile && sampleDataFile.size > 0) {
    sampleDataUrl = await uploadToBlob(sampleDataFile, `demos/${id}/data`);
  }

  const rawQuestions = (formData.get("sampleQuestions") as string | null) ?? "";
  const sampleQuestions = rawQuestions
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);

  const demo: Demo = {
    id,
    companyName: (formData.get("companyName") as string).trim(),
    website: (formData.get("website") as string | null)?.trim() || undefined,
    useCase: (formData.get("useCase") as string).trim(),
    sampleQuestions,
    screenshotUrls,
    sampleDataUrl,
    rlsRequired: formData.get("rlsRequired") === "true",
    rlsRules: (formData.get("rlsRules") as string | null)?.trim() || undefined,
    useSpotter: formData.get("useSpotter") === "true",
    spotterName: (formData.get("spotterName") as string | null)?.trim() || undefined,
    reportDesigner: formData.get("reportDesigner") === "true",
    tsInstance: (formData.get("tsInstance") as string).trim(),
    status: "pending",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  await saveSubmission(demo);
  return NextResponse.json({ ok: true, id: demo.id });
}
