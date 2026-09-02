// ─── Portal spec.json builder ────────────────────────────────────────────────
// Converts the PortalBuilder wizard state into a fully-populated spec.json
// compatible with the tse_demos rebrand codemod.

export interface WizardState {
  // Step: scope
  mode: "basic" | "advanced";
  // Step: brand
  companyName: string;
  aiName: string;
  tagline: string;
  website: string;
  logoFile: string;
  // Step: data
  tsHost: string;
  analyticsLiveboardInput: string;
  worksheetInput: string;
  filterColumns: string;
  dateColumn: string;
  // Step: auth
  auth: "basic" | "none" | "trusted";
  navLayout: "top" | "left";
  // Step: inline (Advanced)
  inlineEnabled: boolean;
  inlineLiveboardInput: string;
  inlineTabName: string;
  inlineDimensionColumn: string;
  inlineMetrics: string;
  // Step: custom action (Advanced)
  actionEnabled: boolean;
  actionVizInput: string;
  actionLiveboardInput: string;
  actionButtonLabel: string;
  actionTabName: string;
  actionWorkflowDesc: string;
  // Step: ai-tiers
  askMode: "both" | "spotter" | "chat";
  chatbot: boolean;
  monetize: boolean;
  monetizeTrigger: number;
  tiers: boolean;
  basicLoses: string[];
  // Step: add-report (Advanced)
  addReport: "none" | "spotter" | "both";
  // Step: theme
  primaryColor: string;
  accentColor: string;
  defaultTheme: "light" | "dark";
  fontFamily: string;
  fontGoogleUrl: string;
}

export const INITIAL_STATE: WizardState = {
  mode: "advanced",
  companyName: "",
  aiName: "",
  tagline: "",
  website: "",
  logoFile: "",
  tsHost: "",
  analyticsLiveboardInput: "",
  worksheetInput: "",
  filterColumns: "",
  dateColumn: "",
  auth: "basic",
  navLayout: "top",
  inlineEnabled: false,
  inlineLiveboardInput: "",
  inlineTabName: "Insights",
  inlineDimensionColumn: "",
  inlineMetrics: "",
  actionEnabled: false,
  actionVizInput: "",
  actionLiveboardInput: "",
  actionButtonLabel: "",
  actionTabName: "Actions",
  actionWorkflowDesc: "",
  askMode: "both",
  chatbot: true,
  monetize: false,
  monetizeTrigger: 3,
  tiers: false,
  basicLoses: [],
  addReport: "none",
  primaryColor: "#2563eb",
  accentColor: "#f59e0b",
  defaultTheme: "light",
  fontFamily: "Inter",
  fontGoogleUrl: "",
};

