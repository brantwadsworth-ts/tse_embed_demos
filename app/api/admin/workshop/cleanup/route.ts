import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/roles";

interface CleanupBody {
  instance: string;
  adminUsername: string;
  adminPassword: string;
  usernames: string[];
}

interface CleanupResult {
  username: string;
  status: "deleted" | "failed";
  error?: string;
}

async function getAdminToken(instance: string, username: string, password: string): Promise<string> {
  const res = await fetch(`${instance}/api/rest/2.0/auth/token/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password, validity_time_in_sec: 1800 }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Admin login failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("No token returned from ThoughtSpot login");
  return data.token;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || callerRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as CleanupBody;

  const instance = (body.instance ?? "").replace(/\/+$/, "");
  if (!instance) return NextResponse.json({ error: "instance is required" }, { status: 400 });
  if (!body.adminUsername || !body.adminPassword)
    return NextResponse.json({ error: "Admin credentials are required" }, { status: 400 });
  if (!Array.isArray(body.usernames) || body.usernames.length === 0)
    return NextResponse.json({ error: "usernames array is required" }, { status: 400 });

  let token: string;
  try {
    token = await getAdminToken(instance, body.adminUsername, body.adminPassword);
  } catch (err) {
    return NextResponse.json({ error: String(err).replace(/^Error: /, "") }, { status: 502 });
  }

  const results: CleanupResult[] = [];
  for (const username of body.usernames) {
    try {
      const res = await fetch(
        `${instance}/api/rest/2.0/users/${encodeURIComponent(username)}/delete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text.slice(0, 200));
      }
      results.push({ username, status: "deleted" });
    } catch (err) {
      results.push({ username, status: "failed", error: String(err).replace(/^Error: /, "") });
    }
  }

  return NextResponse.json({ results });
}
