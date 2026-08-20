import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllDemos, updateDemoStatus } from "@/lib/demos";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN_WORKFLOW;
const GITHUB_REPO  = process.env.GITHUB_REPO;    // e.g. "ts-embed/tse_embed_demos"
const WORKFLOW_REF = "demo-builder";              // branch that hosts the workflow file

// POST /api/demos/[id]/build
// Reads the submission, base64-encodes it, and triggers the GitHub Actions
// demo-factory.yml workflow via workflow_dispatch.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN_WORKFLOW / GITHUB_REPO are not configured." },
      { status: 500 },
    );
  }

  const { id } = await params;
  const demos   = await getAllDemos();
  const demo    = demos.find((d) => d.id === id);

  if (!demo) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }
  if (demo.status === "live") {
    return NextResponse.json({ error: "Demo is already live." }, { status: 409 });
  }

  // Base64-encode the submission JSON so it survives the GitHub Actions input
  const submissionB64 = Buffer.from(JSON.stringify(demo)).toString("base64");

  const ghResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/demo-factory.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: WORKFLOW_REF,
        inputs: { submission_json_b64: submissionB64 },
      }),
    },
  );

  if (!ghResponse.ok) {
    const detail = await ghResponse.text();
    return NextResponse.json(
      { error: `GitHub API error: ${ghResponse.status} ${detail}` },
      { status: 502 },
    );
  }

  // Mark demo as building (best-effort — non-fatal if storage is ephemeral)
  try {
    await updateDemoStatus(id, "building");
  } catch {
    // non-fatal
  }

  return NextResponse.json({ ok: true, message: "Build triggered." });
}
