import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import { getBearerToken } from "@/lib/tsAuth";

interface UserEntry {
  email: string;
  displayName?: string;
}

interface GroupInput {
  name: string;
  displayName: string;
  users: UserEntry[];
}

interface ProvisionResult {
  groupName: string;
  created: number;
  skipped: number;
  errors: string[];
}

async function tsPost(host: string, token: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${host}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function ensureGroup(
  host: string,
  token: string,
  name: string,
  displayName: string,
): Promise<void> {
  const res = await tsPost(host, token, "/api/rest/2.0/groups/create", {
    name,
    display_name: displayName,
    type: "LOCAL_GROUP",
    visibility: "SHARABLE",
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text().catch(() => "");
    throw new Error(`Group create failed (${res.status}): ${text.slice(0, 200)}`);
  }
  // 409 = already exists — that's fine
}

async function addUserToGroup(
  host: string,
  token: string,
  groupName: string,
  email: string,
): Promise<void> {
  // Use the group update endpoint to add a user by their username (email)
  const res = await tsPost(host, token, "/api/rest/2.0/groups/updateusers", {
    group_identifier: groupName,
    operation: "ADD",
    user_identifiers: [email],
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text().catch(() => "");
    throw new Error(`Add to group failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

async function createUser(
  host: string,
  token: string,
  email: string,
  displayName: string,
  password: string,
  groupName: string,
): Promise<"created" | "existed"> {
  const res = await tsPost(host, token, "/api/rest/2.0/users/create", {
    name: email,
    display_name: displayName,
    email,
    password,
    visibility: "SHARABLE",
    account_type: "LOCAL_USER",
    account_status: "ACTIVE",
    groups: [{ name: groupName }],
  });

  if (res.ok) return "created";

  if (res.status === 409) {
    // User exists — try adding them to the group separately
    await addUserToGroup(host, token, groupName, email);
    return "existed";
  }

  const text = await res.text().catch(() => "");
  throw new Error(`User create failed (${res.status}): ${text.slice(0, 200)}`);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getRole(login);
  if (role !== "admin" && role !== "create") {
    return NextResponse.json({ error: "Admin or create role required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    tsHost: string;
    tsUsername?: string;
    tsPassword?: string;
    defaultPassword: string;
    groups: GroupInput[];
  };

  const { tsHost, tsUsername, tsPassword, defaultPassword, groups } = body;

  if (!tsHost || !defaultPassword || !Array.isArray(groups) || groups.length === 0) {
    return NextResponse.json({ error: "tsHost, defaultPassword, and groups are required" }, { status: 400 });
  }

  const host = tsHost.startsWith("http") ? tsHost : `https://${tsHost}`;

  const token = await getBearerToken(host, tsUsername ?? "", tsPassword).catch(() => null);
  if (!token) {
    return NextResponse.json(
      { error: "Could not authenticate with ThoughtSpot. Check host / credentials." },
      { status: 401 },
    );
  }

  const results: ProvisionResult[] = [];

  for (const group of groups) {
    const result: ProvisionResult = {
      groupName: group.name,
      created: 0,
      skipped: 0,
      errors: [],
    };

    // Ensure group exists
    try {
      await ensureGroup(host, token, group.name, group.displayName);
    } catch (e) {
      result.errors.push(`Group creation: ${String(e)}`);
      results.push(result);
      continue;
    }

    // Create / assign each user
    for (const user of group.users) {
      const displayName =
        user.displayName ??
        user.email
          .split("@")[0]
          .split(/[._\-]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

      try {
        const status = await createUser(host, token, user.email, displayName, defaultPassword, group.name);
        if (status === "created") {
          result.created++;
        } else {
          result.skipped++;
        }
      } catch (e) {
        result.errors.push(`${user.email}: ${String(e)}`);
      }
    }

    results.push(result);
  }

  return NextResponse.json({ results });
}
