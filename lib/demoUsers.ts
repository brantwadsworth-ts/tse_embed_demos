import { promises as fs } from "fs";
import path from "path";

export interface DemoUser {
  username: string;
  displayName: string;
  role: string;
  /**
   * Seed users ship with the demo and are protected from deletion via the
   * admin UI. Users onboarded through /admin/onboard-user are not seeded.
   */
  seed?: boolean;
}

const SEED_USERS: Record<string, DemoUser> = {
  "dd_internal_admin@dd.com": {
    username: "dd_internal_admin@dd.com",
    displayName: "Internal Admin",
    role: "Internal Admin",
    seed: true,
  },
  "dd_coke_admin@coke.com": {
    username: "dd_coke_admin@coke.com",
    displayName: "Coke Admin",
    role: "Coke Admin",
    seed: true,
  },
  "dd_coke_regmgr@coke.com": {
    username: "dd_coke_regmgr@coke.com",
    displayName: "Coke Region Manager",
    role: "Coke Region Manager",
    seed: true,
  },
  "dd_coke_countrymgr@coke.com": {
    username: "dd_coke_countrymgr@coke.com",
    displayName: "Coke Country Manager",
    role: "Coke Country Manager",
    seed: true,
  },
};

// File-backed store for demo-app logins, separate from ThoughtSpot's own
// user database. Deliberately NOT an in-memory module variable -- Next.js
// (dev and prod) can spread routes across multiple worker processes, each
// with its own JS module registry, so a plain in-memory object mutated by
// one API route silently wouldn't be visible from another route. The
// filesystem is the one thing every worker shares. Seeds itself from
// SEED_USERS on first read; mutated by the User Onboarding admin flow (see
// app/api/admin/onboard-user and app/api/admin/delete-user).
const DATA_FILE = path.join(process.cwd(), "data", "demo-users.json");

async function readStore(): Promise<Record<string, DemoUser>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    await writeStore(SEED_USERS);
    return { ...SEED_USERS };
  }
}

async function writeStore(store: Record<string, DemoUser>): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

export async function getDemoUsers(): Promise<DemoUser[]> {
  return Object.values(await readStore());
}

export async function getDemoUser(
  username: string | null | undefined,
): Promise<DemoUser | null> {
  if (!username) return null;
  const store = await readStore();
  return store[username] ?? null;
}

export async function upsertDemoUser(user: DemoUser): Promise<void> {
  const store = await readStore();
  store[user.username] = user;
  await writeStore(store);
}

// Returns false (no-op) for unknown or seed-protected usernames.
export async function deleteDemoUser(username: string): Promise<boolean> {
  const store = await readStore();
  const user = store[username];
  if (!user || user.seed) return false;
  delete store[username];
  await writeStore(store);
  return true;
}
