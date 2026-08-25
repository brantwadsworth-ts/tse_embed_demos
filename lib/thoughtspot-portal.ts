import { init, AuthType } from "@thoughtspot/visual-embed-sdk";

export function initPortalTS(
  host: string,
  username: string,
  password: string,
): void {
  init({
    thoughtSpotHost: host,
    authType: AuthType.Basic,
    username,
    password,
  });
}

export async function ensurePortalSession(
  host: string,
  username: string,
  password: string,
): Promise<void> {
  const url = `${host}/callosum/v1/session/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`ThoughtSpot login failed (${res.status}): ${text}`);
  }
}