// ── Color utilities ───────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;
  return [Math.round(hue * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexRgb(hex: string): string {
  const h = hex.replace("#", "").padEnd(6, "0");
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
}

// ── GUID / host parsers ───────────────────────────────────────────────────────

const GUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parseGuid(input: string): string {
  const m = input.match(GUID_RE);
  return m ? m[0] : input.trim();
}

export function parseHost(input: string): string {
  try {
    if (input.includes("://")) return new URL(input).hostname;
  } catch {}
  return input.replace(/^https?:\/\//, "").split("/")[0];
}

// ── Theme derivation ──────────────────────────────────────────────────────────

function deriveSlTheme(
  primaryHex: string,
  accentHex: string,
  fontFamily: string,
): { light: Record<string, string>; dark: Record<string, string> } {
  const [h, s, l] = hexToHsl(primaryHex);
  const stack = `'${fontFamily}', Inter, system-ui, sans-serif`;
  const rgbP = hexRgb(primaryHex);

  const light: Record<string, string> = {
    "--sl-cream": hslToHex(h, Math.min(s * 0.25, 18), 97),
    "--sl-cream-2": hslToHex(h, Math.min(s * 0.35, 22), 94),
    "--sl-white": "#ffffff",
    "--sl-evergreen": primaryHex,
    "--sl-evergreen-2": hslToHex(h, s, Math.max(l - 8, 3)),
    "--sl-green": primaryHex,
    "--sl-green-dark": hslToHex(h, Math.min(s + 5, 100), Math.min(l + 14, 70)),
    "--sl-primary-rgb": rgbP,
    "--sl-gold": accentHex,
    "--sl-gold-ink": hslToHex(...hexToHsl(accentHex).map((v, i) => i === 2 ? Math.max(v - 32, 12) : v) as [number, number, number]),
    "--sl-mint": hslToHex(h, Math.min(s * 0.45, 32), 95),
    "--sl-mint-2": hslToHex(h, Math.min(s * 0.55, 38), 91),
    "--sl-coral": "#a2191f",
    "--sl-ink": hslToHex(h, Math.min(s * 0.75, 62), Math.max(l - 14, 7)),
    "--sl-muted": hslToHex(h, Math.min(s * 0.35, 18), 44),
    "--sl-border": hslToHex(h, Math.min(s * 0.2, 16), 88),
    "--sl-border-soft": hslToHex(h, Math.min(s * 0.15, 10), 94),
    "--font-serif": stack,
    "--font-sans": stack,
    "--topbar-h": "66px",
    "--shadow-card": `0 1px 2px rgba(${rgbP}, 0.05), 0 8px 24px rgba(${rgbP}, 0.07)`,
    "--shadow-lift": `0 6px 14px rgba(${rgbP}, 0.08), 0 18px 40px rgba(${rgbP}, 0.12)`,
    "--brand-navy": primaryHex,
    "--brand-accent": accentHex,
  };

  const dark: Record<string, string> = {
    "--sl-cream": hslToHex(h, s, Math.max(l - 26, 6)),
    "--sl-cream-2": hslToHex(h, s, Math.max(l - 22, 9)),
    "--sl-white": hslToHex(h, s, Math.max(l - 17, 13)),
    "--sl-evergreen": hslToHex(h, Math.min(s * 0.35, 16), 94),
    "--sl-evergreen-2": hslToHex(h, Math.min(s * 0.28, 13), 87),
    "--sl-green": hslToHex(h, Math.min(s * 0.52, 40), 67),
    "--sl-green-dark": hslToHex(h, Math.min(s * 0.42, 34), 57),
    "--sl-primary-rgb": hexRgb(hslToHex(h, Math.min(s * 0.52, 40), 67)),
    "--sl-gold": accentHex,
    "--sl-gold-ink": hslToHex(h, s, Math.max(l - 26, 6)),
    "--sl-mint": hslToHex(h, s, Math.max(l - 20, 10)),
    "--sl-mint-2": hslToHex(h, s, Math.max(l - 16, 14)),
    "--sl-coral": "#f0616a",
    "--sl-ink": hslToHex(h, Math.min(s * 0.18, 9), 91),
    "--sl-muted": hslToHex(h, Math.min(s * 0.22, 16), 60),
    "--sl-border": hslToHex(h, Math.min(s * 0.45, 32), Math.max(l - 12, 20)),
    "--sl-border-soft": hslToHex(h, s, Math.max(l - 20, 11)),
    "--font-serif": stack,
    "--font-sans": stack,
    "--topbar-h": "66px",
    "--shadow-card": "0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.55)",
    "--shadow-lift": "0 6px 14px rgba(0, 0, 0, 0.6), 0 18px 40px rgba(0, 0, 0, 0.65)",
    "--brand-navy": primaryHex,
    "--brand-accent": accentHex,
  };

  return { light, dark };
}

function deriveSwaps(primary: string, accent: string) {
  const [h, s, l] = hexToHsl(primary);
  const [ah, as_, al] = hexToHsl(accent);

  const embedSwaps: [string, string][] = [
    ["#4F5BD5", accent],
    ["#3F49B8", hslToHex(ah, as_, Math.max(al - 10, 5))],
    ["#333C99", hslToHex(ah, as_, Math.max(al - 20, 5))],
    ["#22B8CF", hslToHex(h, Math.min(s * 0.55, 42), Math.min(l + 22, 72))],
    ["#0b0d10", hslToHex(h, s, Math.max(l - 28, 4))],
    ["#14181f", hslToHex(h, s, Math.max(l - 23, 8))],
    ["#1a212b", hslToHex(h, s, Math.max(l - 18, 12))],
    ["#232a34", hslToHex(h, s, Math.max(l - 13, 17))],
    ["#0b1f19", hslToHex(h, s, Math.max(l - 25, 7))],
    ["rgba(45,164,191,0.14)", `rgba(${hexRgb(accent)}, 0.16)`],
  ];

  const greenSwaps: [string, string][] = [
    ["#0f9a63", hslToHex(h, s, Math.max(l - 20, 11))],
    ["#0c8554", hslToHex(h, s, Math.max(l - 24, 7))],
    ["#d9ecea", hslToHex(h, Math.min(s * 0.28, 18), 93)],
    ["#cfe3e2", hslToHex(h, Math.min(s * 0.32, 20), 90)],
    ["#1bb978", hslToHex(h, Math.min(s * 0.62, 50), 65)],
    ["#15ae6e", primary],
  ];

  const cssSwaps: [string, string][] = [
    ["#0e1116", hslToHex(h, s, Math.max(l - 28, 4))],
    ["#10222a", hslToHex(h, s, Math.max(l - 25, 7))],
    ["#123047", hslToHex(h, s, Math.max(l - 20, 11))],
  ];

  return { embedSwaps, greenSwaps, cssSwaps };
}

// ── Content builder ───────────────────────────────────────────────────────────

function buildContent(s: WizardState, aiName: string) {
  const cols = s.filterColumns.split(/[,\n]/).map((c) => c.trim()).filter(Boolean);
  return {
    company: s.companyName,
    aiName,
    website: s.website,
    loginTitleHtml: s.tagline
      ? s.tagline.replace(/ for /, " for<br />")
      : `${s.companyName} Analytics`,
    landing: {
      eyebrow: s.companyName,
      headline: [{ text: s.tagline || `${s.companyName} analytics` }],
      subline: `Real-time analytics and AI-powered insights for ${s.companyName}.`,
      ctaLabel: "Explore analytics",
      stats: [
        { value: "Real-time", label: "Live Data" },
        { value: "AI", label: "Insights" },
        { value: "100%", label: "Your Data" },
      ],
    },
    loginSubtitle: s.tagline || `${s.companyName} analytics powered by ThoughtSpot.`,
    loginStats: [
      { value: "Real-time", label: "Live Data" },
      { value: "AI", label: "Insights" },
      { value: "100%", label: "Your Data" },
    ],
    loginCardSubtitle: "Sign in with your credentials",
    loginDemoNoteHtml: `<strong>Sign in</strong> with your username & password to continue.`,
    platformNav: [s.companyName],
    tabs: {
      home: "Home",
      myReports: "My Reports",
      analytics: "Analytics",
      inline: s.inlineTabName || "Insights",
      action: s.actionTabName || "Actions",
      ask: aiName,
      spotter: "Spotter",
    },
    analyticsSubtitle: `Your live ${s.companyName} analytics dashboard`,
    spotterSubtitle: `Ask questions about your ${s.companyName} data in natural language.`,
    inline: {
      subtitleReady: `${s.inlineDimensionColumn || "Items"} — select one to expand its insights`,
      subtitleIdle: `${s.inlineDimensionColumn || "Items"} overview`,
      loading: "Loading…",
      errorTitle: "Couldn't load data",
      errorMsg: "Unable to load data.",
      moreLabel: "View insights",
      hideLabel: "Hide insights",
    },
    filters: {
      primaryLabel: cols[0] || "Category",
      secondaryLabel: cols[1] || "Type",
    },
    sampleQuestions: [
      "Top items by revenue",
      "Trends over time",
      "Compare by category",
      "Recent activity",
    ],
    askWelcome: `Ask me anything about ${s.companyName} — your live data, trends, and insights.`,
    askEmptySub: `Ask any analytical question about your ${s.companyName} data.`,
    action: {
      label: s.actionButtonLabel || "Action",
      subtitlePrefix: `${s.companyName} data. Right-click a row and choose`,
      subtitleSuffix: "to open the workflow.",
      modalTitle: s.actionButtonLabel || "Action",
      modalLead: s.actionWorkflowDesc || "Complete this workflow.",
      submitLabel: "Submit",
      successTitle: "Submitted successfully",
    },
    chatbot: {
      welcome: `Hi! I'm ${aiName}. Ask me anything about your ${s.companyName} data.`,
      overview: s.tagline || `${s.companyName} analytics powered by ThoughtSpot.`,
      greetingExample: "show me the latest data",
      examples: ["top items this month", "trends over time"],
    },
    trialQuestionTrigger: s.monetizeTrigger || 3,
    upgradeReason: `Upgrade to ${s.companyName} Premium to unlock drill-down, Ask AI and downloads.`,
    analyticsKeywords: ["data", "analytics", "trends", "report", "insights"],
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildSpec(state: WizardState): Record<string, unknown> {
  const slug = state.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "demo";
  const aiName = state.aiName || `Ask ${state.companyName} AI`;

  const analyticsId = parseGuid(state.analyticsLiveboardInput);
  const worksheetId = parseGuid(state.worksheetInput);
  const inlineId = state.inlineEnabled ? parseGuid(state.inlineLiveboardInput) : "";
  const actionVizId = state.actionEnabled ? parseGuid(state.actionVizInput) : "";
  const actionLbId = state.actionEnabled
    ? parseGuid(state.actionLiveboardInput) || analyticsId
    : analyticsId;

  const cols = state.filterColumns.split(/[,\n]/).map((c) => c.trim()).filter(Boolean);
  const metrics = state.inlineMetrics.split(/[,\n]/).map((c) => c.trim()).filter(Boolean);

  const googleUrl =
    state.fontGoogleUrl ||
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(state.fontFamily)}:wght@400;500;600;700&display=swap`;

  const { light, dark } = deriveSlTheme(state.primaryColor, state.accentColor, state.fontFamily);
  const { embedSwaps, greenSwaps, cssSwaps } = deriveSwaps(state.primaryColor, state.accentColor);

  const [ph, , pl] = hexToHsl(state.primaryColor);
  const faviconFg = pl > 55 ? "#0f172a" : "#ffffff";
  const initial = (state.companyName[0] || "A").toUpperCase();
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="7" fill="${state.primaryColor}"/><text x="16" y="22" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${faviconFg}" text-anchor="middle">${initial}</text></svg>`;

  void ph; // used only for favicon lightness check above

  return {
    client: state.companyName,
    slug,
    host: parseHost(state.tsHost) || "YOUR-CLUSTER.thoughtspot.cloud",
    auth: state.auth,
    ids: {
      analyticsLiveboard: analyticsId || "REPLACE_MAIN_LIVEBOARD_GUID",
      model: worksheetId || "REPLACE_MODEL_GUID",
      inlineLiveboard: inlineId || "REPLACE_INLINE_LIVEBOARD_GUID",
      actionLiveboard: actionLbId || "REPLACE_ACTION_LIVEBOARD_GUID",
      actionViz: actionVizId || "REPLACE_ACTION_VIZ_GUID",
    },
    action: {
      id:
        (state.actionButtonLabel || "custom-action")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      name: state.actionButtonLabel || "Custom Action",
    },
    columns: {
      inlineName: state.inlineDimensionColumn
        ? [state.inlineDimensionColumn]
        : ["Name", "ID"],
      inlineMetrics: metrics.map((m) => ({
        label: m,
        format: "number",
        candidates: [m],
      })),
      filterPrimary: cols.slice(0, 2).length ? cols.slice(0, 2) : ["Category", "Type"],
      filterSecondary: cols.slice(2, 4).length ? cols.slice(2, 4) : ["Region", "Segment"],
      date: state.dateColumn || "Date",
      hierarchy: {
        segment: cols[0] || "Category",
        rep: cols[1] || "Type",
        cadence: state.inlineDimensionColumn || "Item",
      },
    },
    font: {
      family: state.fontFamily || "Inter",
      googleUrl,
    },
    logo: {
      svgPath: state.logoFile || `${slug}-logo.svg`,
    },
    favicon,
    theme: {
      default: state.defaultTheme,
      light,
      dark,
    },
    embedSwaps,
    greenSwaps,
    cssSwaps,
    features: {
      askMode:
        state.askMode === "chat"
          ? "fancy"
          : state.askMode === "spotter"
            ? "spotter"
            : "both",
      inline: state.mode === "advanced" && state.inlineEnabled,
      action: state.mode === "advanced" && state.actionEnabled,
      monetize: state.monetize,
      tiers: state.tiers,
      pinning: state.mode === "advanced" && state.addReport !== "none",
      home: true,
      navLayout: state.navLayout,
    },
    content: buildContent(state, aiName),
  };
}
