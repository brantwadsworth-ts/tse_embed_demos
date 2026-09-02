import { list, put } from "@vercel/blob";
import { readFileSync } from "fs";
import path from "path";
import { Demo } from "./demos";

const BLOB_KEY = "demos.json";
const SEED_PATH = path.join(process.cwd(), "data", "demos.json");

export async function readDemos(): Promise<Demo[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
      return res.json();
    }
    // Blob store exists but empty — seed it
    const demos = JSON.parse(readFileSync(SEED_PATH, "utf8")) as Demo[];
    await writeDemos(demos);
    return demos;
  } catch {
    // Blob not configured or unavailable — fall back to static file (read-only)
    return JSON.parse(readFileSync(SEED_PATH, "utf8")) as Demo[];
  }
}

export async function writeDemos(demos: Demo[]): Promise<void> {
  try {
    await put(BLOB_KEY, JSON.stringify(demos, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("BLOB_READ_WRITE_TOKEN") || msg.includes("token") || msg.includes("unauthorized")) {
      throw new Error(
        "Vercel Blob storage is not configured. Add a Blob store to this project in the Vercel dashboard (Storage → Create → Blob) to enable demo creation.",
      );
    }
    throw err;
  }
}
