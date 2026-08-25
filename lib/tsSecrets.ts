import { put, list } from "@vercel/blob";

function blobKey(slug: string): string {
  return `ts-secrets/${slug}.json`;
}

export function instanceSlug(tsInstance: string): string {
  try {
    return new URL(tsInstance).hostname.split(".")[0];
  } catch {
    return tsInstance.replace(/[^a-z0-9-]/gi, "-");
  }
}

export async function getTsSecret(tsInstance: string): Promise<string | null> {
  const key = blobKey(instanceSlug(tsInstance));
  const { blobs } = await list({ prefix: key }).catch(() => ({ blobs: [] }));
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
  const data = await res.json();
  return (data as { secret?: string }).secret ?? null;
}

export async function saveTsSecret(
  tsInstance: string,
  secret: string,
): Promise<void> {
  const key = blobKey(instanceSlug(tsInstance));
  await put(key, JSON.stringify({ secret }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function hasTsSecret(tsInstance: string): Promise<boolean> {
  const key = blobKey(instanceSlug(tsInstance));
  const { blobs } = await list({ prefix: key }).catch(() => ({ blobs: [] }));
  return blobs.length > 0;
}
