import { getDemoById } from "@/lib/demos";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";
import ForkDemoForm from "@/components/ForkDemoForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ForkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [demo, session] = await Promise.all([getDemoById(id), auth()]);

  if (!demo) notFound();

  const currentLogin = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(currentLogin);

  return (
    <div className="min-h-full">
      <Nav isAdmin={userRole === "admin"} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href={`/demos/${id}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to demo
        </Link>
        <h1 className="mt-2 mb-8 text-2xl font-bold text-gray-900">Fork Demo</h1>
        <ForkDemoForm demo={demo} currentLogin={currentLogin} />
      </main>
    </div>
  );
}
