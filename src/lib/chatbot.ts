// ---------------------------------------------------------------------------
// Merlin — Kearney SpendPro AI assistant (host-owned).
//
// Uses Claude to either (a) answer general procurement / SpendPro questions
// as text, or (b) route a data/analytics question to ThoughtSpot Spotter.
// The actual data answer is rendered by a BodylessConversation embed in the
// chat UI — this module only decides *what* to do and produces the query.
//
// Set VITE_ANTHROPIC_API_KEY (and optionally VITE_ANTHROPIC_MODEL) to enable
// the LLM. Without a key, a keyword router + small procurement FAQ is used so
// the widget still works for demos.
// ---------------------------------------------------------------------------

const env: Record<string, string | undefined> = (import.meta as any).env ?? {};
const ANTHROPIC_KEY = env.VITE_ANTHROPIC_API_KEY;
const MODEL = env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-6';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocLink {
  label: string;
  url: string;
}

export type RouteResult =
  | { kind: 'text'; text: string; links?: DocLink[] }
  | { kind: 'analytics'; query: string; preamble: string };

/** True when an LLM key is configured (drives a small UI hint). */
export const hasLLM = !!ANTHROPIC_KEY;

const SYSTEM_PROMPT = `You are "Merlin", the AI procurement assistant embedded in Kearney MIDIS SpendPro — an analytics platform for strategic procurement and spend management.

You handle two kinds of questions:
1. General procurement / spend management questions — what categories mean, how indirect/direct spend is defined, supplier risk concepts, savings methodology, category management best practices, procurement KPIs. Answer these yourself, concisely (2–5 sentences), in a professional, analytical tone.
2. Questions about the user's OWN spend data / analytics — metrics, totals, trends, supplier breakdowns, category splits, regional spend, savings realized, contract coverage, "how many", "show me", "top N", comparisons, time series. For these you MUST NOT invent numbers. Instead call the show_analytics tool with a concise natural-language query for the BI engine, stripping greetings and pleasantries.

If a request is ambiguous, prefer a short text answer. Never fabricate specific data values.`;

const TOOL = {
  name: 'show_analytics',
  description:
    "Route a data/analytics question to ThoughtSpot Spotter, which answers it with the user's live spend data and a visualization. Use for any question about actual spend amounts, supplier counts, category breakdowns, savings, contract coverage, trends, or comparisons.",
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A concise natural-language analytics question for Spotter, e.g. "total spend by category this year" or "top 10 suppliers by spend in EMEA".',
      },
    },
    required: ['query'],
  },
};

export async function routeMessage(
  history: ChatTurn[],
  userMessage: string,
): Promise<RouteResult> {
  if (!ANTHROPIC_KEY) return fallbackRoute(userMessage);
  try {
    const messages = [
      ...history.slice(-10).map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: userMessage },
    ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        messages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const blocks: any[] = data.content ?? [];
    const toolUse = blocks.find(
      (b) => b.type === 'tool_use' && b.name === 'show_analytics',
    );
    const text = blocks
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (toolUse?.input?.query) {
      return {
        kind: 'analytics',
        query: String(toolUse.input.query),
        preamble: text || "Here's what I found in your spend data:",
      };
    }
    return { kind: 'text', text: text || "I'm not sure how to help with that." };
  } catch {
    return fallbackRoute(userMessage);
  }
}

// --- No-LLM fallback --------------------------------------------------------

const ANALYTICS_RE =
  /\b(how many|how much|number of|count|total|average|avg|median|sum|trend|trending|over time|by (week|month|quarter|year|day|supplier|region|category|country|business unit)|spend|savings?|contract|coverage|maverick|tail spend|top \d*|bottom \d*|compare|growth|year.over.year|yoy|ytd|q[1-4]|emea|apac|americas|indirect|direct|managed spend)\b/i;

const MERLIN_OVERVIEW =
  "I'm Merlin, your AI procurement assistant in Kearney MIDIS SpendPro. I can answer questions about spend management and procurement best practices, and I can pull live analytics from your spend data — try asking \"total spend by category\" or \"top suppliers in EMEA.\"";

interface FaqEntry {
  re: RegExp;
  text: string;
  links?: DocLink[];
}

