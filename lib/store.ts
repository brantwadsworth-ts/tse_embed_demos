import { list, put } from "@vercel/blob";
import { readFileSync } from "fs";
import path from "path";
import { Demo } from "./demos";

const BLOB_KEY = "demos.json";
const SEED_PATH = path.join(process.cwd(), "data", "demos.json");

export async function readDemos(): Promise<Demo[]> {
  const { blobs } = await list({ prefix: BLOB_KEY }).catch(() => ({ blobs: [] }));
  if (blobs.length > 0) {
    const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
    return res.json();
  }
  // Seed from static file and upload to blob
  const raw = readFileSync(SEED_PATH, "utf8");
  const demos = JSON.parse(raw) as Demo[];
  await writeDemos(demos);
  return demos;
}

export async function writeDemos(demos: Demo[]): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(demos, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
