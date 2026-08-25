import { list, put, del } from "@vercel/blob";

function blobKey(login: string) {
  return `apikeys/${login}.json`;
}

export async function saveApiKey(login: string, key: string): Promise<void> {
  await put(blobKey(login), JSON.stringify({ key }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function getApiKey(login: string): Promise<string | null> {
  const { blobs } = await list({ prefix: blobKey(login) }).catch(() => ({ blobs: [] }));
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
  const data = await res.json();
  return data.key ?? null;
}

export async function hasApiKey(login: string): Promise<boolean> {
  const { blobs } = await list({ prefix: blobKey(login) }).catch(() => ({ blobs: [] }));
  return blobs.length > 0;
}

export async function deleteApiKey(login: string): Promise<void> {
  const { blobs } = await list({ prefix: blobKey(login) }).catch(() => ({ blobs: [] }));
  if (blobs.length > 0) {
    await del(blobs[0].url);
  }
}
