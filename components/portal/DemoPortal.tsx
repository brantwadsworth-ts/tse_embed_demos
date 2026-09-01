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
import { SearchEmbed, AppEmbed } from "@thoughtspot/visual-embed-sdk/react";
import DemoLogin from "./DemoLogin";
import DemoEmbed from "./DemoEmbed";
import DphHsLanding from "./DphHsLanding";
import DphHsHeader, { AnalysisView, buildAnalysisMenu } from "./DphHsHeader";
import DphHsSpotterPage from "./DphHsSpotterPage";
import GenericHeader from "./GenericHeader";
import RolePicker from "./RolePicker";
import DemoProfileMenu from "./DemoProfileMenu";

import React from "react";

// Dynamic SpotterEmbed load
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

// ── Height constants ─────────────────────────────────────────────────────────
// Subtract header + footer heights so embeds fit within the viewport without
// clipping and the footer always sits below the content.
// DPHHS:   utility-bar(30) + brand-row(96) + nav-row(40) + footer-bar(52) ≈ 220px
// Generic: header(60) + tab-bar(44) ≈ 108px (no persistent footer there)
const DPHHS_EMBED_HEIGHT = "calc(100vh - 220px)";
const GENERIC_EMBED_HEIGHT = "calc(100vh - 108px)";

// ── The embed renderer shared by both portal types ──────────────────────────
function AnalysisPane({
  view,
  demo,
  effectiveWorksheetId,
  embedHeight,
  firstLiveboardId,
}: {
  view: AnalysisView;
  demo: Demo;
  effectiveWorksheetId: string | undefined;
  embedHeight: string;
  firstLiveboardId: string | undefined;
}) {
  const unavailableMsg = (title: string, detail: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: embedHeight, gap: 12, color: "var(--portal-text-muted)", fontSize: 14, textAlign: "center", padding: "0 32px" }}>
      <span style={{ fontSize: 32 }}>⚙️</span>
      <strong style={{ fontSize: 16, color: "var(--portal-text)" }}>{title}</strong>
      <p style={{ maxWidth: 400, lineHeight: 1.6, margin: 0 }}>{detail}</p>
    </div>
  );

  switch (view) {
    case "interactive-analysis":
      return firstLiveboardId ? (
        <DemoEmbed
          liveboardId={firstLiveboardId}
          useSpotter={false}
          worksheetId={effectiveWorksheetId}
          reportDesigner={false}
          embedOptions={demo.embedOptions}
          hideSpotterFab
        />
      ) : (
        unavailableMsg("No Liveboard Configured", "Add a liveboard to this demo in the Edit Demo form to enable Interactive Analysis.")
      );

    case "report-designer":
      return (
        <SearchEmbed
          frameParams={{ width: "100%", height: embedHeight }}
          dataSources={effectiveWorksheetId ? [effectiveWorksheetId] : undefined}
          hideDataSources={Boolean(effectiveWorksheetId)}
        />
      );

    case "my-reports":
      return (
        <AppEmbed
          frameParams={{ width: "100%", height: embedHeight }}
          path="/answers"
          showPrimaryNavbar={false}
        />
      );

    case "spotter":
      return (
        <DphHsSpotterPage
          worksheetId={effectiveWorksheetId}
          spotterName={demo.spotterName}
        />
      );

    case "agents":
      return (
        <AppEmbed
          frameParams={{ width: "100%", height: embedHeight }}
          path="/agent"
          showPrimaryNavbar={false}
        />
      );

    case "analysts":
      return demo.analystName ? (
        SpotterEmbed && effectiveWorksheetId ? (
          <div style={{ height: embedHeight, display: "flex", flexDirection: "column" }}>
            <div style={{ background: "var(--portal-surface)", borderBottom: "1px solid var(--portal-border)", padding: "10px 20px", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--portal-accent)" }}>
                <circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/><path d="M16 11l1.5 1.5L20 9"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--portal-text)" }}>Analyst: {demo.analystName}</span>
            </div>
            <SpotterEmbed
              worksheetId={effectiveWorksheetId}
              frameParams={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          unavailableMsg("Analyst View", !effectiveWorksheetId
            ? "A worksheet must be configured to use the Analyst view."
            : "SpotterEmbed is not available in this SDK version.")
        )
      ) : (
        unavailableMsg(
          "No Analyst Assigned",
          "Set an Analyst Name in the demo settings (ThoughtSpot section) to enable this view."
        )
      );

    default:
      return null;
  }
}

