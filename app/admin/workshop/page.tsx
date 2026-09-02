import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import WorkshopProvisioner from "@/components/WorkshopProvisioner";

export const dynamic = "force-dynamic";

export default async function WorkshopPage() {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const role = await getRole(login);
  if (role !== "admin") redirect("/demos");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Workshop Provisioner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bulk-create ThoughtSpot users for demo workshops. Users are created as{" "}
          <code className="rounded bg-gray-100 px-1 text-xs">LOCAL_USER</code> with no email
          confirmation — each gets their own independent workspace.
        </p>
      </div>
      <WorkshopProvisioner />
    </main>
  );
}
