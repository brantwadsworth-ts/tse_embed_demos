import { promises as fs } from "fs";
import path from "path";

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
  status: "live" | "pending" | "building" | "draft";
  createdAt: string;
}

const SEED_FILE = path.join(process.cwd(), "data", "demos.json");
const SUBMISSIONS_FILE = process.env.VERCEL
  ? "/tmp/demo-submissions.json"
  : path.join(process.cwd(), "data", "submissions.json");

export async function getSeedDemos(): Promise<Demo[]> {
  try {
    const raw = await fs.readFile(SEED_FILE, "utf8");
    return JSON.parse(raw) as Demo[];
  } catch {
    return [];
  }
}

export async function getSubmissions(): Promise<Demo[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_FILE, "utf8");
    return JSON.parse(raw) as Demo[];
  } catch {
    return [];
  }
}

export async function getAllDemos(): Promise<Demo[]> {
  const [seeds, submissions] = await Promise.all([getSeedDemos(), getSubmissions()]);
  return [...seeds, ...submissions];
}

export async function updateDemoStatus(
  id: string,
  status: Demo["status"],
): Promise<void> {
  const submissions = await getSubmissions();
  const idx = submissions.findIndex((d) => d.id === id);
  if (idx !== -1) {
    submissions[idx].status = status;
    await fs.mkdir(path.dirname(SUBMISSIONS_FILE), { recursive: true });
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
  }
}

export async function saveSubmission(demo: Demo): Promise<void> {
  const submissions = await getSubmissions();
  submissions.push(demo);
  await fs.mkdir(path.dirname(SUBMISSIONS_FILE), { recursive: true });
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}
