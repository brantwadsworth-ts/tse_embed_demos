// ---------------------------------------------------------------------------
// Acme AI chatbot brain (host-owned).
//
// Uses Claude to either (a) answer general Acme questions as text, or
// (b) route a data/analytics question to ThoughtSpot Spotter. The actual data
// answer is rendered by a BodylessConversation embed in the chat UI — this
// module only decides *what* to do and produces the Spotter query.
//
// Set VITE_ANTHROPIC_API_KEY (and optionally VITE_ANTHROPIC_MODEL) to enable
// the LLM. Without a key, a keyword router + small Acme FAQ is used so the
// widget still works for demos.
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

/** Canonical Acme resources the assistant can point users to. */
export const ACME_DOCS: Record<string, DocLink> = {
  home: { label: 'acme.com', url: 'https://www.acme.com' },
  help: { label: 'Help Center', url: 'https://help.acme.com' },
  cadence: { label: 'Cadence overview', url: 'https://www.acme.com/platform/cadence' },
  conversations: { label: 'Conversations', url: 'https://www.acme.com/platform/conversations' },
  deals: { label: 'Deals', url: 'https://www.acme.com/platform/deals' },
  forecast: { label: 'Forecast', url: 'https://www.acme.com/platform/forecast' },
  rhythm: { label: 'Rhythm AI', url: 'https://www.acme.com/platform/rhythm' },
  developers: { label: 'Developer & API docs', url: 'https://developers.acme.com' },
  university: { label: 'Acme University', url: 'https://university.acme.com' },
  pricing: { label: 'Pricing', url: 'https://www.acme.com/pricing' },
};

/** True when an LLM key is configured (drives a small UI hint). */
export const hasLLM = !!ANTHROPIC_KEY;

const SYSTEM_PROMPT = `You are "Acme AI", the in-app assistant for the Acme revenue-orchestration platform.

You handle two kinds of questions:
1. General Acme / sales-engagement questions — what Acme is, what cadences/Conversations/Deals are, how-to, definitions, best practices. Answer these yourself, concisely (2–5 sentences), in a friendly, professional tone.
2. Questions about the user's OWN data / analytics — metrics, counts, trends, pipeline, revenue, cadence performance, "how many", "show me", "top N", comparisons, time series, rates. For these you MUST NOT invent numbers. Instead call the show_analytics tool with a concise natural-language query for a BI engine (ThoughtSpot Spotter), stripping greetings and pleasantries.

If a request is ambiguous, prefer a short text answer. Never fabricate specific data values.

When you answer a general Acme question, point the user to the single most relevant resource by including its plain URL at the end of your answer. Available resources:
- Acme site: https://www.acme.com
- Help Center: https://help.acme.com
- Cadence: https://www.acme.com/platform/cadence
- Conversations: https://www.acme.com/platform/conversations
- Deals: https://www.acme.com/platform/deals
- Forecast: https://www.acme.com/platform/forecast
- Rhythm AI: https://www.acme.com/platform/rhythm
- Developer & API docs: https://developers.acme.com
- Acme University (training): https://university.acme.com
- Pricing: https://www.acme.com/pricing`;

const TOOL = {
  name: 'show_analytics',
  description:
    "Route a data/analytics question to ThoughtSpot Spotter, which answers it with the user's live data and a visualization. Use for any question about actual metrics, counts, trends, pipeline, revenue, cadence performance, activity, rates, comparisons, or time series.",
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A concise natural-language analytics question for Spotter, e.g. "meetings booked by week" or "top 5 cadences by influenced pipeline".',
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
        preamble: text || 'Here’s what I found in your data:',
      };
    }
    return { kind: 'text', text: text || "I'm not sure how to help with that." };
  } catch {
    // Network / CORS / key issue — degrade to the keyword router.
    return fallbackRoute(userMessage);
  }
}

// --- No-LLM fallback --------------------------------------------------------

const ANALYTICS_RE =
  /\b(how many|how much|number of|count|total|average|avg|median|sum|trend|trending|over time|by (week|month|quarter|year|day|rep|region|stage|owner|cadence|industry)|pipeline|revenue|bookings?|deals?|meetings?|win[ -]?rate|conversion|rate|top \d*|bottom \d*|forecast|quota|attainment|emails? (sent|replied|opened|delivered|bounced)|open rate|reply rate|calls?|dials?|activity|performance|compare|growth|churn|arr|mrr|influenced)\b/i;

const ACME_OVERVIEW =
  'Acme is an AI-powered revenue-orchestration platform that helps sales teams engage buyers, manage pipeline, and drive predictable revenue. It brings the full sales workflow into one place — Cadences for structured outreach, Conversations for call & meeting intelligence, Deals for pipeline and opportunity management, and Forecast for revenue prediction — all guided by its AI engine (Rhythm) and connected to your CRM.';

interface FaqEntry {
  re: RegExp;
  text: string;
  links?: DocLink[];
}

