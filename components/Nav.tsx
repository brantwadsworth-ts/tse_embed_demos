"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

interface ProfileMenuProps {
  login: string;
  name?: string;
  image?: string;
}

function ProfileMenu({ login, name, image }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/user/apikey")
      .then((r) => r.json())
      .then((d: { hasKey: boolean }) => setHasKey(d.hasKey))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowKeyInput(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleSaveKey() {
    if (!keyInput.trim()) return;
    setKeyLoading(true);
    await fetch("/api/user/apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyInput.trim() }),
    });
    setHasKey(true);
    setKeyInput("");
    setShowKeyInput(false);
    setKeyLoading(false);
  }

  async function handleRemoveKey() {
    setKeyLoading(true);
    await fetch("/api/user/apikey", { method: "DELETE" });
    setHasKey(false);
    setKeyLoading(false);
  }

  const displayName = name || login || "?";
  const initial = displayName[0].toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 8px 4px 4px",
          borderRadius: 10,
          transition: "background 0.15s",
        }}
        className="hover:bg-gray-100"
        aria-label="Account menu"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={displayName}
            style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#2770ef",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}
        <span style={{ fontSize: 13, fontWeight: 500, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "#9ca3af", flexShrink: 0 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 300,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* User info header */}
          <div
            style={{
              padding: "16px",
              background: "linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={displayName}
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 0 0 2px #2770ef30" }}
              />
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#2770ef",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "3px 0 0", fontFamily: "monospace" }}>
                @{login}
              </p>
              <div
                style={{
                  marginTop: 5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: hasKey ? "#dcfce7" : "#f3f4f6",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: hasKey ? "#16a34a" : "#9ca3af", flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: hasKey ? "#15803d" : "#6b7280" }}>
                  {hasKey === null ? "Checking Claude…" : hasKey ? "Claude connected" : "Claude not connected"}
                </span>
              </div>
            </div>
          </div>

          {/* Claude Account section */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: 0 }}>Claude Account</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0", lineHeight: 1.4 }}>
                  {hasKey
                    ? "Anthropic API key is set. AI Assist is enabled."
                    : "Add your Anthropic API key to enable AI features."}
                </p>
              </div>
              <button
                onClick={() => {
                  if (hasKey) {
                    handleRemoveKey();
                  } else {
                    setShowKeyInput((v) => !v);
                  }
                }}
                disabled={keyLoading}
                style={{
                  fontSize: 11,
                  color: hasKey ? "#ef4444" : "#2770ef",
                  background: hasKey ? "#fef2f2" : "#eff6ff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: "4px 10px",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                {keyLoading ? "…" : hasKey ? "Remove" : showKeyInput ? "Cancel" : "Add key"}
              </button>
            </div>

            {showKeyInput && (
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-ant-api03-…"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveKey();
                    if (e.key === "Escape") setShowKeyInput(false);
                  }}
                  style={{
                    flex: 1,
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "7px 10px",
                    fontSize: 12,
                    outline: "none",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!keyInput.trim() || keyLoading}
                  style={{
                    background: "#2770ef",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: keyInput.trim() ? 1 : 0.5,
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 8px" }}>
            <Link
              href="/settings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                textDecoration: "none",
                color: "#374151",
                fontSize: 13,
                fontWeight: 500,
              }}
              className="hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: "#6b7280" }}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Preferences &amp; Settings
            </Link>

            <div style={{ height: 1, background: "#f3f4f6", margin: "4px 0" }} />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 500,
                width: "100%",
                textAlign: "left",
              }}
              className="hover:bg-red-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Nav({
  isAdmin,
  userLogin,
  userName,
  userImage,
}: {
  isAdmin?: boolean;
  userLogin?: string;
  userName?: string;
  userImage?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-6">
          <Link href="/demos" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2770ef]">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Demo Builder</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/demos"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/demos"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Library
            </Link>
            <Link
              href="/demos/new"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/demos/new"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              New Demo
            </Link>
            {isAdmin && (
              <Link
                href="/admin/access"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/admin/access"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Team
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/workshop"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/admin/workshop"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Workshop
              </Link>
            )}
            <Link
              href="/gallery"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/gallery"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Gallery
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/demos/new"
            className="rounded-lg bg-[#2770ef] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
          >
            + New Demo
          </Link>
          {userLogin ? (
            <ProfileMenu login={userLogin} name={userName} image={userImage} />
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
