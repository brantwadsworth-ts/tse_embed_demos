import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";
import TeamManager from "@/components/TeamManager";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const role = await getRole(login);
  if (role !== "admin") redirect("/demos");

  return (
    <div className="min-h-full">
      <Nav isAdmin={true} />

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
            GitHub org, and assign roles.
          </p>
        </div>

        <TeamManager />
      </main>
    </div>
  );
}