const FAQ: FaqEntry[] = [
  {
    re: /(what|tell me|explain|describe|who).*(acme)|acme.*(do|about|is|platform|used for)|^acme\b/i,
    text: ACME_OVERVIEW,
    links: [ACME_DOCS.home, ACME_DOCS.help],
  },
  {
    re: /cadence/i,
    text: 'A cadence is a structured, multi-step sequence of touchpoints — emails, calls, LinkedIn steps, and other tasks spaced over days — that reps follow to engage prospects consistently and at scale. You can see each cadence and its performance in the Cadences tab.',
    links: [ACME_DOCS.cadence, ACME_DOCS.help],
  },
  {
    re: /conversation|call recording|call intelligence|gong|transcri/i,
    text: 'Conversations is Acme’s call and meeting intelligence. It records, transcribes, and analyzes sales calls so reps and managers can review talk-time, key moments, and coaching opportunities, and surface insights automatically.',
    links: [ACME_DOCS.conversations],
  },
  {
    re: /\bdeals?\b|pipeline management|opportunit/i,
    text: 'Deals is Acme’s pipeline and opportunity workspace. It gives reps a single place to manage open opportunities, track deal health and next steps, and keep CRM data up to date so forecasting stays accurate.',
    links: [ACME_DOCS.deals],
  },
  {
    re: /forecast/i,
    text: 'Forecast helps revenue teams predict and commit to numbers with confidence — rolling up rep and team projections, comparing them to quota, and highlighting risk so managers can course-correct early.',
    links: [ACME_DOCS.forecast],
  },
  {
    re: /rhythm|ai engine|prioriti|guided sell/i,
    text: 'Rhythm is Acme’s AI engine. It turns buyer signals into a prioritized, guided to-do list for reps — telling them who to engage next and what action to take — so the highest-impact work happens first.',
    links: [ACME_DOCS.rhythm],
  },
  {
    re: /\b(api|developer|integration api|webhook|rest api|sdk)\b/i,
    text: 'Acme has a full REST API and developer platform for building integrations, syncing data, and automating workflows — including OAuth, people/cadence endpoints, and webhooks.',
    links: [ACME_DOCS.developers],
  },
  {
    re: /train|learn|university|onboard|certification|course/i,
    text: 'Acme University offers guided training, courses, and certifications to help reps and admins get the most out of the platform.',
    links: [ACME_DOCS.university],
  },
  {
    re: /pric|cost|plan|tier|subscription|how much (is|does)/i,
    text: 'Acme is sold in tiered plans for teams of different sizes and needs. For current packaging and to talk to sales, see the pricing page.',
    links: [ACME_DOCS.pricing],
  },
  {
    re: /who (uses|is it for)|for sales|sdr|bdr|account exec|\bae\b|sales team/i,
    text: 'Acme is used by revenue teams — SDRs/BDRs running outbound, Account Executives managing deals, and sales managers coaching and forecasting — to standardize their workflow and engage buyers more effectively.',
    links: [ACME_DOCS.home],
  },
  {
    re: /\b(crm|salesforce|hubspot|integrat|connect)\b/i,
    text: 'Acme connects to your CRM (such as Salesforce or HubSpot) and your email/calendar, keeping activity and records in sync automatically so reps work in one place and data stays accurate.',
    links: [ACME_DOCS.help, ACME_DOCS.developers],
  },
  {
    re: /reporting|analytics(?!\?)|insights|dashboard/i,
    text: 'Acme Analytics gives teams visibility into engagement and pipeline — cadence performance, activity, conversion, and revenue trends. In this app you can explore that in the Analytics and Cadences tabs, or just ask me a data question here.',
    links: [ACME_DOCS.help],
  },
  {
    re: /\b(hi|hello|hey|yo|sup)\b/i,
    text: 'Hi! I’m Acme AI. Ask me about Acme, or ask a data question like “meetings booked this quarter.”',
  },
  {
    re: /help|what can you|how do you work/i,
    text: 'I can answer questions about Acme and sales engagement (with links to the docs), and I can pull live analytics from your data — try “show meetings booked by week” or “top cadences by influenced pipeline.”',
    links: [ACME_DOCS.help],
  },
];

// Definition-style openers ("what is a cadence", "explain deals") are
// knowledge questions even though they contain words like cadence/deals.
// NOTE: "how many"/"how much" are NOT definitional — they're data questions.
const DEFINITIONAL_RE =
  /^\s*(what(?:'s| is| are| does| do)?\b(?!\s+(?:my|the|our)\b)|who\b|why\b|explain\b|define\b|describe\b|tell me about\b|how (?:do|does|can)\b)/i;

const analyticsResult = (msg: string): RouteResult => ({
  kind: 'analytics',
  query: msg.trim(),
  preamble: 'Here’s what I found in your data:',
});

function fallbackRoute(msg: string): RouteResult {
  const isData = ANALYTICS_RE.test(msg);
  const isDefinition = DEFINITIONAL_RE.test(msg);

  // A data question that isn't phrased as a definition → route to Spotter,
  // even if it mentions "cadence", "deals", "forecast", etc.
  if (isData && !isDefinition) return analyticsResult(msg);

  // Knowledge / definition questions.
  for (const entry of FAQ)
    if (entry.re.test(msg)) return { kind: 'text', text: entry.text, links: entry.links };

  // Data-ish but definition-phrased and unmatched by FAQ → still try Spotter.
  if (isData) return analyticsResult(msg);

  // Anything else mentioning Acme → overview rather than a deflection.
  if (/acme|sales|sell|rep\b|prospect|outreach|buyer/i.test(msg)) {
    return { kind: 'text', text: ACME_OVERVIEW, links: [ACME_DOCS.home, ACME_DOCS.help] };
  }
  return {
    kind: 'text',
    text:
      'I can help with questions about Acme and sales engagement, and I can pull live analytics from your data — try “show meetings booked by week” or “top cadences by influenced pipeline.”',
    links: [ACME_DOCS.help],
  };
}
