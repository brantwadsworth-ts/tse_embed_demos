import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/roles";

export interface ProvisionedUser {
  username: string;
  displayName: string;
  email: string;
  status: "created" | "failed";
  error?: string;
}

interface SequentialBody {
  instance: string;
  adminUsername: string;
  adminPassword: string;
  userPassword: string;
  mode: "sequential";
  prefix: string;
  count: number;
  startAt?: number;
  padZeros?: boolean;
  groupIdentifiers?: string[];
}

interface CsvBody {
  instance: string;
  adminUsername: string;
  adminPassword: string;
  userPassword: string;
  mode: "csv";
  emails: string[];
  groupIdentifiers?: string[];
}

type ProvisionBody = SequentialBody | CsvBody;

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

async function createTsUser(
  instance: string,
  token: string,
  name: string,
  displayName: string,
  email: string,
  password: string,
  groupIdentifiers?: string[],
): Promise<void> {
  const body: Record<string, unknown> = {
    name,
    display_name: displayName,
    email,
    password,
    account_type: "LOCAL_USER",
    account_status: "ACTIVE",
    trigger_welcome_email: false,
    trigger_activation_email: false,
  };
  if (groupIdentifiers?.length) body.group_identifiers = groupIdentifiers;

  const res = await fetch(`${instance}/api/rest/2.0/users/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text.slice(0, 300));
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || callerRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as ProvisionBody;

  const instance = (body.instance ?? "").replace(/\/+$/, "");
  if (!instance) return NextResponse.json({ error: "instance is required" }, { status: 400 });
  if (!body.adminUsername || !body.adminPassword)
    return NextResponse.json({ error: "Admin credentials are required" }, { status: 400 });
  if (!body.userPassword)
    return NextResponse.json({ error: "User password is required" }, { status: 400 });

  let token: string;
  try {
    token = await getAdminToken(instance, body.adminUsername, body.adminPassword);
  } catch (err) {
    return NextResponse.json({ error: String(err).replace(/^Error: /, "") }, { status: 502 });
  }

  const usersToCreate: Array<{ username: string; displayName: string; email: string }> = [];

  if (body.mode === "sequential") {
    const prefix = (body.prefix ?? "demo").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const count = Math.min(Math.max(1, body.count ?? 10), 100);
    const startAt = Math.max(1, body.startAt ?? 1);
    const pad = body.padZeros !== false;
    const width = String(startAt + count - 1).length;
    for (let i = startAt; i < startAt + count; i++) {
      const num = pad ? String(i).padStart(width, "0") : String(i);
      const username = `${prefix}_${num}`;
      const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      usersToCreate.push({ username, displayName: `${cap} ${num}`, email: `${username}@workshop.demo` });
    }
  } else if (body.mode === "csv") {
    const emails = (body.emails ?? []).map((e) => e.trim()).filter(Boolean);
    for (const email of emails) {
      const username = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase().slice(0, 60);
      usersToCreate.push({ username, displayName: email, email });
    }
  } else {
    return NextResponse.json({ error: "mode must be 'sequential' or 'csv'" }, { status: 400 });
  }

  const results: ProvisionedUser[] = [];
  for (const u of usersToCreate) {
    try {
      await createTsUser(
        instance,
        token,
        u.username,
        u.displayName,
        u.email,
        body.userPassword,
        body.groupIdentifiers,
      );
      results.push({ username: u.username, displayName: u.displayName, email: u.email, status: "created" });
    } catch (err) {
      results.push({
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        status: "failed",
        error: String(err).replace(/^Error: /, ""),
      });
    }
  }

  return NextResponse.json({ results });
}
