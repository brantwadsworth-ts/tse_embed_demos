"use client";

import { useState } from "react";
import { LiveboardEmbed } from "@thoughtspot/visual-embed-sdk/react";
import type { EmbedOptions } from "@/lib/demos";

// SpotterEmbed is in the full bundle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SpotterEmbed: React.ComponentType<any> | null = null;
if (typeof window !== "undefined") {
  try {
    // Dynamic require so SSR doesn't break
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpotterEmbed = require("@thoughtspot/visual-embed-sdk/react").SpotterEmbed ?? null;
  } catch {
    SpotterEmbed = null;
  }
}

import React from "react";

interface DemoEmbedProps {
  liveboardId: string;
  useSpotter?: boolean;
  spotterName?: string;
  worksheetId?: string;
  reportDesigner?: boolean;
  embedOptions?: EmbedOptions;
}

export default function DemoEmbed({
  liveboardId,
  useSpotter = false,
  spotterName = "Ask Spotter",
  worksheetId,
  reportDesigner: _reportDesigner,
  embedOptions,
}: DemoEmbedProps) {
  const [spotterOpen, setSpotterOpen] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", display: "flex" }}>
      {/* ── Liveboard ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <LiveboardEmbed
          liveboardId={liveboardId}
          fullHeight
          frameParams={{ width: "100%" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hiddenActions={embedOptions?.hiddenActions as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          visibleActions={embedOptions?.visibleActions?.length ? embedOptions.visibleActions as any : undefined}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          disabledActions={embedOptions?.disabledActions as any}
          disabledActionReason={embedOptions?.disabledActionReason}
          hideLiveboardHeader={embedOptions?.hideLiveboardHeader}
          hideTabPanel={embedOptions?.hideTabPanel}
        />
      </div>

      {/* ── Spotter drawer ── */}
      {useSpotter && (
        <>
          {/* Slide-in panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: spotterOpen ? 0 : -440,
              width: 420,
              height: "100vh",
              background: "#fff",
              boxShadow: spotterOpen ? "-4px 0 24px rgba(0,0,0,0.15)" : "none",
              transition: "right 0.25s ease",
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid #e5e7eb",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid #e5e7eb",
                background: "#112F60",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.02em" }}>
                  {spotterName}
                </span>
              </div>
              <button
                onClick={() => setSpotterOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4, lineHeight: 1 }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* SpotterEmbed */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              {spotterOpen && SpotterEmbed && (
                <SpotterEmbed
                  worksheetId={worksheetId}
                  frameParams={{ width: "100%", height: "100%" }}
                />
              )}
              {spotterOpen && !SpotterEmbed && (
                <div style={{ padding: 24, color: "#6b7280", fontSize: 14 }}>
                  Spotter is not available in this SDK version.
                </div>
              )}
            </div>
          </div>

          {/* FAB toggle button */}
          <button
            onClick={() => setSpotterOpen((o) => !o)}
            aria-label={spotterOpen ? "Close Spotter" : `Open ${spotterName}`}
            style={{
              position: "fixed",
              bottom: 24,
              right: spotterOpen ? 436 : 24,
              transition: "right 0.25s ease",
              zIndex: 300,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#2770ef",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(39,112,239,0.45)",
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
    </div>
  );
}
