"use client";

import { useState, FormEvent } from "react";

interface DemoLoginProps {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  onLogin: (username: string, password: string) => Promise<void>;
}

export default function DemoLogin({
  companyName,
  logoUrl,
  primaryColor,
  onLogin,
}: DemoLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          background: primaryColor,
          color: "#ffffff",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={companyName}
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />
        )}
        <div>
          <p style={{ fontSize: "26px", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            {companyName}
          </p>
          <p style={{ fontSize: "15px", opacity: 0.75, margin: "8px 0 0" }}>
            Data Analytics Portal
          </p>
        </div>
        <p style={{ fontSize: "14px", lineHeight: 1.65, opacity: 0.8, maxWidth: "380px", margin: 0 }}>
          Sign in with your ThoughtSpot credentials to access your analytics dashboard.
        </p>
      </div>

      {/* Right panel */}
      <div
        style={{
          background: "#f5f7fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: "40px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#212529", margin: "0 0 4px" }}>
              Sign In
            </p>
            <p style={{ fontSize: "13px", color: "#6c757d", margin: 0 }}>
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {error && (
              <div
                style={{
                  background: "#fdecea",
                  color: "#b3261e",
                  fontSize: "13px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#212529" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{
                  width: "100%",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  padding: "11px 13px",
                  fontSize: "15px",
                  color: "#212529",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#212529" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  padding: "11px 13px",
                  fontSize: "15px",
                  color: "#212529",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                border: "none",
                background: primaryColor,
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                padding: "13px",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.55 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
