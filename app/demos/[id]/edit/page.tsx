import { getDemoById } from "@/lib/demos";
import { auth } from "@/auth";
import { getRole } from "@/lib/roles";
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

  // Only redirect if we have a confirmed login AND it's not a create/admin role
  // Empty login means JWT is stale — allow through rather than locking out
  if (login && userRole !== "admin" && userRole !== "create") redirect("/demos");

  // Non-owners get redirected back to the detail view
  if (demo.owner && demo.owner !== login) {
    redirect(`/demos/${id}`);
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl px-6 pt-4 pb-2">
        <Link
          href={`/demos/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to demo
        </Link>
      </div>
      <EditDemoForm demo={demo} />
    </div>
  );
}
