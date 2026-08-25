import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getApiKey } from "@/lib/apikeys";

const SYSTEM_PROMPT = `You are a ThoughtSpot demo configuration assistant. Given a company name, website, and use case description, you generate:
1. A concise AI assistant prompt (2-3 sentences) for the embedded Spotter AI
2. Three sample questions a user might ask
3. Feature recommendations (should they use Spotter AI? Report Designer? RLS?)

Always respond with valid JSON only, no markdown, no explanation.`;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";

  const apiKey = await getApiKey(login);
  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key configured. Go to Settings." },
      { status: 400 },
    );
  }

  const body = await request.json() as {
    companyName?: string;
    website?: string;
    useCase?: string;
    tsInstance?: string;
  };

  const userPrompt = `Company: ${body.companyName ?? ""}
Website: ${body.website ?? ""}
Use Case: ${body.useCase ?? ""}
ThoughtSpot Instance: ${body.tsInstance ?? ""}

Generate configuration JSON with this exact shape:
{
  "prompt": "...",
  "sampleQuestions": ["...", "...", "..."],
  "useSpotter": true/false,
  "spotterName": "...",
  "reportDesigner": true/false,
  "rlsRequired": true/false
}`;

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text();
    return NextResponse.json(
      { error: `Anthropic API error: ${anthropicRes.status} — ${detail}` },
      { status: 502 },
    );
  }

  const data = await anthropicRes.json() as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = data.content?.find((c) => c.type === "text")?.text ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "AI returned malformed JSON. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json(parsed);
}
