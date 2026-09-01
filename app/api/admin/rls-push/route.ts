import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import { getDemoById } from "@/lib/demos";
import { getBearerToken } from "@/lib/tsAuth";

interface PushResult {
  tsUsername: string;
  label: string;
  ok: boolean;
  error?: string;
}

// POST /api/admin/rls-push
// Pushes user attributes for each demoUser to ThoughtSpot REST API.
// Body: { demoId: string; adminPassword?: string }
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const role = await getRole(session.user.name);
  if (role !== "admin" && role !== "create") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({})) as {
    demoId?: string;
    adminUsername?: string;
    adminPassword?: string;
  };

  if (!body.demoId) {
    return NextResponse.json({ error: "demoId is required." }, { status: 400 });
  }

  const demo = await getDemoById(body.demoId);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const usersWithAttrs = (demo.demoUsers ?? []).filter(
    (u) => u.tsUsername && u.attributes && Object.keys(u.attributes).length > 0,
  );

  if (usersWithAttrs.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "No demo users with attributes to push.",
      results: [],
    });
  }

  // Get an admin-level bearer token to make user-update calls
  const adminUsername = body.adminUsername ?? demo.demoUsers?.[0]?.tsUsername;
  let adminToken: string;
  try {
    adminToken = await getBearerToken(demo.tsInstance, adminUsername!, body.adminPassword);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to authenticate with ThoughtSpot: ${String(err)}` },
      { status: 502 },
    );
  }

  const results: PushResult[] = await Promise.all(
    usersWithAttrs.map(async (user): Promise<PushResult> => {
      try {
        // ThoughtSpot REST v2: update user with custom properties/parameters
        // Ref: PUT /api/rest/2.0/users/{userIdentifier}
        const userAttrs = Object.entries(user.attributes!).map(([name, value]) => ({
          name,
          value,
        }));

        const res = await fetch(
          `${demo.tsInstance}/api/rest/2.0/users/${encodeURIComponent(user.tsUsername)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              user_identifier: user.tsUsername,
              update_type: "PARTIAL",
              user_parameters: userAttrs,
            }),
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          return {
            tsUsername: user.tsUsername,
            label: user.label,
            ok: false,
            error: `TS API ${res.status}: ${text.slice(0, 200)}`,
          };
        }

        return { tsUsername: user.tsUsername, label: user.label, ok: true };
      } catch (err) {
        return {
          tsUsername: user.tsUsername,
          label: user.label,
          ok: false,
          error: String(err),
        };
      }
    }),
  );

  const allOk = results.every((r) => r.ok);
  return NextResponse.json(
    { ok: allOk, results, pushed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length },
    { status: allOk ? 200 : 207 },
  );
}
