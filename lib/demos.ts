import { readDemos, writeDemos } from "./store";
import type { PortalThemeConfig } from "./portal-themes";

export interface DemoLiveboard {
  id: string;
  name: string;
}

export interface RlsRuleRow {
  table: string;
  column: string;
  operator: string;
  value: string;
}

export interface McpConnectorConfig {
  id: string;
  enabled: boolean;
  config?: Record<string, string>;
}

/** Patterns this demo demonstrates — used for gallery filtering and documentation */
export type EmbedPattern =
  | "inline-runtime-filter"   // Per-row liveboard expand with RuntimeFilterOp column filter
  | "custom-action"           // Context-menu action with custom modal/workflow
  | "host-side-filters"       // App-rendered filter dropdowns driving embed via HostEvent
  | "anthropic-chatbot"       // Floating chatbot backed by Anthropic API + TS tool use
  | "tier-gate"               // Premium/Basic tier feature gating
  | "dark-mode"               // Full light + dark theme with --ts-var-* overrides
  | "spotter-standalone"      // Full-page SpotterEmbed
  | "spotter-chatbot"         // SpotterEmbed with hidden input (driven by host chatbot)
  | "report-designer"         // SearchEmbed + PinModal Add Report flow
  | "my-liveboards"           // REST v2 liveboard list + create-new via TML import
  | "trusted-auth"            // AuthType.TrustedAuthTokenCookieless
  | "rls"                     // Row-Level Security via user attributes or ts_groups()
  | "full-app";               // AppEmbed (full ThoughtSpot shell)

export interface CustomAction {
  id: string;
  name: string;
  tabName?: string;
  vizId?: string;
  liveboardId?: string;
}

export interface DemoTheme {
  custom: "dphhs" | "salesloft" | null;
  primaryColor: string;
  logoUrl?: string;
  liveboards: DemoLiveboard[];
}

export interface DemoTable {
  name: string;
  columns: string[];
}

export interface DemoDataModel {
  warehouse?: string;
  cdw?: string;
  database?: string;
  schema?: string;
  tables?: DemoTable[];
}

export interface DemoUser {
  label: string;
  tsUsername: string;
  /** Custom TS user attributes used for parameterized RLS, e.g. { region: "Northeast" } */
  attributes?: Record<string, string>;
}

export interface EmbedOptions {
  hiddenActions?: string[];
  visibleActions?: string[];
  hideLiveboardHeader?: boolean;
  hideTabPanel?: boolean;
  showPrimaryNavbar?: boolean;
  disabledActions?: string[];
  disabledActionReason?: string;
}

export interface Demo {
  id: string;
  companyName: string;
  website?: string;
  useCase: string;
  sampleQuestions?: string[];
  screenshotUrls?: string[];
  sampleDataUrl?: string | null;
  rlsRequired: boolean;
  rlsRules?: string;
  useSpotter: boolean;
  spotterName?: string;
  reportDesigner: boolean;
  tsInstance: string;
  branch?: string;
  liveUrl?: string;
  status: "live" | "pending" | "building" | "draft" | "failed";
  createdAt: string;
  theme?: DemoTheme;
  owner?: string;
  embedType?: "liveboard" | "fullApp" | "search";
  dataModel?: DemoDataModel;
  prompt?: string;
  forkedFrom?: string;
  /** URL of this demo's GitHub source repo (may be a fork) */
  sourceRepo?: string;
  /** URL of the upstream repo this was forked/derived from */
  upstreamRepo?: string;
  trustedAuthEnabled?: boolean;
  credentialsHint?: string;
  demoUsers?: DemoUser[];
  worksheetId?: string;
  embedOptions?: EmbedOptions;
  themeConfig?: PortalThemeConfig;
  rlsRuleRows?: RlsRuleRow[];
  mcpConnectors?: McpConnectorConfig[];
  analystName?: string;
  /** Which embed SDK patterns this demo demonstrates */
  embedPatterns?: EmbedPattern[];
  /** Custom context-menu actions wired in this demo */
  customActions?: CustomAction[];
  /** Whether this demo uses an Anthropic-API-powered chatbot */
  anthropicEnabled?: boolean;
  anthropicModel?: string;
  /** Full --ts-var-* CSS variable overrides for the embedded TS surface */
  tsVarOverrides?: Record<string, string>;
  /** Dark-mode --ts-var-* CSS variable overrides */
  tsVarOverridesDark?: Record<string, string>;
  /** Tech stack note (e.g. "Vite + React" vs "Next.js") */
  techStack?: string;
  /** Notable feature highlights shown in the gallery */
  notableFeatures?: string[];
  /** Additional live URL (e.g. Coolify mirror) */
  coolifyUrl?: string;
}

export type { PortalThemeConfig };

export async function getAllDemos(): Promise<Demo[]> {
  return readDemos();
}

export async function getDemoById(id: string): Promise<Demo | null> {
  const all = await getAllDemos();
  return all.find((d) => d.id === id) ?? null;
}

export async function saveSubmission(demo: Demo): Promise<void> {
  const demos = await readDemos();
  demos.push(demo);
  await writeDemos(demos);
}

export async function updateDemoStatus(
  id: string,
  status: Demo["status"],
): Promise<void> {
  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx !== -1) {
    demos[idx].status = status;
    await writeDemos(demos);
  }
}

export async function updateDemoFields(
  id: string,
  fields: Partial<Pick<Demo, "status" | "branch" | "liveUrl">>,
): Promise<void> {
  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx !== -1) {
    demos[idx] = { ...demos[idx], ...fields };
    await writeDemos(demos);
  }
}
