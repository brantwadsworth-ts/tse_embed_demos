import { NextRequest, NextResponse } from "next/server";
import { upsertDemoUser } from "@/lib/demoUsers";
import { getSessionUser } from "@/lib/session";
import { onboardUser, userExists } from "@/lib/thoughtspot";

interface OnboardRequestBody {
  username?: string;
  displayName?: string;
  email?: string;
  role?: string;
  groupIdentifiers?: string[];
  variableValues?: Array<{ name: string; values: string[] }>;
}

export async function POST(request: NextRequest) {
  const adminUser = await getSessionUser();

  if (!adminUser || adminUser.role !== "Internal Admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body: OnboardRequestBody = await request.json();
  const username = body.username?.trim();

  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  // Only send variables the admin actually filled in -- an empty `values`
  // array is not a valid RLS variable value.
  const variableValues = (body.variableValues ?? []).filter(
    (variable) => variable.values.length > 0 && variable.values[0].trim() !== "",
  );

  const displayName = body.displayName?.trim() || username;
  const role = body.role?.trim() || "Coke User";

  try {
    const alreadyExisted = await userExists(adminUser.username, username);

    await onboardUser({
      username,
      displayName,
      email: body.email?.trim() || username,
      groupIdentifiers: body.groupIdentifiers ?? [],
      variableValues,
    });

    // Register in the demo app's own login store too, so this user can
    // actually sign into the app afterward -- ThoughtSpot user creation and
    // this app's login whitelist are two separate things.
    await upsertDemoUser({ username, displayName, role });

    return NextResponse.json({ created: !alreadyExisted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to onboard user." },
      { status: 502 },
    );
  }
}
