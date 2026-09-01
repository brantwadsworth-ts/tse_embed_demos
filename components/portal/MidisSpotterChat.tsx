"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { SpotterEmbed, useEmbedRef } from "@thoughtspot/visual-embed-sdk/react";
import { HostEvent } from "@thoughtspot/visual-embed-sdk";

// CSS injected into the SpotterEmbed iframe to hide ThoughtSpot's native input bar.
// The user types in our custom input bar instead; queries are driven via HostEvent.SpotterSearch.
const HIDE_INPUT_RULES: Record<string, Record<string, string>> = {
  '[class*="composer" i]': { display: "none !important" },
  '[class*="promptInput" i]': { display: "none !important" },
  '[class*="prompt-input" i]': { display: "none !important" },
  '[class*="chatInput" i]': { display: "none !important" },
  '[class*="chat-input" i]': { display: "none !important" },
  '[class*="conversationInput" i]': { display: "none !important" },
  '[class*="conversation-input" i]': { display: "none !important" },
  '[class*="conversationFooter" i]': { display: "none !important" },
  '[class*="conversation-footer" i]': { display: "none !important" },
  '[class*="bottomBar" i]': { display: "none !important" },
  '[class*="searchInputContainer" i]': { display: "none !important" },
  '[data-testid*="conversation-input" i]': { display: "none !important" },
  '[data-testid*="spotter-input" i]': { display: "none !important" },
};

const SPOTTER_CUSTOMIZATIONS = {
  style: {
    customCSS: {
      rules_UNSTABLE: HIDE_INPUT_RULES,
    },
  },
};

const DEFAULT_SAMPLE_QUESTIONS = [
  "What is the % completeness for DOB fields across all jurisdictions?",
  "Show case counts by jurisdiction for the current MMWR year",
  "Which counties are below the 95% completeness target?",
];

interface MidisSpotterChatProps {
  worksheetId: string;
  spotterName?: string;
  sampleQuestions?: string[];
  demoId: string;
  /** Used as a React key to remount (and re-arm readiness) on theme change */
  embedKey?: number;
}

interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export default function MidisSpotterChat({
  worksheetId,
  spotterName = "Ask Clarity",
  sampleQuestions,
  demoId,
}: MidisSpotterChatProps) {
  const spotterRef = useEmbedRef();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [lastText, setLastText] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryTurn[]>([]);

  const spotterReadyRef = useRef(false);
  const pendingQueryRef = useRef<string | null>(null);

  const chips = sampleQuestions?.length ? sampleQuestions.slice(0, 4) : DEFAULT_SAMPLE_QUESTIONS;

  const runSpotterQuery = useCallback(
    (query: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (spotterRef.current as any)?.trigger(HostEvent.SpotterSearch, {
          query,
          executeSearch: true,
        });
      } catch (e) {
        console.warn("[midis-ai] SpotterSearch trigger failed:", e);
      }
    },
    [spotterRef],
  );

  // Wait for the embedded app to register the SpotterSearch handler before sending.
  // EmbedEvent.Load fires too early; subscribedEvent(SpotterSearch) fires exactly when
  // the handler is ready. Pattern carried from the Salesloft demo fix (commit 7f6ce7b).
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const embed = spotterRef.current as any;
    if (!embed?.subscribedEvent) return;
    spotterReadyRef.current = false;

    const readyEvent = embed.subscribedEvent(HostEvent.SpotterSearch);
    const onReady = () => {
      spotterReadyRef.current = true;
      if (pendingQueryRef.current) {
        const q = pendingQueryRef.current;
        pendingQueryRef.current = null;
        runSpotterQuery(q);
      }
    };
    embed.on(readyEvent, onReady);
    return () => embed.off?.(readyEvent, onReady);
  }, [worksheetId, runSpotterQuery]);

  async function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    setLastText(null);

    try {
      const res = await fetch(`/api/demo/${demoId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: q }),
      });
      const data = (await res.json()) as {
        kind: string;
        text?: string;
        query?: string;
        preamble?: string;
      };

      const newHistory: HistoryTurn[] = [...history, { role: "user", content: q }];

      if (data.kind === "analytics" && data.query) {
        setHasQueried(true);
        if (data.preamble) setLastText(data.preamble);
        setHistory([...newHistory, { role: "assistant", content: data.preamble || data.query }]);

        if (spotterReadyRef.current) {
          runSpotterQuery(data.query);
        } else {
          pendingQueryRef.current = data.query;
        }
      } else if (data.kind === "text" && data.text) {
        setLastText(data.text);
        setHistory([...newHistory, { role: "assistant", content: data.text }]);
      }
    } catch {
      setLastText("Unable to process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Spotter canvas — always rendered so the embed initialises immediately */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SpotterEmbed
          ref={spotterRef as any}
          worksheetId={worksheetId}
          hideSampleQuestions
          frameParams={{ width: "100%", height: "100%" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          customizations={SPOTTER_CUSTOMIZATIONS as any}
        />

        {/* Branded empty state — covers the (blank) canvas until first query */}
        {!hasQueried && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, #0d2247 0%, #1a4a7a 60%, #112F60 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 20px",
              gap: 18,
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                padding: "4px 14px",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                AI DATA ASSISTANT
              </span>
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", maxWidth: 340 }}>
              <h3
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 800,
                  margin: "0 0 8px",
                  letterSpacing: "-0.01em",
                }}
              >
                {spotterName}
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.68)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                Ask questions about MIDIS disease surveillance data in plain
                language. Explore completeness, case counts, and jurisdiction
                trends.
              </p>
            </div>

            {/* Sample question chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                maxWidth: 380,
              }}
            >
              {chips.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loading}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 999,
                    padding: "6px 14px",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    lineHeight: 1.4,
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text-answer banner (shown for general knowledge responses) */}
      {lastText && (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid #e5e7eb",
            background: "#f0f4ff",
            fontSize: 13,
            color: "#1e3a5f",
            lineHeight: 1.5,
            maxHeight: 90,
            overflow: "auto",
            flexShrink: 0,
          }}
        >
          {lastText}
        </div>
      )}

      {/* Custom input bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 12px",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && send()}
          placeholder={`Ask ${spotterName}…`}
          disabled={loading}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            background: loading ? "#f9fafb" : "#fff",
            color: "#111827",
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: !input.trim() || loading ? "#e5e7eb" : "#112F60",
            color: !input.trim() || loading ? "#9ca3af" : "#fff",
            border: "none",
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>
    </div>
  );
}
