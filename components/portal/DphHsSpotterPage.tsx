"use client";

import React from "react";

// Dynamic load — SpotterEmbed may not exist in older SDK builds
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

interface DphHsSpotterPageProps {
  worksheetId?: string;
  spotterName?: string;
}

export default function DphHsSpotterPage({
  worksheetId,
  spotterName = "Ask Clarity",
}: DphHsSpotterPageProps) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 160px)",
        background: "linear-gradient(160deg, #0d2247 0%, #1a4a7a 60%, #112F60 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 32px",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px", maxWidth: "640px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "999px",
            padding: "6px 18px",
            marginBottom: "16px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em" }}>
            AI DATA ASSISTANT
          </span>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.2 }}>
          {spotterName}
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>
          Ask questions about MIDIS disease surveillance data in plain language. Explore completeness metrics, case counts, and jurisdiction trends.
        </p>
      </div>

      {/* Spotter embed frame */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          flex: 1,
          minHeight: "560px",
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        {!worksheetId ? (
          <div
            style={{
              height: "100%",
              minHeight: "560px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "48px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 6px" }}>Worksheet not configured</p>
              <p style={{ fontSize: "13px", margin: 0, maxWidth: "320px" }}>
                Set a <strong>Worksheet / Model ID</strong> for this demo in the Edit Demo form to enable {spotterName}.
              </p>
            </div>
          </div>
        ) : SpotterEmbed ? (
          <SpotterEmbed
            worksheetId={worksheetId}
            frameParams={{ width: "100%", height: "100%" }}
            style={{ minHeight: "560px" }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              minHeight: "560px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Spotter is not available in this SDK version.
          </div>
        )}
      </div>

      {/* Sample prompts */}
      {worksheetId && (
        <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", maxWidth: "760px" }}>
          {[
            "What is the % completeness for DOB fields across all jurisdictions?",
            "Show case counts by jurisdiction for the current MMWR year",
            "Which counties are below the 95% completeness target?",
          ].map((q) => (
            <div
              key={q}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "999px",
                padding: "7px 16px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.8)",
                cursor: "default",
              }}
            >
              {q}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
