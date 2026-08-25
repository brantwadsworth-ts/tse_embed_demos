import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";
import NewDemoForm from "@/components/NewDemoForm";

export const dynamic = "force-dynamic";

export default async function NewDemoPage() {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);

  if (userRole === "view") redirect("/demos");

  return (
    <div className="min-h-full">
      <Nav isAdmin={userRole === "admin"} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">New Demo Request</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the details below. A Claude agent will use this to build the demo branch, dataset, and ThoughtSpot connection.
          </p>
        </div>
        <NewDemoForm />
      </main>
    </div>
  );
}
