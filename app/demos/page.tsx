import Link from "next/link";
import Nav from "@/components/Nav";
import DemoCard from "@/components/DemoCard";
import { getAllDemos } from "@/lib/demos";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DemosPage() {
  const [demos, session] = await Promise.all([getAllDemos(), auth()]);
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);
  const isAdmin = userRole === "admin";

  const live = demos.filter((d) => d.status === "live");
  const pending = demos.filter((d) => d.status !== "live");

  return (
    <div className="min-h-full">
      <Nav isAdmin={isAdmin} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demo Library</h1>
            <p className="mt-1 text-sm text-gray-500">
              {demos.length} demo{demos.length !== 1 ? "s" : ""} — {live.length} live, {pending.length} pending
            </p>
          </div>
          {userRole !== "view" && (
            <Link
              href="/demos/new"
              className="rounded-xl bg-[#2770ef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
            >
              + New Demo
            </Link>
          )}
        </div>

        {/* Live demos */}
        {live.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Live</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((demo) => (
                <DemoCard key={demo.id} demo={demo} userRole={userRole} />
              ))}
            </div>
          </section>
        )}

        {/* Pending demos */}
        {pending.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Pending</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map((demo) => (
                <DemoCard key={demo.id} demo={demo} userRole={userRole} />
              ))}
            </div>
          </section>
        )}

        {demos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <p className="text-gray-400">No demos yet.</p>
            {userRole !== "view" && (
              <Link href="/demos/new" className="mt-3 text-sm font-medium text-[#2770ef] hover:underline">
                Create your first demo →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
