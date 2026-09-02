import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewDemoPage() {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);

  // Only redirect if we have a confirmed login AND it's view-only
  // Empty login means JWT is stale — allow through rather than locking out
  if (login && userRole === "view") redirect("/demos");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Demo</h1>
          <p className="mt-2 text-gray-500">Choose how you want to get started.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* Quick Start with AI */}
          <Link
            href="/demos/new/ai"
            className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-[#2770ef] hover:shadow-lg transition-all"
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
            className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-[#2770ef] hover:shadow-lg transition-all"
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

          {/* Portal Builder */}
          <Link
            href="/demos/new/portal"
            className="group flex flex-col rounded-2xl border-2 border-emerald-200 bg-white p-6 hover:border-emerald-500 hover:shadow-lg transition-all"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
              🏗️
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
              Build a Portal
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Guided 8-round interview generates a <code className="font-mono text-xs">spec.json</code> and runs the codemod to build a full branded Vite + React portal.
            </p>
            <div className="mt-6 text-sm font-medium text-emerald-600">
              Start building →
            </div>
          </Link>
        </div>
    </main>
  );
}