const FAQ: FaqEntry[] = [
  {
    re: /\b(hi|hello|hey|yo|sup)\b/i,
    text: "Hi! I'm Merlin, your Kearney SpendPro AI assistant. Ask me a procurement question or request a spend analysis — for example, \"show spend by region\" or \"what is tail spend?\"",
  },
  {
    re: /help|what can you|how do you work/i,
    text: "I can answer procurement and spend management questions, and I can pull live analytics from your data using ThoughtSpot. Try \"total spend by supplier\" or \"what is category management?\"",
  },
  {
    re: /what.*(merlin|you|this|spendpro|midis)|who are you/i,
    text: MERLIN_OVERVIEW,
  },
  {
    re: /tail spend|long.?tail/i,
    text: 'Tail spend refers to the large number of low-value, infrequent purchases that collectively represent a small portion of total spend but a high proportion of transactions. Managing tail spend reduces maverick buying and can unlock 5–15% in savings through consolidation and preferred supplier programs.',
  },
  {
    re: /maverick|off.?contract|off contract/i,
    text: 'Maverick spend is purchasing that bypasses approved suppliers or contracts. It inflates costs, creates compliance risk, and weakens supplier relationships. SpendPro tracks contract coverage to help identify and reduce maverick buying.',
  },
  {
    re: /category management|category strategy/i,
    text: 'Category management groups similar spend into categories (e.g. IT, MRO, Professional Services) and manages each strategically — analyzing supply markets, segmenting suppliers, and developing sourcing strategies to optimize cost, quality, and risk across the portfolio.',
  },
  {
    re: /indirect spend/i,
    text: 'Indirect spend covers goods and services that support business operations but are not directly incorporated into the end product — facilities, IT, marketing, travel, and professional services. It typically accounts for 20–40% of revenue and is a major savings opportunity.',
  },
  {
    re: /direct spend|raw material|bill of material/i,
    text: 'Direct spend is the cost of inputs that go directly into the product or service — raw materials, components, and contract manufacturing. It is typically the largest spend category and closely tied to product cost and supply chain resilience.',
  },
  {
    re: /savings|cost reduction|benefit/i,
    text: 'Procurement savings are typically reported as hard savings (actual cost reductions vs. prior year or budget) and soft savings (cost avoidance, process efficiencies). Kearney benchmarks suggest best-in-class procurement organizations deliver 6–12% savings on managed spend annually.',
  },
  {
    re: /supplier risk|vendor risk|supply risk/i,
    text: 'Supplier risk management involves assessing financial stability, geographic concentration, single-source dependency, ESG compliance, and business continuity. SpendPro\'s Supplier Network view helps identify concentration risk and diversification opportunities.',
  },
  {
    re: /contract coverage|contract compliance/i,
    text: 'Contract coverage measures the percentage of spend made through negotiated agreements. Higher coverage reduces maverick buying, improves leverage, and enables better supplier performance management. Leading organizations target 80–90% contract coverage.',
  },
  {
    re: /emea|apac|americas|region/i,
    text: 'SpendPro tracks spend across three global regions: EMEA (Europe, Middle East & Africa), APAC (Asia-Pacific), and Americas. Regional breakdowns help identify geographic concentration, currency exposure, and local sourcing opportunities.',
  },
  {
    re: /benchmark|best.in.class|industry average/i,
    text: "Kearney's procurement benchmarks draw on data from thousands of organizations globally. Key metrics include cost-of-procurement as a % of spend managed (best-in-class: <0.5%), contract coverage (>80%), and savings rate (6-12%). SpendPro compares your performance against these benchmarks in the Benchmarks view.",
  },
];

const DEFINITIONAL_RE =
  /^\s*(what(?:'s| is| are| does| do)?\b(?!\s+(?:my|the|our)\b)|who\b|why\b|explain\b|define\b|describe\b|tell me about\b|how (?:do|does|can)\b)/i;

const analyticsResult = (msg: string): RouteResult => ({
  kind: 'analytics',
  query: msg.trim(),
  preamble: "Here's what I found in your spend data:",
});

function fallbackRoute(msg: string): RouteResult {
  const isData = ANALYTICS_RE.test(msg);
  const isDefinition = DEFINITIONAL_RE.test(msg);

  if (isData && !isDefinition) return analyticsResult(msg);

  for (const entry of FAQ)
    if (entry.re.test(msg)) return { kind: 'text', text: entry.text, links: entry.links };

  if (isData) return analyticsResult(msg);

  return {
    kind: 'text',
    text: 'I can help with procurement questions and pull live spend analytics from your data. Try "total spend by category" or ask me what tail spend means.',
  };
}
