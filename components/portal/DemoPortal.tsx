"use client";

import { useState } from "react";
import { Demo } from "@/lib/demos";
import { initPortalTS, ensurePortalSession } from "@/lib/thoughtspot-portal";
import DemoLogin from "./DemoLogin";
import DemoEmbed from "./DemoEmbed";
import DphHsHeader from "./DphHsHeader";
import DphHsFooter from "./DphHsFooter";
import GenericHeader from "./GenericHeader";

interface DemoPortalProps {
  demo: Demo;
}

export default function DemoPortal({ demo }: DemoPortalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const theme = demo.theme;
  const primaryColor = theme?.primaryColor ?? "#2770ef";
  const logoUrl = theme?.logoUrl;
  const firstLiveboard = theme?.liveboards?.[0];

  async function handleLogin(username: string, password: string) {
    initPortalTS(demo.tsInstance, username, password);
    await ensurePortalSession(demo.tsInstance, username, password);
    setIsLoggedIn(true);
  }

  if (!isLoggedIn) {
    return (
      <DemoLogin
        companyName={demo.companyName}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {theme?.custom === "dphhs" ? (
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
          <DemoEmbed liveboardId={firstLiveboard.id} />
        ) : (
          <div
            style={{
              padding: "48px 32px",
              textAlign: "center",
              color: "#6c757d",
              fontSize: "15px",
            }}
          >
            {/* TODO: no liveboard configured for this demo */}
            No liveboard configured for this demo yet.
          </div>
        )}
      </main>

      {theme?.custom === "dphhs" && <DphHsFooter />}
    </div>
  );
}
