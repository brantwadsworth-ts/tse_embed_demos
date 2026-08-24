import { auth } from "@/auth";

export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
