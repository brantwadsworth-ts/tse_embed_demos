"use client";

import { useState, useEffect } from "react";
import { Demo } from "@/lib/demos";
import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
import { initPortalTS, ensurePortalSession } from "@/lib/thoughtspot-portal";
import DemoLogin from "./DemoLogin";
import DemoEmbed from "./DemoEmbed";
import DphHsHeader from "./DphHsHeader";
import DphHsFooter from "./DphHsFooter";
import DphHsLanding from "./DphHsLanding";
import GenericHeader from "./GenericHeader";
import RolePicker from "./RolePicker";

interface DemoPortalProps {
  demo: Demo;
}

export default function DemoPortal({ demo }: DemoPortalProps) {
  const theme = demo.theme;
  const [showLanding, setShowLanding] = useState(theme?.custom === "dphhs");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // For trusted auth: null = not yet selected, string = chosen username
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const primaryColor = theme?.primaryColor ?? "#2770ef";
  const logoUrl = theme?.logoUrl;
  const firstLiveboard = theme?.liveboards?.[0];

  const needsRolePicker =
    demo.trustedAuthEnabled &&
    demo.rlsRequired &&
    (demo.demoUsers?.length ?? 0) > 0;

  // Auto-init trusted auth when no role picker is needed
  useEffect(() => {
    if (!demo.trustedAuthEnabled) return;
    if (needsRolePicker) return; // wait for role selection
    if (isLoggedIn) return;

    const defaultUsername =
      demo.demoUsers?.[0]?.tsUsername ?? "demo";

    initTrustedAuth(defaultUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.trustedAuthEnabled, needsRolePicker]);

  function initTrustedAuth(username: string) {
    init({
      thoughtSpotHost: demo.tsInstance,
      authType: AuthType.TrustedAuthTokenCookieless,
      getAuthToken: async () => {
        const res = await fetch(`/api/demo/${demo.id}/auth-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json() as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          throw new Error(data.error ?? "Failed to get auth token.");
        }
        return data.token;
      },
    });
    setIsLoggedIn(true);
  }

  async function handleLogin(username: string, password: string) {
    initPortalTS(demo.tsInstance, username, password);
    await ensurePortalSession(demo.tsInstance, username, password);
    setIsLoggedIn(true);
  }

  function handleRoleSelect(username: string) {
    setSelectedUsername(username);
    setAuthError(null);
    try {
      initTrustedAuth(username);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  // DPHHS landing page — shown before login/role selection
  if (showLanding) {
    return <DphHsLanding onLogin={() => setShowLanding(false)} />;
  }

  // Trusted auth: show role picker if needed and no role chosen yet
  if (demo.trustedAuthEnabled && needsRolePicker && !isLoggedIn) {
    return (
      <>
        <RolePicker
          demoUsers={demo.demoUsers!}
          companyName={demo.companyName}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
          onSelect={handleRoleSelect}
        />
        {authError && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fdecea",
              color: "#b3261e",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              zIndex: 1001,
            }}
          >
            {authError}
          </div>
        )}
      </>
    );
  }

  // Trusted auth auto-login: show loading spinner while waiting
  if (demo.trustedAuthEnabled && !needsRolePicker && !isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          color: "#6c757d",
          fontSize: "15px",
          gap: "12px",
        }}
      >
        <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>
          ⟳
        </span>
        Loading portal…
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Classic login form (trusted auth disabled)
  if (!isLoggedIn) {
    return (
      <DemoLogin
        companyName={demo.companyName}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        tsInstance={demo.tsInstance}
        credentialsHint={demo.credentialsHint}
        onLogin={handleLogin}
      />
    );
  }

  const hasDphhs = theme?.custom === "dphhs";

  // Logged in — show the portal
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {hasDphhs ? (
        <DphHsHeader />
      ) : (
        <GenericHeader
          companyName={demo.companyName}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
        />
      )}

      <main style={{ flex: 1 }}>
        {firstLiveboard ? (
          <DemoEmbed
            liveboardId={firstLiveboard.id}
            useSpotter={demo.useSpotter}
            spotterName={demo.spotterName}
            worksheetId={demo.worksheetId}
            reportDesigner={demo.reportDesigner}
          />
        ) : (
          <div
            style={{
              padding: "48px 32px",
              textAlign: "center",
              color: "#6c757d",
              fontSize: "15px",
            }}
          >
            No liveboard configured for this demo yet.
          </div>
        )}
      </main>

      {hasDphhs && (
        <div style={{
          background: "#112F60",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "6px 24px",
          flexShrink: 0,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg" alt="Montana DPHHS" style={{ height: 36, width: 36 }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.08em" }}>
            MONTANA DEPARTMENT OF PUBLIC HEALTH &amp; HUMAN SERVICES
          </span>
        </div>
      )}
    </div>
  );
}
