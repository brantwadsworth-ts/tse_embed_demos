import { getDemoById } from "@/lib/demos";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";
import EditDemoForm from "@/components/EditDemoForm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [demo, session] = await Promise.all([getDemoById(id), auth()]);

  if (!demo) notFound();

  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);

  // view-only users can't edit
  if (userRole === "view") redirect(`/demos/${id}`);

  // Non-owners get redirected back to the detail view
  if (demo.owner && demo.owner !== login) {
    redirect(`/demos/${id}`);
  }

  return (
    <div className="min-h-full">
      <Nav isAdmin={userRole === "admin"} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/demos/${id}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to demo
        </Link>
        <h1 className="mt-2 mb-8 text-2xl font-bold text-gray-900">Edit Demo</h1>
        <EditDemoForm demo={demo} />
      </main>
    </div>
  );
}
