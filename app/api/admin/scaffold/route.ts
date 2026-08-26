import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/roles";
import { getDemoById } from "@/lib/demos";

const ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ghRequest(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; ok: boolean; data: unknown }> {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

function b64(str: string): string {
  return Buffer.from(str).toString("base64");
}

async function pushFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const res = await ghRequest(token, "PUT", `/repos/${owner}/${repo}/contents/${path}`, {
    message,
    content: b64(content),
    ...(sha ? { sha } : {}),
  });
  if (!res.ok) {
    throw new Error(`Failed to push ${path}: ${JSON.stringify(res.data)}`);
  }
}

// Retry getting file SHA until the repo's initial commit is ready
async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  path: string,
  maxAttempts = 8,
): Promise<string | undefined> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await ghRequest(token, "GET", `/repos/${owner}/${repo}/contents/${path}`);
    if (res.ok) return (res.data as { sha?: string }).sha;
    if (res.status !== 404) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return undefined;
}

// ── Template files ────────────────────────────────────────────────────────────
// All template file contents are embedded here so the scaffold API is
// self-contained and never depends on filesystem access in Vercel.

const TEMPLATE: Record<string, string> = {
  ".gitignore": `# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# next.js
/.next/
/out/

# production
/build

# env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`,

  "package.json": JSON.stringify({
    name: "tse-demo",
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start", lint: "next lint" },
    dependencies: {
      "@thoughtspot/visual-embed-sdk": "^1.51.0",
      next: "^15.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@types/node": "^22",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      typescript: "^5",
    },
  }, null, 2),

  "tsconfig.json": JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2),

  "next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
`,

  "app/globals.css": `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
`,

  "app/layout.tsx": `import type { Metadata } from "next";
import config from "@/demo.config";
import "./globals.css";

