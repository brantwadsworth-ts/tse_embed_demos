import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { setRole, getRole, Role } from "@/lib/roles";

const ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";
const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function POST(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || callerRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_ADMIN_TOKEN is not configured" },
      { status: 500 },
    );
  }

  let input: string;
  let role: Role = "create";
  try {
    const body = await req.json();
    input = (body?.input ?? body?.username ?? "").trim();
    const bodyRole = body?.role;
    if (bodyRole && ["admin", "create", "view"].includes(bodyRole)) {
      role = bodyRole as Role;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "GitHub username or email is required" }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  let username: string;
  let email: string | null = null;

  if (input.includes("@")) {
    // Input is an email — search GitHub for the matching user
    const searchRes = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(input)}+in:email&per_page=1`,
      { headers },
    );
    if (!searchRes.ok) {
      return NextResponse.json({ error: `GitHub search failed: ${searchRes.status}` }, { status: 502 });
    }
    const searchData = await searchRes.json() as { total_count: number; items: { login: string }[] };
    if (searchData.total_count === 0 || !searchData.items[0]) {
      return NextResponse.json(
        { error: `No GitHub account found for email "${input}". Ask them for their GitHub username instead.` },
        { status: 422 },
      );
    }
    username = searchData.items[0].login;
    email = input;
  } else {
    // Input is a GitHub username
    if (!USERNAME_RE.test(input)) {
      return NextResponse.json({ error: "Invalid GitHub username format" }, { status: 400 });
    }
    username = input;
    // Look up their public email from GitHub
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (userRes.status === 404) {
      return NextResponse.json({ error: `GitHub user "${username}" not found` }, { status: 422 });
    }
    if (!userRes.ok) {
      return NextResponse.json({ error: `Could not verify GitHub user: ${userRes.status}` }, { status: 502 });
    }
    const userData = await userRes.json() as { email?: string | null };
    email = userData.email ?? null;
  }

  // Set role in our store — this is the primary access grant
  try {
    await setRole(username, role);
  } catch (err) {
    console.error("setRole failed:", err);
    return NextResponse.json({ error: "Role assignment failed — check Blob storage configuration." }, { status: 500 });
  }

  // Also send GitHub org invite (best-effort)
  await fetch(`https://api.github.com/orgs/${ORG}/memberships/${username}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ role: "member" }),
  }).catch(() => {});

  // Send invite email via Resend (best-effort)
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY && email) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TSE Demo Builder <onboarding@resend.dev>",
        to: [email],
        subject: "You've been invited to TSE Embed Demos",
        html: emailHtml(username, role),
      }),
    }).catch((err) => console.error("Email send failed:", err));
  }

  return NextResponse.json({
    ok: true,
    username,
    emailSent: !!(RESEND_API_KEY && email),
    loginUrl: "https://tse-embed-demos.vercel.app/login",
  });
}

function emailHtml(username: string, role: string): string {
  const loginUrl = "https://tse-embed-demos.vercel.app/login";
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="width: 40px; height: 40px; background: #2770ef; border-radius: 10px; margin-bottom: 24px;">
    </div>
    <h1 style="margin: 0 0 8px; font-size: 22px; color: #111827;">You've been invited</h1>
    <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px;">
      You now have <strong>${role}</strong> access to the TSE Embed Demo Builder.
      Sign in with your GitHub account (<strong>@${username}</strong>) to get started.
    </p>
    <a href="${loginUrl}" style="display: inline-block; background: #2770ef; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">
      Access Demo Builder →
    </a>
    <p style="margin: 24px 0 0; color: #9ca3af; font-size: 13px;">
      If you weren't expecting this, you can ignore this email.
    </p>
  </div>
</body>
</html>`;
}
