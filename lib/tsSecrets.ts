// Trusted auth secrets are stored as Vercel env vars, never in the UI or Blob.
// Naming convention: TS_AUTH_SECRET_<SLUG_UPPERCASED>
// Example: se-thoughtspot-cloud → TS_AUTH_SECRET_SE_THOUGHTSPOT_CLOUD

export function instanceSlug(tsInstance: string): string {
  try {
    return new URL(tsInstance).hostname.split(".")[0];
  } catch {
    return tsInstance.replace(/[^a-z0-9-]/gi, "-");
  }
}

function envKey(tsInstance: string): string {
  return `TS_AUTH_SECRET_${instanceSlug(tsInstance).toUpperCase().replace(/-/g, "_")}`;
}

export function getTsSecret(tsInstance: string): string | null {
  return process.env[envKey(tsInstance)] ?? null;
}

export function hasTsSecret(tsInstance: string): boolean {
  return !!process.env[envKey(tsInstance)];
}