export const metadata: Metadata = {
  title: config.companyName,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,

  "app/page.tsx": `import Portal from "@/components/Portal";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Portal />;
}
`,

  "app/api/auth-token/route.ts": `import { NextRequest, NextResponse } from "next/server";
import config from "@/demo.config";

export async function POST(request: NextRequest) {
  if (!config.trustedAuthEnabled) {
    return NextResponse.json({ error: "Trusted auth is not enabled." }, { status: 400 });
  }

  const secret = process.env.TS_AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "TS_AUTH_SECRET env var is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({})) as { username?: string };
  const username = body.username || config.defaultTsUsername;

  const tokenUrl = \`\${config.tsInstance}/callosum/v1/session/auth/token\`;
  const formBody = new URLSearchParams({
    secret_key: secret,
    username,
    access_level: "FULL",
  });

  let tsRes: Response;
  try {
    tsRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach ThoughtSpot." }, { status: 502 });
  }

  if (!tsRes.ok) {
    const text = await tsRes.text().catch(() => tsRes.statusText);
    console.error("TS token error:", tsRes.status, text);
    return NextResponse.json({ error: \`ThoughtSpot returned \${tsRes.status}.\` }, { status: 502 });
  }

  const token = await tsRes.text();
  return NextResponse.json({ token: token.trim() });
}
`,

  "components/Portal.tsx": `"use client";

import { useState, useEffect, useRef } from "react";
import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
import { LiveboardEmbed } from "@thoughtspot/visual-embed-sdk/react";
import config from "@/demo.config";

// Spotter is loaded lazily (full bundle) to avoid SSR issues
let SpotterEmbed: React.ComponentType<{ worksheetId: string; className?: string }> | null = null;
if (typeof window !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpotterEmbed = (require("@thoughtspot/visual-embed-sdk/react") as { SpotterEmbed?: typeof SpotterEmbed }).SpotterEmbed ?? null;
  } catch { /* SpotterEmbed unavailable in this SDK version */ }
}

function LoginForm({ onLogin }: { onLogin: (u: string, p: string) => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { primaryColor, companyName, logoUrl } = config;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onLogin(username, password);
    } catch {
      setError("Invalid credentials — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ width: 360, background: "white", borderRadius: 16, padding: 40, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} style={{ height: 40, marginBottom: 24, maxWidth: "100%", objectFit: "contain" }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: primaryColor, marginBottom: 24 }} />
        )}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{companyName}</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Sign in to access your dashboard</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" }}
              required autoFocus />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" }}
              required />
          </div>
          {error && <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "11px 0", borderRadius: 8, background: primaryColor, color: "white", fontWeight: 600, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Portal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [spotterOpen, setSpotterOpen] = useState(false);
  const initialized = useRef(false);
  const { primaryColor, companyName, logoUrl, tsInstance, liveboardId, useSpotter, spotterName, worksheetId, trustedAuthEnabled, defaultTsUsername } = config;

  useEffect(() => {
    if (!trustedAuthEnabled || initialized.current) return;
    initialized.current = true;
    init({
      thoughtSpotHost: tsInstance,
      authType: AuthType.TrustedAuthTokenCookieless,
      getAuthToken: async () => {
        const res = await fetch("/api/auth-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: defaultTsUsername }),
        });
        const data = await res.json() as { token?: string; error?: string };
        if (!res.ok || !data.token) throw new Error(data.error ?? "Auth failed");
        return data.token;
      },
    });
    setIsLoggedIn(true);
  }, [trustedAuthEnabled, tsInstance, defaultTsUsername]);

  async function handleLogin(username: string, password: string) {
    const res = await fetch(\`\${tsInstance}/callosum/v1/session/login\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, rememberme: false }),
    });
    if (!res.ok) throw new Error("Login failed");
    init({ thoughtSpotHost: tsInstance, authType: AuthType.None });
    setIsLoggedIn(true);
  }

  if (!trustedAuthEnabled && !isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (trustedAuthEnabled && !isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c757d", gap: 12 }}>
        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
        Loading portal…
        <style>{\`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}\`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={{ height: 56, background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0 }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} style={{ height: 32, maxWidth: 140, objectFit: "contain" }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: primaryColor }} />
        )}
        <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{companyName}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>Powered by ThoughtSpot</span>
      </header>

      <main style={{ flex: 1 }}>
        {liveboardId ? (
          <LiveboardEmbed liveboardId={liveboardId} fullHeight style={{ width: "100%" }} />
        ) : (
          <div style={{ padding: "64px 32px", textAlign: "center", color: "#9ca3af", fontSize: 15 }}>
            No liveboard configured. Set <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>liveboardId</code> in <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>demo.config.ts</code>.
          </div>
        )}
      </main>

      {useSpotter && SpotterEmbed && worksheetId && (
        <>
          <button
            onClick={() => setSpotterOpen((o) => !o)}
            style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: primaryColor, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 1000 }}
            title={spotterName}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0.6"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          </button>
          <div style={{ position: "fixed", top: 0, right: spotterOpen ? 0 : -440, width: 420, height: "100vh", background: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", transition: "right 0.25s ease", zIndex: 999, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e5e7eb", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: primaryColor }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{spotterName}</span>
              <button onClick={() => setSpotterOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <SpotterEmbed worksheetId={worksheetId} className="h-full w-full" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
`,
};

// ── Demo config generator ─────────────────────────────────────────────────────

function generateDemoConfig(demo: {
  companyName: string;
  tsInstance: string;
  liveboardId?: string;
  useSpotter?: boolean;
  spotterName?: string;
  worksheetId?: string;
  primaryColor?: string;
  logoUrl?: string;
  trustedAuthEnabled?: boolean;
  defaultTsUsername?: string;
}): string {
  const liveboardId = demo.liveboardId ?? "";
  const spotterName = demo.spotterName ?? "Spotter";
  const primaryColor = demo.primaryColor ?? "#2770ef";
  const logoUrl = demo.logoUrl ?? "";
  const worksheetId = demo.worksheetId ?? "";
  const defaultTsUsername = demo.defaultTsUsername ?? "demo";

  return `// ─────────────────────────────────────────────────────────────
// Demo configuration
// ─────────────────────────────────────────────────────────────
const config = {
  companyName: ${JSON.stringify(demo.companyName)},
  tsInstance: ${JSON.stringify(demo.tsInstance)},
  liveboardId: ${JSON.stringify(liveboardId)},
  useSpotter: ${demo.useSpotter ? "true" : "false"},
  spotterName: ${JSON.stringify(spotterName)},
  worksheetId: ${JSON.stringify(worksheetId)},
  primaryColor: ${JSON.stringify(primaryColor)},
  logoUrl: ${JSON.stringify(logoUrl)},
  trustedAuthEnabled: ${demo.trustedAuthEnabled ? "true" : "false"},
  defaultTsUsername: ${JSON.stringify(defaultTsUsername)},
} as const;

export default config;
`;
}

