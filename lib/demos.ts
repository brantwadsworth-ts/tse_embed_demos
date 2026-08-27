import { readDemos, writeDemos } from "./store";
import type { PortalThemeConfig } from "./portal-themes";

export interface DemoLiveboard {
  id: string;
  name: string;
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
  status: "live" | "pending" | "building" | "draft";
  createdAt: string;
  theme?: DemoTheme;
  owner?: string;
  embedType?: "liveboard" | "fullApp" | "search";
  dataModel?: DemoDataModel;
  prompt?: string;
  forkedFrom?: string;
  trustedAuthEnabled?: boolean;
  credentialsHint?: string;
  demoUsers?: DemoUser[];
  worksheetId?: string;
  embedOptions?: EmbedOptions;
  themeConfig?: PortalThemeConfig;
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
