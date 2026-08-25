import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewDemoPage() {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);

  if (userRole === "view") redirect("/demos");

  return (
    <div className="min-h-full">
      <Nav isAdmin={userRole === "admin"} />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Demo</h1>
          <p className="mt-2 text-gray-500">Choose how you want to get started.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Quick Start with AI */}
          <Link
            href="/demos/new/ai"
            className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-[#2770ef] hover:shadow-lg transition-all"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2770ef]/10 text-2xl">
              ✨
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-[#2770ef] transition-colors">
              Quick Start with AI
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Describe what you want in plain English. Claude fills in the config for you.
            </p>
            <div className="mt-6 text-sm font-medium text-[#2770ef]">
              Get started →
            </div>
          </Link>

          {/* Step-by-Step Wizard */}
          <Link
            href="/demos/new/wizard"
            className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-[#2770ef] hover:shadow-lg transition-all"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
              🧭
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-[#2770ef] transition-colors">
              Step-by-Step Wizard
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Fill in each field guided with explanations at every step.
            </p>
            <div className="mt-6 text-sm font-medium text-[#2770ef]">
              Open wizard →
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
