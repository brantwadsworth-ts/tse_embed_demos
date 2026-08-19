"use client";

import { useEffect, useState } from "react";
import { DemoUser } from "@/lib/demoUsers";

interface Group {
  id: string;
  name: string;
  displayName: string;
}

const RLS_VARIABLES = [
  { name: "dd_Company", label: "Company", placeholder: "e.g. COKE" },
  { name: "dd_Region", label: "Region", placeholder: "e.g. EU" },
  { name: "dd_Country", label: "Country", placeholder: "e.g. DE" },
];

interface VariableState {
  value: string;
  wildcard: boolean;
}

function initialVariableState(): Record<string, VariableState> {
  return Object.fromEntries(
    RLS_VARIABLES.map((variable) => [variable.name, { value: "", wildcard: false }]),
  );
}

export default function UserOnboardingView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [variables, setVariables] = useState<Record<string, VariableState>>(
    initialVariableState,
  );

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const [users, setUsers] = useState<DemoUser[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null);

  function loadUsers() {
    fetch("/api/admin/users")
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to load users.");
        }
        return response.json();
      })
      .then((data) => setUsers(data.users))
      .catch((error) => setUsersError(error instanceof Error ? error.message : String(error)));
  }

  useEffect(() => {
    fetch("/api/admin/groups")
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to load groups.");
        }
        return response.json();
      })
      .then((data) => setGroups(data.groups))
      .catch((error) => setGroupsError(error instanceof Error ? error.message : String(error)));

    loadUsers();
  }, []);

  function toggleGroup(id: string) {
    setSelectedGroupIds((current) =>
      current.includes(id) ? current.filter((groupId) => groupId !== id) : [...current, id],
    );
  }

  function updateVariable(name: string, update: Partial<VariableState>) {
    setVariables((current) => ({ ...current, [name]: { ...current[name], ...update } }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const variableValues = RLS_VARIABLES.map((variable) => {
      const state = variables[variable.name];
      const value = state.wildcard ? "TS_WILDCARD_ALL" : state.value.trim();
      return { name: variable.name, values: value ? [value] : [] };
    });

    try {
      const response = await fetch("/api/admin/onboard-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          displayName,
          email,
          role,
          groupIdentifiers: selectedGroupIds,
          variableValues,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to onboard user.");
      }

      setResult({
        type: "success",
        message: data.created
          ? `Created new user "${username}" with the selected group and RLS values. They can now sign in to this app.`
          : `"${username}" already existed -- updated their RLS variable values (display name, email, and group assignment only apply to newly created users).`,
      });
      setUsername("");
      setDisplayName("");
      setEmail("");
      setRole("");
      setSelectedGroupIds([]);
      setVariables(initialVariableState());
      loadUsers();
    } catch (error) {
      setResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to onboard user.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user: DemoUser) {
    if (!window.confirm(`Delete "${user.username}" from ThoughtSpot and this app? This can't be undone.`)) {
      return;
    }

    setDeletingUsername(user.username);
    setUsersError(null);

    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete user.");
      }

      loadUsers();
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingUsername(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-dd-border bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-dd-black">
              Username (email)
            </label>
            <input
              id="username"
              type="email"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="new.user@coke.com"
              className="w-full rounded-lg border border-dd-border px-3 py-2 text-sm text-dd-black placeholder:text-dd-gray focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="mb-1.5 block text-sm font-semibold text-dd-black">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-dd-border px-3 py-2 text-sm text-dd-black placeholder:text-dd-gray focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-dd-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Defaults to username if left blank"
              className="w-full rounded-lg border border-dd-border px-3 py-2 text-sm text-dd-black placeholder:text-dd-gray focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-semibold text-dd-black">
              Role (shown in this app)
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Coke France Manager"
              className="w-full rounded-lg border border-dd-border px-3 py-2 text-sm text-dd-black placeholder:text-dd-gray focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20"
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-dd-black">ThoughtSpot group(s)</p>
          {groupsError ? (
            <p className="text-sm text-dd-red-dark">{groupsError}</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-dd-gray">Loading groups…</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-dd-border p-3">
              {groups.map((group) => (
                <label key={group.id} className="flex items-center gap-2 text-sm text-dd-black">
                  <input
                    type="checkbox"
                    checked={selectedGroupIds.includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                    className="accent-dd-red"
                  />
                  {group.displayName}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-dd-black">
            RLS variable values
          </p>
          <p className="mb-3 text-xs text-dd-gray">
            Leave a field blank to skip setting that variable for this user.
          </p>
          <div className="space-y-3">
            {RLS_VARIABLES.map((variable) => {
              const state = variables[variable.name];
              return (
                <div key={variable.name} className="flex items-center gap-3">
                  <label className="w-24 shrink-0 text-sm font-medium text-dd-black">
                    {variable.label}
                  </label>
                  <input
                    type="text"
                    disabled={state.wildcard}
                    value={state.value}
                    onChange={(event) => updateVariable(variable.name, { value: event.target.value })}
                    placeholder={variable.placeholder}
                    className="flex-1 rounded-lg border border-dd-border px-3 py-1.5 text-sm text-dd-black placeholder:text-dd-gray focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20 disabled:bg-dd-gray-light disabled:text-dd-gray"
                  />
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-dd-gray">
                    <input
                      type="checkbox"
                      checked={state.wildcard}
                      onChange={(event) =>
                        updateVariable(variable.name, { wildcard: event.target.checked })
                      }
                      className="accent-dd-red"
                    />
                    All (wildcard)
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {result && (
          <p
            className={
              result.type === "success"
                ? "rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
                : "rounded-lg bg-red-50 px-3 py-2 text-sm text-dd-red-dark"
            }
          >
            {result.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-dd-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-dd-red-dark disabled:opacity-60"
        >
          {submitting ? "Onboarding…" : "Onboard user"}
        </button>
      </form>

      <div className="rounded-xl border border-dd-border bg-white p-6">
        <p className="mb-3 text-sm font-semibold text-dd-black">Existing demo users</p>

        {usersError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-dd-red-dark">
            {usersError}
          </p>
        )}

        <div className="divide-y divide-dd-border">
          {users.map((user) => (
            <div key={user.username} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-dd-black">{user.username}</p>
                <p className="truncate text-xs text-dd-gray">{user.role}</p>
              </div>
              {user.seed ? (
                <span className="shrink-0 text-xs text-dd-gray">Seed user (protected)</span>
              ) : (
                <button
                  onClick={() => handleDelete(user)}
                  disabled={deletingUsername === user.username}
                  className="shrink-0 rounded-lg border border-dd-border px-3 py-1.5 text-xs font-semibold text-dd-red transition hover:border-dd-red disabled:opacity-60"
                >
                  {deletingUsername === user.username ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
