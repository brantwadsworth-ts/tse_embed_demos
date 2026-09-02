import type { VercelRequest, VercelResponse } from '@vercel/node';

const TS_HOST = 'https://kearney.thoughtspot.cloud';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const secret = process.env.TS_AUTH_SECRET_KEARNEY;
  if (!secret) {
    return res.status(500).json({ error: 'TS_AUTH_SECRET_KEARNEY not configured' });
  }

  // Verify user credentials against ThoughtSpot
  const loginRes = await fetch(`${TS_HOST}/api/rest/2.0/auth/session/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!loginRes.ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Issue a trusted auth token for the verified user (RLS applies per username)
  const tokenRes = await fetch(`${TS_HOST}/api/rest/2.0/auth/token/full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      username,
      validity_time_in_sec: 300,
      secret_key: secret,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return res.status(tokenRes.status).json({ error: text });
  }

  const data = await tokenRes.json();
  res.status(200).json({ token: data.token });
}