// ── Generic tab bar ─────────────────────────────────────────────────────────
function GenericTabBar({
  view,
  onViewChange,
  demo,
}: {
  view: AnalysisView;
  onViewChange: (v: AnalysisView) => void;
  demo: Demo;
}) {
  const menu = buildAnalysisMenu({ spotterName: demo.spotterName, analystName: demo.analystName });

  return (
    <div style={{
      background: "var(--portal-surface)",
      borderBottom: "1px solid var(--portal-border)",
      display: "flex",
      gap: 0,
      padding: "0 20px",
      flexShrink: 0,
      overflowX: "auto",
    }}>
      {menu.map((item) => {
        const active = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            disabled={!item.available}
            style={{
              background: "none",
              border: "none",
              borderBottom: active ? "2px solid var(--portal-accent)" : "2px solid transparent",
              color: !item.available
                ? "var(--portal-text-muted)"
                : active
                  ? "var(--portal-accent)"
                  : "var(--portal-text-muted)",
              fontWeight: active ? 700 : 500,
              fontSize: 13,
              padding: "10px 14px 8px",
              cursor: item.available ? "pointer" : "not-allowed",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              opacity: !item.available ? 0.45 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.15s, border-color 0.15s",
              fontFamily: "var(--portal-font)",
            }}
            title={!item.available ? item.unavailableReason : item.description}
          >
            <span style={{ opacity: 0.7, display: "flex", alignItems: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main portal ─────────────────────────────────────────────────────────────

interface DemoPortalProps {
  demo: Demo;
}

export default function DemoPortal({ demo }: DemoPortalProps) {
  const legacyTheme = demo.theme;

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

  // Unified view state — shared between DPHHS and generic portals
  const [activeView, setActiveView] = useState<AnalysisView>("interactive-analysis");

  // DPHHS: spotter slide-in drawer (FAB-triggered, separate from the full spotter tab)
  const [spotterOpen, setSpotterOpen] = useState(false);

  // Auto-resolved worksheetId from the first liveboard
  const [resolvedWorksheetId, setResolvedWorksheetId] = useState<string | null>(null);

  const logoUrl = legacyTheme?.logoUrl;
  const firstLiveboard = legacyTheme?.liveboards?.[0];
  const effectiveWorksheetId = demo.worksheetId ?? resolvedWorksheetId ?? undefined;

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

  useEffect(() => {
    if (!isLoggedIn) return;
    if (demo.worksheetId) return;
    if (!firstLiveboard?.id) return;
    fetch(`/api/demo/${demo.id}/liveboard-source?liveboardId=${firstLiveboard.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { worksheetId?: string | null }) => { if (d.worksheetId) setResolvedWorksheetId(d.worksheetId); })
      .catch(() => {});
  }, [isLoggedIn, demo.id, demo.worksheetId, firstLiveboard?.id]);

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
    try { await fetch(`/api/demo/${demo.id}/logout`, { method: "POST", credentials: "include" }); } catch { }
    setIsLoggedIn(false);
    setCurrentUser("");
  }

  function handleThemeChange(preset: ThemePreset) {
    setActiveThemeConfig({ preset });
  }

  const themeStyleBlock = <style dangerouslySetInnerHTML={{ __html: themeCSS }} />;

  // ── DPHHS landing ──────────────────────────────────────────────────────────
  if (showLanding) {
    return (
      <>{themeStyleBlock}<DphHsLanding onLogin={() => setShowLanding(false)} /></>
    );
  }

  // ── Role picker ────────────────────────────────────────────────────────────
  if (demo.trustedAuthEnabled && needsRolePicker && !isLoggedIn) {
    return (
      <>
        {themeStyleBlock}
        <RolePicker demoUsers={demo.demoUsers!} companyName={demo.companyName} logoUrl={logoUrl} onSelect={handleRoleSelect} />
        {authError && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(185,28,28,0.1)", color: "#ef4444", padding: "12px 20px", borderRadius: "var(--portal-radius)", fontSize: 14, zIndex: 1001 }}>
            {authError}
          </div>
        )}
      </>
    );
  }

  // ── Trusted auth spinner ───────────────────────────────────────────────────
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
    // Only show FAB for Spotter when not already on the spotter tab
    const showSpotterFab = activeView !== "spotter";

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
            view={activeView}
            onViewChange={setActiveView}
            tsInstance={demo.tsInstance}
            spotterName={demo.spotterName}
            analystName={demo.analystName}
          />

          <main style={{ flex: 1 }}>
            <AnalysisPane
              view={activeView}
              demo={demo}
              effectiveWorksheetId={effectiveWorksheetId}
              embedHeight={DPHHS_EMBED_HEIGHT}
              firstLiveboardId={firstLiveboard?.id}
            />
          </main>

          <div style={{ background: "#112F60", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "6px 24px", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://dphhs.mt.gov/_images/logo/DPHHS-Logo-Circle-Color-White-Border.svg" alt="Montana DPHHS" style={{ height: 36, width: 36 }} />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: "0.08em" }}>
              MONTANA DEPARTMENT OF PUBLIC HEALTH &amp; HUMAN SERVICES
            </span>
          </div>
        </div>

        {/* Spotter FAB (hidden on the spotter tab) */}
        {showSpotterFab && (
          <>
            <div style={{
              position: "fixed", top: 0, right: spotterOpen ? 0 : -460,
              width: 440, height: "100vh", background: "#fff",
              boxShadow: spotterOpen ? "-4px 0 32px rgba(0,0,0,0.18)" : "none",
              transition: "right 0.28s cubic-bezier(0.4,0,0.2,1)", zIndex: 400,
              display: "flex", flexDirection: "column", borderLeft: "1px solid #e5e7eb",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", background: "#112F60", color: "#fff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{demo.spotterName ?? "Ask Clarity"}</span>
                  <span style={{ fontSize: 11, opacity: 0.7, background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "2px 8px" }}>AI Assistant</span>
                </div>
                <button onClick={() => setSpotterOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                {spotterOpen && SpotterEmbed && effectiveWorksheetId ? (
                  <SpotterEmbed worksheetId={effectiveWorksheetId} frameParams={{ width: "100%", height: "100%" }} />
                ) : spotterOpen && !effectiveWorksheetId ? (
                  <div style={{ padding: 24, color: "#6b7280", fontSize: 13, textAlign: "center", paddingTop: 48 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Worksheet not configured</p>
                    <p>Set a Worksheet / Model ID in the Edit Demo form.</p>
                  </div>
                ) : null}
              </div>
            </div>
            <button
              onClick={() => setSpotterOpen((o) => !o)}
              style={{
                position: "fixed", bottom: 28, right: spotterOpen ? 456 : 28,
                transition: "right 0.28s cubic-bezier(0.4,0,0.2,1)", zIndex: 500,
                width: 58, height: 58, borderRadius: "50%", background: "#112F60",
                border: "2px solid rgba(255,255,255,0.15)", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(17,47,96,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
              }}
            >
              {spotterOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 14h5"/></svg>
              }
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
        <GenericTabBar view={activeView} onViewChange={setActiveView} demo={demo} />
        <main style={{ flex: 1 }}>
          <AnalysisPane
            view={activeView}
            demo={demo}
            effectiveWorksheetId={effectiveWorksheetId}
            embedHeight={GENERIC_EMBED_HEIGHT}
            firstLiveboardId={firstLiveboard?.id}
          />
        </main>
      </div>
    </>
  );
}
