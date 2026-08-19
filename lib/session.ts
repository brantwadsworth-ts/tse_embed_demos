import { cookies } from "next/headers";
import { DemoUser, getDemoUser } from "@/lib/demoUsers";

export const SESSION_COOKIE = "dd_session";

export async function getSessionUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  return getDemoUser(cookieStore.get(SESSION_COOKIE)?.value);
}