function generateReadme(companyName: string, repoName: string): string {
  return `# ${companyName} — ThoughtSpot Embed Portal

A standalone ThoughtSpot Embed demo portal for **${companyName}**.

Scaffolded by [TSE Embed Demo Builder](https://tse-embed-demos.vercel.app) from the \`${repoName}\` demo.

## Quick start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

Edit [\`demo.config.ts\`](./demo.config.ts) to change any demo settings.

## Trusted Auth

When \`trustedAuthEnabled: true\`, add \`TS_AUTH_SECRET\` to your Vercel environment variables.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || (callerRole !== "admin" && callerRole !== "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_ADMIN_TOKEN is not configured" }, { status: 500 });
  }

  let demoId: string;
  try {
    const body = await req.json() as { demoId?: string };
    demoId = (body.demoId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!demoId) {
    return NextResponse.json({ error: "demoId is required" }, { status: 400 });
  }

  const demo = await getDemoById(demoId);
  if (!demo) {
    return NextResponse.json({ error: `Demo "${demoId}" not found` }, { status: 404 });
  }

  // Derive repo name
  const baseRepoName = `${slugify(demo.companyName)}-demo`;
  let repoName = baseRepoName;

  // Check if repo already exists, suffix with timestamp if needed
  const existingCheck = await ghRequest(token, "GET", `/repos/${ORG}/${repoName}`);
  if (existingCheck.ok) {
    repoName = `${baseRepoName}-${Date.now().toString(36)}`;
  }

  // Create the repo
  const createRes = await ghRequest(token, "POST", `/orgs/${ORG}/repos`, {
    name: repoName,
    description: `ThoughtSpot embed demo for ${demo.companyName}`,
    private: false,
    auto_init: true, // creates initial commit so we can push files
  });

  if (!createRes.ok) {
    const errData = createRes.data as { message?: string };
    return NextResponse.json(
      { error: `Failed to create repo: ${errData.message ?? JSON.stringify(createRes.data)}` },
      { status: 502 },
    );
  }

  const repoUrl = `https://github.com/${ORG}/${repoName}`;

  // Wait a moment for the initial commit to be ready
  await new Promise((r) => setTimeout(r, 2500));

  // Get SHA of the auto-generated README.md so we can overwrite it
  const readmeSha = await getFileSha(token, ORG, repoName, "README.md");

  // Push all template files
  const firstLiveboard = demo.theme?.liveboards?.[0];
  const demoConfigForTemplate = {
    companyName: demo.companyName,
    tsInstance: demo.tsInstance,
    liveboardId: firstLiveboard?.id ?? "",
    useSpotter: demo.useSpotter,
    spotterName: demo.spotterName,
    worksheetId: demo.worksheetId,
    primaryColor: demo.theme?.primaryColor,
    logoUrl: demo.theme?.logoUrl,
    trustedAuthEnabled: demo.trustedAuthEnabled,
    defaultTsUsername: demo.demoUsers?.[0]?.tsUsername ?? "demo",
  };

  const filesToPush: Array<{ path: string; content: string; sha?: string }> = [
    ...Object.entries(TEMPLATE).map(([path, content]) => ({ path, content })),
    { path: "demo.config.ts", content: generateDemoConfig(demoConfigForTemplate) },
    { path: "README.md", content: generateReadme(demo.companyName, demoId), sha: readmeSha },
  ];

  const errors: string[] = [];
  for (const file of filesToPush) {
    try {
      await pushFile(token, ORG, repoName, file.path, file.content, `Add ${file.path}`, file.sha);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  if (errors.length > 0) {
    // Return partial success — repo exists but some files may be missing
    return NextResponse.json(
      { ok: true, repoUrl, repoName, warnings: errors },
      { status: 207 },
    );
  }

  return NextResponse.json({ ok: true, repoUrl, repoName });
}
