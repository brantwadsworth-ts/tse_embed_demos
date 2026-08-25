"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

interface Member {
  login: string;
  avatarUrl: string;
  role: string;
}

interface PendingInvite {
  login: string;
  avatarUrl: string;
}

interface ApiData {
  members: Member[];
  pending: PendingInvite[];
}

export default function AccessPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteStatus, setInviteStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function loadMembers() {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/members");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const json: ApiData = await res.json();
      setData(json);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load members");
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const username = inviteUsername.trim();
    if (!username) return;

    setInviting(true);
    setInviteStatus(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInviteStatus({ type: "error", message: json.error ?? "Invite failed" });
      } else {
        setInviteStatus({
          type: "success",
          message: `Invite sent to @${username}`,
        });
        setInviteUsername("");
        await loadMembers();
      }
    } catch {
      setInviteStatus({ type: "error", message: "Network error — please retry" });
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(username: string) {
    if (
      !confirm(
        `Remove @${username} from the org? They will lose access immediately.`,
      )
    )
      return;

    setRemoving(username);
    try {
      const res = await fetch("/api/admin/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Remove failed");
      } else {
        await loadMembers();
      }
    } catch {
      alert("Network error — please retry");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="min-h-full">
      <Nav />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage who can sign in to Demo Builder via the{" "}
            <a
              href="https://github.com/TSE-Embed-Demos"
              target="_blank"
              rel="noreferrer"
              className="text-[#2770ef] hover:underline"
            >
              TSE-Embed-Demos
            </a>{" "}
            GitHub org.
          </p>
        </div>

        {/* Invite form */}
        <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Invite by GitHub username
          </h2>
          <form onSubmit={handleInvite} className="flex items-start gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="github-username"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2770ef] focus:outline-none focus:ring-2 focus:ring-[#2770ef]/20"
                disabled={inviting}
              />
              {inviteStatus && (
                <p
                  className={`mt-2 text-xs font-medium ${
                    inviteStatus.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {inviteStatus.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={inviting || !inviteUsername.trim()}
              className="rounded-lg bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] disabled:opacity-50 transition-colors"
            >
              {inviting ? "Sending…" : "Send Invite"}
            </button>
          </form>
        </section>

        {/* Error state */}
        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
            <button
              onClick={loadMembers}
              className="ml-3 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {!data && !loadError && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Active members */}
            <section className="mb-10">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Members ({data.members.length})
              </h2>
              {data.members.length === 0 ? (
                <p className="text-sm text-gray-400">No members found.</p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
                  {data.members.map((m) => (
                    <li
                      key={m.login}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.avatarUrl}
                          alt={m.login}
                          className="h-8 w-8 rounded-full border border-gray-200"
                        />
                        <div>
                          <a
                            href={`https://github.com/${m.login}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-[#2770ef]"
                          >
                            @{m.login}
                          </a>
                          <span className="ml-2 text-xs text-gray-400">
                            {m.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(m.login)}
                        disabled={removing === m.login}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {removing === m.login ? "Removing…" : "Remove"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Pending invitations */}
            {data.pending.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Pending Invitations ({data.pending.length})
                </h2>
                <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
                  {data.pending.map((p) => (
                    <li
                      key={p.login}
                      className="flex items-center gap-3 px-5 py-3.5"
                    >
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.avatarUrl}
                          alt={p.login}
                          className="h-8 w-8 rounded-full border border-gray-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        @{p.login}
                      </span>
                      <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                        Pending
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
