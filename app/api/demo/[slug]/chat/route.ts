import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are "Clarity", the AI data assistant embedded in Montana DPHHS MIDIS (Morbidity and Incident Disease Information System) Reconciliation Portal.

MIDIS tracks disease surveillance data quality, case reconciliation, and Annual Case Review (ACR) metrics across Montana counties and jurisdictions.

You handle two kinds of questions:
1. General / conceptual: What MIDIS is, how reconciliation works, completeness definitions, ACR reporting structure, disease surveillance concepts, public health best practices. Answer in 2-4 concise sentences.
2. Data / analytics: Completeness percentages, case counts, county breakdowns, jurisdiction comparisons, time-series trends, MMWR reporting, "how many", "show me", "what is the rate", "which counties". For these, call show_analytics with a concise Spotter-ready query.

Rules:
- Never invent specific numbers, percentages, or counts.
- When a question asks about actual data values, ALWAYS route to show_analytics.
- Keep text answers brief (2-4 sentences max).`;

const TOOL = {
  name: "show_analytics",
  description:
    "Route a data question to ThoughtSpot Spotter for live MIDIS data visualization. Use for any question about actual completeness rates, case counts, jurisdiction comparisons, county-level data, or trends over time.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "A concise natural-language query for Spotter, e.g. 'DOB completeness by county' or 'case counts by jurisdiction current MMWR year'.",
      },
      preamble: {
        type: "string",
        description:
          "One brief sentence to show the user while the chart loads, e.g. 'Looking up completeness rates by county…'",
      },
    },
    required: ["query"],
  },
};

type RouteResult =
  | { kind: "text"; text: string }
  | { kind: "analytics"; query: string; preamble: string };

function fallbackRoute(message: string): RouteResult {
  const lower = message.toLowerCase();
  const dataKeywords = [
    "completeness", "case count", "jurisdiction", "county", "mmwr",
    "how many", "show me", "trend", "rate", "percent", "%",
    "what is the", "display", "list", "by month", "by week", "by year",
    "compare", "breakdown", "report", "data", "statistic", "metric",
    "which", "top", "bottom", "lowest", "highest", "average", "total",
    "disease", "condition", "diagnosis", "surveillance", "acr",
  ];
  if (dataKeywords.some((kw) => lower.includes(kw))) {
    return {
      kind: "analytics",
      query: message,
      preamble: "Looking up data in MIDIS…",
    };
  }
  return {
    kind: "text",
    text: "I can help you explore MIDIS disease surveillance data. Try asking about completeness rates, case counts by jurisdiction, or county-level trends. You can also ask me how MIDIS reconciliation works.",
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await params;

  const body = await request.json().catch(() => ({})) as {
    history?: Array<{ role: string; content: string }>;
    message?: string;
  };

  if (!body.message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!ANTHROPIC_KEY) {
    return NextResponse.json(fallbackRoute(body.message));
  }

  const history = (body.history ?? []).slice(-10);
  const messages = [
    ...history.map((t) => ({ role: t.role as "user" | "assistant", content: t.content })),
    { role: "user" as const, content: body.message },
  ];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        messages,
      }),
    });

    if (!res.ok) {
      console.error("[chat] Anthropic error:", res.status, await res.text().catch(() => ""));
      return NextResponse.json(fallbackRoute(body.message));
    }

    const data = await res.json() as {
      content?: Array<{ type: string; text?: string; name?: string; input?: Record<string, string> }>;
    };

    const toolUse = data.content?.find((c) => c.type === "tool_use" && c.name === "show_analytics");
    if (toolUse?.input) {
      return NextResponse.json({
        kind: "analytics",
        query: toolUse.input.query ?? body.message,
        preamble: toolUse.input.preamble ?? "",
      });
    }

    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    if (text) {
      return NextResponse.json({ kind: "text", text });
    }

    return NextResponse.json(fallbackRoute(body.message));
  } catch (e) {
    console.error("[chat] error:", e);
    return NextResponse.json(fallbackRoute(body.message));
  }
}
