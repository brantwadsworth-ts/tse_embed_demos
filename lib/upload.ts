// Uploads a file to Vercel Blob storage and returns the public URL.
// Returns null (no error thrown) if BLOB_READ_WRITE_TOKEN is not configured
// so callers can proceed without file storage in local dev.
export async function uploadToBlob(
  file: File,
  prefix: string,
): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { put } = await import("@vercel/blob");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`${prefix}/${safeName}`, file, { access: "public" });
    return blob.url;
  } catch (err) {
    console.error("Blob upload failed:", err);
    return null;
  }
}
