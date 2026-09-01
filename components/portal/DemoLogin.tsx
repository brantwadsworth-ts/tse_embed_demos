"use client";

import { useState, FormEvent, useEffect } from "react";

interface OGData {
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  favicon?: string;
}

interface DemoLoginProps {
  companyName: string;
  logoUrl?: string;
  website?: string;
  tsInstance?: string;
  credentialsHint?: string;
  onLogin: (username: string, password: string) => Promise<void>;
}

function instanceSubdomain(tsInstance?: string): string | null {
  if (!tsInstance) return null;
  try {
    const hostname = new URL(tsInstance).hostname;
    return hostname.replace(/\.thoughtspot(staging)?\.cloud$/, "");
  } catch {
    return null;
  }
}

export default function DemoLogin({
  companyName,
  logoUrl,
  website,
  tsInstance,
  credentialsHint,
  onLogin,
}: DemoLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ogData, setOgData] = useState<OGData | null>(null);

  const subdomain = instanceSubdomain(tsInstance);

  // Fetch OG metadata from the customer website
  useEffect(() => {
    if (!website) return;
    fetch(`/api/og-preview?url=${encodeURIComponent(website)}`)
      .then((r) => r.ok ? r.json() as Promise<OGData> : Promise.reject())
      .then((data) => setOgData(data))
      .catch(() => {});
  }, [website]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
      setLoading(false);
    }
  }

  const hasHero = Boolean(ogData?.ogImage);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
        fontFamily: "var(--portal-font)",
      }}
    >
      {/* ── Left brand panel ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0",
          minHeight: "100%",
          // Fallback: accent color background
          background: hasHero ? "var(--portal-accent)" : "var(--portal-accent)",
        }}
      >
        {/* Hero image from customer website */}
        {hasHero && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${ogData!.ogImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
        )}

        {/* Gradient overlay — always present so text is legible */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hasHero
              ? "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)"
              : "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 100%)",
          }}
        />

        {/* Content anchored to bottom */}
        <div
          style={{
            position: "relative",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain",
                objectPosition: "left",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
          )}

          <div>
            <p
              style={{
                fontSize: "34px",
                fontWeight: 800,
                margin: "0 0 6px",
                lineHeight: 1.1,
                color: "#ffffff",
                textShadow: hasHero ? "0 2px 12px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {companyName}
            </p>

            {/* Use the OG description when available, otherwise generic */}
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.75)",
                margin: 0,
                lineHeight: 1.6,
                maxWidth: "360px",
                textShadow: hasHero ? "0 1px 8px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {ogData?.ogDescription
                ? ogData.ogDescription.length > 120
                  ? ogData.ogDescription.slice(0, 117) + "…"
                  : ogData.ogDescription
                : "Sign in to access your analytics dashboard."}
            </p>
          </div>

          {/* Website pill */}
          {website && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "999px",
                padding: "5px 12px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.8)",
                letterSpacing: "0.02em",
                alignSelf: "flex-start",
              }}
            >
              {ogData?.favicon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ogData.favicon} alt="" style={{ width: "14px", height: "14px", objectFit: "contain" }} />
              )}
              {new URL(website).hostname.replace(/^www\./, "")}
            </div>
          )}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          background: "var(--portal-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            background: "var(--portal-surface)",
            border: "1px solid var(--portal-border)",
            borderRadius: "var(--portal-radius-lg)",
            boxShadow: "var(--portal-shadow-lg)",
            padding: "44px",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--portal-text)", margin: "0 0 6px" }}>
              Sign In
            </p>
            <p style={{ fontSize: "14px", color: "var(--portal-text-muted)", margin: 0 }}>
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && (
              <div
                style={{
                  background: "rgba(185,28,28,0.08)",
                  border: "1px solid rgba(185,28,28,0.25)",
                  color: "#ef4444",
                  fontSize: "13px",
                  padding: "10px 14px",
                  borderRadius: "var(--portal-radius)",
                }}
              >
                {error}
              </div>
            )}

            {(["Username", "Password"] as const).map((field) => (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--portal-text)" }}>
                  {field}
                </label>
                <input
                  type={field === "Password" ? "password" : "text"}
                  value={field === "Username" ? username : password}
                  onChange={(e) => field === "Username" ? setUsername(e.target.value) : setPassword(e.target.value)}
                  required
                  autoComplete={field === "Username" ? "username" : "current-password"}
                  style={{
                    width: "100%",
                    border: "1px solid var(--portal-border)",
                    borderRadius: "var(--portal-radius)",
                    padding: "11px 14px",
                    fontSize: "15px",
                    color: "var(--portal-text)",
                    background: "var(--portal-input-bg)",
                    outline: "none",
                    transition: "border-color 0.15s",
                    fontFamily: "var(--portal-font)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--portal-accent)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--portal-border)"; }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                border: "none",
                background: "var(--portal-accent)",
                color: "var(--portal-accent-fg)",
                fontSize: "15px",
                fontWeight: 700,
                padding: "13px",
                borderRadius: "var(--portal-radius)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.15s",
                fontFamily: "var(--portal-font)",
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Subtle metadata footer */}
          {(subdomain || credentialsHint) && (
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "3px", borderTop: "1px solid var(--portal-border)", paddingTop: "16px" }}>
              {credentialsHint && (
                <p style={{ fontSize: "11px", color: "var(--portal-text-muted)", margin: 0, opacity: 0.7 }}>
                  Hint: <span style={{ fontWeight: 500 }}>{credentialsHint}</span>
                </p>
              )}
              {subdomain && (
                <p style={{ fontSize: "11px", color: "var(--portal-text-muted)", margin: 0, opacity: 0.55, fontFamily: "monospace" }}>
                  {subdomain}.thoughtspot.cloud
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
