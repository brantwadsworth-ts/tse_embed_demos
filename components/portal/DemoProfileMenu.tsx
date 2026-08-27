"use client";

import { useState, useRef, useEffect } from "react";
import { ThemePreset, THEME_META, THEMES } from "@/lib/portal-themes";

interface DemoProfileMenuProps {
  demoId: string;
  currentUser: string;
  activePreset: ThemePreset;
  onThemeChange: (preset: ThemePreset) => void;
  onLogout: () => void;
}

const PRESETS: ThemePreset[] = ["light", "dark", "minimal", "glass", "midnight", "custom"];

export default function DemoProfileMenu({
  demoId,
  currentUser,
  activePreset,
  onThemeChange,
  onLogout,
}: DemoProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = currentUser.charAt(0).toUpperCase() || "U";

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: "12px",
        right: "16px",
        zIndex: 300,
        fontFamily: "var(--portal-font)",
      }}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: "2px solid var(--portal-border)",
          background: "var(--portal-accent)",
          color: "var(--portal-accent-fg)",
          fontSize: "15px",
          fontWeight: 800,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--portal-shadow)",
          transition: "transform 0.1s, box-shadow 0.1s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {initial}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "280px",
            background: "var(--portal-surface)",
            border: "1px solid var(--portal-border)",
            borderRadius: "var(--portal-radius-lg)",
            boxShadow: "var(--portal-shadow-lg)",
            overflow: "hidden",
          }}
        >
          {/* User info */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--portal-border)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--portal-accent)",
                color: "var(--portal-accent-fg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--portal-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser}
              </p>
              <p style={{ fontSize: "11px", color: "var(--portal-text-muted)", margin: 0 }}>
                Demo viewer
              </p>
            </div>
          </div>

          {/* Theme switcher */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--portal-border)" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--portal-text-muted)", margin: "0 0 8px" }}>
              Theme
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
              {PRESETS.map((preset) => {
                const meta = THEME_META[preset];
                const isActive = preset === activePreset;
                const baseVars = preset !== "custom" ? THEMES[preset] : null;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onThemeChange(preset);
                      setOpen(false);
                    }}
                    title={meta.description}
                    style={{
                      border: isActive ? "2px solid var(--portal-accent)" : "1px solid var(--portal-border)",
                      borderRadius: "var(--portal-radius)",
                      padding: "6px 4px",
                      cursor: "pointer",
                      background: isActive ? "var(--portal-surface-2)" : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = "var(--portal-accent)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "var(--portal-border)"; }}
                  >
                    {/* Mini color swatch */}
                    <div style={{ display: "flex", gap: "2px", borderRadius: "3px", overflow: "hidden", width: "100%", height: "14px" }}>
                      {baseVars ? (
                        <>
                          <div style={{ flex: 1, background: baseVars.bg.startsWith("linear") ? "#1a1a2e" : baseVars.bg }} />
                          <div style={{ flex: 1, background: baseVars.accent }} />
                          <div style={{ flex: 1, background: baseVars.headerBg }} />
                        </>
                      ) : (
                        <div style={{ flex: 1, background: "linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa)" }} />
                      )}
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--portal-accent)" : "var(--portal-text-muted)" }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: "6px" }}>
            <a
              href={`/demos/${demoId}/edit`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "var(--portal-radius)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--portal-text)",
                textDecoration: "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--portal-surface-2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: "15px" }}>✏️</span> Edit Demo
            </a>

            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "var(--portal-radius)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--portal-text)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
                fontFamily: "var(--portal-font)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--portal-surface-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: "15px" }}>🚪</span> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
