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
import { SearchEmbed } from "@thoughtspot/visual-embed-sdk/react";
import DemoLogin from "./DemoLogin";
import DemoEmbed from "./DemoEmbed";
import DphHsLanding from "./DphHsLanding";
import DphHsHeader, { DemoView } from "./DphHsHeader";
import DphHsSpotterPage from "./DphHsSpotterPage";
import GenericHeader from "./GenericHeader";
import RolePicker from "./RolePicker";
import DemoProfileMenu from "./DemoProfileMenu";

// Dynamic SpotterEmbed load for the DPHHS slide-in drawer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SpotterEmbed: React.ComponentType<any> | null = null;
if (typeof window !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpotterEmbed = require("@thoughtspot/visual-embed-sdk/react").SpotterEmbed ?? null;
  } catch {
    SpotterEmbed = null;
  }
}

import React from "react";

interface DemoPortalProps {
  demo: Demo;
}

export default function DemoPortal({ demo }: DemoPortalProps) {
  const legacyTheme = demo.theme;

  // In-session theme state
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

  // DPHHS-specific: which analysis view is active
  const [dphHsView, setDphHsView] = useState<DemoView>("liveboard");
  // DPHHS-specific: spotter slide-in drawer
  const [spotterOpen, setSpotterOpen] = useState(false);

  const logoUrl = legacyTheme?.logoUrl;
  const firstLiveboard = legacyTheme?.liveboards?.[0];

  const needsRolePicker =
    demo.trustedAuthEnabled &&
    demo.rlsRequired &&
    (demo.demoUsers?.length ?? 0) > 0;

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
        if (!res.ok || !data.token) throw new Error(data.error ?? "Failed to get auth token.");
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
    if (!res.ok) throw new Error(data.error ?? `Login failed (${res.status})`);
    init({ thoughtSpotHost: demo.tsInstance, authType: AuthType.None, customizations: tsCustomizations });
    setCurrentUser(username);
    setIsLoggedIn(true);
  }

  function handleRoleSelect(username: string) {
    setAuthError(null);
    try { initTrustedAuth(username); }
    catch (err) { setAuthError(err instanceof Error ? err.message : "Authentication failed."); }
  }

  async function handleLogout() {
    try { await fetch(`/api/demo/${demo.id}/logout`, { method: "POST", credentials: "include" }); } catch { /* ignore */ }
    setIsLoggedIn(false);
    setCurrentUser("");
  }

  function handleThemeChange(preset: ThemePreset) {
    setActiveThemeConfig({ preset });
  }

  const themeStyleBlock = <style dangerouslySetInnerHTML={{ __html: themeCSS }} />;

  // ── DPHHS landing page ─────────────────────────────────────────────────────
  if (showLanding) {
    return (
      <>
        {themeStyleBlock}
        <DphHsLanding onLogin={() => setShowLanding(false)} />
      </>
    );
  }

  // ── Role picker ────────────────────────────────────────────────────────────
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
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(185,28,28,0.1)", color: "#ef4444", padding: "12px 20px", borderRadius: "var(--portal-radius)", fontSize: 14, zIndex: 1001 }}>
            {authError}
          </div>
        )}
      </>
    );
  }

  // ── Trusted auth auto-login spinner ────────────────────────────────────────
  if (demo.trustedAuthEnabled && !needsRolePicker && !isLoggedIn) {
    return (
      <>
        {themeStyleBlock}
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--portal-font)", color: "var(--portal-text-muted)", fontSize: 15, gap: 12 }}>
          <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
          Loading portal…
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  // ── Classic login ──────────────────────────────────────────────────────────
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

  // ── DPHHS logged-in portal ─────────────────────────────────────────────────
  if (hasDphhs) {
    const showSpotterFab = demo.useSpotter && dphHsView !== "spotter-page";

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
          <DphHsHeader
            view={dphHsView}
            onViewChange={setDphHsView}
            tsInstance={demo.tsInstance}
            spotterName={demo.spotterName}
            useSpotter={demo.useSpotter}
          />

          <main style={{ flex: 1 }}>
            {/* Liveboard view */}
            {dphHsView === "liveboard" && firstLiveboard && (
              <DemoEmbed
                liveboardId={firstLiveboard.id}
                useSpotter={false}
                worksheetId={demo.worksheetId}
                reportDesigner={demo.reportDesigner}
                embedOptions={demo.embedOptions}
                hideSpotterFab
              />
            )}
            {dphHsView === "liveboard" && !firstLiveboard && (
              <div style={{ padding: "48px 32px", textAlign: "center", color: "#6c757d", fontSize: 15 }}>
                No liveboard configured for this demo yet.
              </div>
            )}

            {/* Report Builder (ad-hoc search) */}
            {dphHsView === "report-builder" && (
              <div style={{ height: "calc(100vh - 160px)" }}>
                <SearchEmbed
                  frameParams={{ width: "100%", height: "100%" }}
                  dataSources={demo.worksheetId ? [demo.worksheetId] : undefined}
                  hideDataSources={Boolean(demo.worksheetId)}
                />
              </div>
            )}

            {/* Spotter full page */}
            {dphHsView === "spotter-page" && (
              <DphHsSpotterPage
                worksheetId={demo.worksheetId}
                spotterName={demo.spotterName}
              />
            )}
          </main>

          {/* DPHHS footer strip */}
          <div style={{ background: "#112F60", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "6px 24px", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg" alt="Montana DPHHS" style={{ height: 36, width: 36 }} />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.08em" }}>
              MONTANA DEPARTMENT OF PUBLIC HEALTH &amp; HUMAN SERVICES
            </span>
          </div>
        </div>

        {/* ── Persistent Spotter FAB + drawer (only on non-spotter-page views) ── */}
        {showSpotterFab && (
          <>
            {/* Slide-in drawer */}
            <div
              style={{
                position: "fixed",
                top: 0,
                right: spotterOpen ? 0 : -460,
                width: 440,
                height: "100vh",
                background: "#fff",
                boxShadow: spotterOpen ? "-4px 0 32px rgba(0,0,0,0.18)" : "none",
                transition: "right 0.28s cubic-bezier(0.4,0,0.2,1)",
                zIndex: 400,
                display: "flex",
                flexDirection: "column",
                borderLeft: "1px solid #e5e7eb",
              }}
            >
              {/* Drawer header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", background: "#112F60", color: "#fff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.02em" }}>
                    {demo.spotterName ?? "Ask Clarity"}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.7, background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "2px 8px" }}>
                    AI Assistant
                  </span>
                </div>
                <button
                  onClick={() => setSpotterOpen(false)}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6, lineHeight: 1, borderRadius: 4, transition: "background 0.1s" }}
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* SpotterEmbed inside drawer */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                {spotterOpen && SpotterEmbed && demo.worksheetId ? (
                  <SpotterEmbed
                    worksheetId={demo.worksheetId}
                    frameParams={{ width: "100%", height: "100%" }}
                  />
                ) : spotterOpen && !demo.worksheetId ? (
                  <div style={{ padding: 24, color: "#6b7280", fontSize: 13, textAlign: "center", paddingTop: 48 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Worksheet not configured</p>
                    <p>Set a Worksheet / Model ID in the Edit Demo form to enable {demo.spotterName ?? "Ask Clarity"}.</p>
                  </div>
                ) : spotterOpen && !SpotterEmbed ? (
                  <div style={{ padding: 24, color: "#6b7280", fontSize: 14 }}>
                    Spotter is not available in this SDK version.
                  </div>
                ) : null}
              </div>
            </div>

            {/* FAB toggle */}
            <button
              onClick={() => setSpotterOpen((o) => !o)}
              aria-label={spotterOpen ? "Close Ask Clarity" : `Open ${demo.spotterName ?? "Ask Clarity"}`}
              style={{
                position: "fixed",
                bottom: 28,
                right: spotterOpen ? 456 : 28,
                transition: "right 0.28s cubic-bezier(0.4,0,0.2,1)",
                zIndex: 500,
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "#112F60",
                border: "2px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(17,47,96,0.55), 0 0 0 4px rgba(17,47,96,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              {spotterOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <path d="M8 10h8M8 14h5"/>
                </svg>
              )}
            </button>
          </>
        )}
      </>
    );
  }

  // ── Generic logged-in portal ───────────────────────────────────────────────
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
        <GenericHeader companyName={demo.companyName} logoUrl={logoUrl} />

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
            <div style={{ padding: "48px 32px", textAlign: "center", color: "var(--portal-text-muted)", fontSize: 15 }}>
              No liveboard configured for this demo yet.
            </div>
          )}
        </main>
      </div>
    </>
  );
}
