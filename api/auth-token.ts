import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'username required' });
  }

  const secret = process.env.TS_AUTH_SECRET_KEARNEY;
  if (!secret) {
    return res.status(500).json({ error: 'TS_AUTH_SECRET_KEARNEY not configured' });
  }

  const response = await fetch(
    'https://kearney.thoughtspot.cloud/api/rest/2.0/auth/token/full',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        username,
        validity_time_in_sec: 300,
        secret_key: secret,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    return res.status(response.status).json({ error: text });
  }

  const data = await response.json();
  res.status(200).json({ token: data.token });
}
