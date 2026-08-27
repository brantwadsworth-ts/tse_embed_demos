"use client";

import { useState, useEffect } from "react";
import { Demo } from "@/lib/demos";
import {
  resolveTheme,
  themeToCSS,
  themeToTSCustomizations,
  ThemePreset,
  PortalThemeConfig,
} from "@/lib/portal-themes";
import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
import DemoLogin from "./DemoLogin";
import DemoEmbed from "./DemoEmbed";
import DphHsHeader from "./DphHsHeader";
import DphHsLanding from "./DphHsLanding";
import GenericHeader from "./GenericHeader";
import RolePicker from "./RolePicker";
import DemoProfileMenu from "./DemoProfileMenu";

interface DemoPortalProps {
  demo: Demo;
}

export default function DemoPortal({ demo }: DemoPortalProps) {
  const legacyTheme = demo.theme;

  // In-session theme state — starts from saved config, can be changed via profile menu
  const [activeThemeConfig, setActiveThemeConfig] = useState<PortalThemeConfig>(
    demo.themeConfig ?? { preset: "light" },
  );

  const themeVars = resolveTheme(activeThemeConfig);
  const themeCSS = themeToCSS(themeVars);
  const tsCustomizations = themeToTSCustomizations(themeVars);

  const [showLanding, setShowLanding] = useState(legacyTheme?.custom === "dphhs");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const logoUrl = legacyTheme?.logoUrl;
  const firstLiveboard = legacyTheme?.liveboards?.[0];

  const needsRolePicker =
    demo.trustedAuthEnabled &&
    demo.rlsRequired &&
    (demo.demoUsers?.length ?? 0) > 0;

  // Auto-init trusted auth when no role picker is needed
  useEffect(() => {
    if (!demo.trustedAuthEnabled) return;
    if (needsRolePicker) return;
    if (isLoggedIn) return;

    const defaultUsername = demo.demoUsers?.[0]?.tsUsername ?? "demo";
    initTrustedAuth(defaultUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.trustedAuthEnabled, needsRolePicker]);

  function initTrustedAuth(username: string) {
    init({
      thoughtSpotHost: demo.tsInstance,
      authType: AuthType.TrustedAuthTokenCookieless,
      customizations: tsCustomizations,
      getAuthToken: async () => {
        const res = await fetch(`/api/demo/${demo.id}/auth-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          throw new Error(data.error ?? "Failed to get auth token.");
        }
        return data.token;
      },
    });
    setCurrentUser(username);
    setIsLoggedIn(true);
  }

  async function handleLogin(username: string, password: string) {
    const res = await fetch(`/api/demo/${demo.id}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? `Login failed (${res.status})`);
    }
    init({
      thoughtSpotHost: demo.tsInstance,
      authType: AuthType.None,
      customizations: tsCustomizations,
    });
    setCurrentUser(username);
    setIsLoggedIn(true);
  }

  function handleRoleSelect(username: string) {
    setAuthError(null);
    try {
      initTrustedAuth(username);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  async function handleLogout() {
    try {
      await fetch(`/api/demo/${demo.id}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore — we reset state regardless
    }
    setIsLoggedIn(false);
    setCurrentUser("");
  }

  function handleThemeChange(preset: ThemePreset) {
    setActiveThemeConfig({ preset });
  }

  // Inject theme CSS vars
  const themeStyleBlock = <style dangerouslySetInnerHTML={{ __html: themeCSS }} />;

  // DPHHS legacy landing page
  if (showLanding) {
    return (
      <>
        {themeStyleBlock}
        <DphHsLanding onLogin={() => setShowLanding(false)} />
      </>
    );
  }

  // Trusted auth: show role picker if needed
  if (demo.trustedAuthEnabled && needsRolePicker && !isLoggedIn) {
    return (
      <>
        {themeStyleBlock}
        <RolePicker
          demoUsers={demo.demoUsers!}
          companyName={demo.companyName}
          logoUrl={logoUrl}
          onSelect={handleRoleSelect}
        />
        {authError && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(185,28,28,0.1)",
              color: "#ef4444",
              padding: "12px 20px",
              borderRadius: "var(--portal-radius)",
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

  // Trusted auth auto-login: loading state
  if (demo.trustedAuthEnabled && !needsRolePicker && !isLoggedIn) {
    return (
      <>
        {themeStyleBlock}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--portal-font)",
            color: "var(--portal-text-muted)",
            fontSize: "15px",
            gap: "12px",
          }}
        >
          <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
          Loading portal…
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  // Classic login form (trusted auth disabled)
  if (!isLoggedIn) {
    return (
      <>
        {themeStyleBlock}
        <DemoLogin
          companyName={demo.companyName}
          logoUrl={logoUrl}
          website={demo.website}
          tsInstance={demo.tsInstance}
          credentialsHint={demo.credentialsHint}
          onLogin={handleLogin}
        />
      </>
    );
  }

  const hasDphhs = legacyTheme?.custom === "dphhs";

  // Logged in — show the portal
  return (
    <>
      {themeStyleBlock}
      <DemoProfileMenu
        demoId={demo.id}
        currentUser={currentUser}
        activePreset={activeThemeConfig.preset}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
      />
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {hasDphhs ? (
          <DphHsHeader />
        ) : (
          <GenericHeader companyName={demo.companyName} logoUrl={logoUrl} />
        )}

        <main style={{ flex: 1 }}>
          {firstLiveboard ? (
            <DemoEmbed
              liveboardId={firstLiveboard.id}
              useSpotter={demo.useSpotter}
              spotterName={demo.spotterName}
              worksheetId={demo.worksheetId}
              reportDesigner={demo.reportDesigner}
              embedOptions={demo.embedOptions}
            />
          ) : (
            <div
              style={{
                padding: "48px 32px",
                textAlign: "center",
                color: "var(--portal-text-muted)",
                fontSize: "15px",
              }}
            >
              No liveboard configured for this demo yet.
            </div>
          )}
        </main>

        {hasDphhs && (
          <div
            style={{
              background: "#112F60",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "6px 24px",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg"
              alt="Montana DPHHS"
              style={{ height: 36, width: 36 }}
            />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.08em" }}>
              MONTANA DEPARTMENT OF PUBLIC HEALTH &amp; HUMAN SERVICES
            </span>
          </div>
        )}
      </div>
    </>
  );
}
