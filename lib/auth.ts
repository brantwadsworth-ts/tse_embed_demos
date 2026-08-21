import { cookies } from "next/headers";

export const SESSION_COOKIE = "builder_session";
const BUILDER_PASSWORD = process.env.BUILDER_PASSWORD;

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === "authenticated";
}

export function checkPassword(input: string): boolean {
  if (!BUILDER_PASSWORD) {
    console.warn("BUILDER_PASSWORD is not set — auth is disabled.");
    return true;
  }
  return input === BUILDER_PASSWORD;
}

export function checkEmail(input: string): boolean {
  return input.trim().toLowerCase().endsWith("@thoughtspot.com");
}
