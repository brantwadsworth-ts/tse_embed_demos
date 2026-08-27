import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { login?: string; name?: string; image?: string } | undefined;
  const login = user?.login ?? "";
  const role = await getRole(login);
  return (
    <div className="min-h-full">
      <Nav isAdmin={role === "admin"} userLogin={login} userName={user?.name} userImage={user?.image} />
      {children}
    </div>
  );
}
