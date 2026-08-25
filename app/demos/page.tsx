import Nav from "@/components/Nav";
import DemoLibrary from "@/components/DemoLibrary";
import { getAllDemos } from "@/lib/demos";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DemosPage() {
  const [demos, session] = await Promise.all([getAllDemos(), auth()]);
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);
  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-full">
      <Nav isAdmin={isAdmin} />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <DemoLibrary demos={demos} userRole={userRole} currentLogin={login} />
      </main>
    </div>
  );
}
