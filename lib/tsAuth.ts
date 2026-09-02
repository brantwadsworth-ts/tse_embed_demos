import { getTsSecret } from "./tsSecrets";

/**
 * Returns a Bearer token for the given TS instance + user.
 * Tries trusted auth first (via TS_AUTH_SECRET_* env var), falls back to password.
 */
export async function getBearerToken(
  instance: string,
  username: string,
  password?: string,
): Promise<string> {
  const secret = getTsSecret(instance);

  if (secret) {
    const res = await fetch(`${instance}/callosum/v1/session/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret_key: secret, username, access_level: "FULL" }).toString(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Trusted auth failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return (await res.text()).trim();
  }

  if (!password) {
    throw new Error(
      `No trusted auth secret for this cluster. Add TS_AUTH_SECRET_${
        new URL(instance).hostname.split(".")[0].toUpperCase().replace(/-/g, "_")
      } to Vercel env vars, or provide a password.`,
    );
  }

  const loginRes = await fetch(`${instance}/api/rest/2.0/auth/token/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password, validity_time_in_sec: 1800 }),
  });
  if (!loginRes.ok) {
    const text = await loginRes.text().catch(() => loginRes.statusText);
    throw new Error(`Login failed (${loginRes.status}): ${text.slice(0, 200)}`);
  }
  const data = (await loginRes.json()) as { token?: string };
  if (!data.token) throw new Error("No token returned from ThoughtSpot login");
  return data.token;
}
