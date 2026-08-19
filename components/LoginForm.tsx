"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetCachedAuthToken } from "@thoughtspot/visual-embed-sdk";
import { DemoUser } from "@/lib/demoUsers";

interface LoginFormProps {
  users: DemoUser[];
}

export default function LoginForm({ users }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(users[0]?.username ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Login failed.");
        setSubmitting(false);
        return;
      }

      // The ThoughtSpot SDK caches the last auth token in `window` and
      // reuses it while still valid, even across a different demo user's
      // session -- reset it so the new login always fetches a fresh token
      // for the new username instead of showing the previous user's data.
      resetCachedAuthToken();

      router.push("/landing");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-semibold text-dd-black"
        >
          Username
        </label>
        <select
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-lg border border-dd-border bg-white px-3 py-2.5 text-sm text-dd-black focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20"
        >
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.username} — {user.role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-dd-black"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder=""
          className="w-full rounded-lg border border-dd-border bg-white px-3 py-2.5 text-sm text-dd-black placeholder:text-dd-gray focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-dd-red-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-dd-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-dd-red-dark disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
