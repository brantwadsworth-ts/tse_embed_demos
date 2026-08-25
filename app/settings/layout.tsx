import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const role = await getRole(login);
  return (
    <div className="min-h-full">
      <Nav isAdmin={role === "admin"} />
      {children}
    </div>
  );
}
