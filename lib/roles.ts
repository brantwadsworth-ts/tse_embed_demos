import { list, put } from "@vercel/blob";

export type Role = "admin" | "create" | "view";

export interface UserRole {
  login: string;
  role: Role;
}

const BLOB_KEY = "user-roles.json";

// Seed: brantwadsworth-ts is always admin
const SEED: UserRole[] = [{ login: "brantwadsworth-ts", role: "admin" }];

export async function readRoles(): Promise<UserRole[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].downloadUrl, { cache: "no-store" });
      return res.json();
    }
  } catch {
    // fall through to seed
  }
  return SEED;
}

export async function writeRoles(roles: UserRole[]): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(roles, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function getRole(login: string): Promise<Role> {
  // brantwadsworth-ts is always admin regardless of blob contents
  if (login === "brantwadsworth-ts") return "admin";
  const roles = await readRoles();
  return roles.find((r) => r.login === login)?.role ?? "view";
}

export async function setRole(login: string, role: Role): Promise<void> {
  const roles = await readRoles();
  const idx = roles.findIndex((r) => r.login === login);
  if (idx >= 0) roles[idx].role = role;
  else roles.push({ login, role });
  await writeRoles(roles);
}

export async function removeRole(login: string): Promise<void> {
  const roles = await readRoles();
  await writeRoles(roles.filter((r) => r.login !== login));
}
