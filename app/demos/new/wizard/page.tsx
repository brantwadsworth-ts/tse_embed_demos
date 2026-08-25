import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import Nav from "@/components/Nav";
import DemoWizard from "@/components/DemoWizard";
import { Demo } from "@/lib/demos";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ prefill?: string }>;
}

export default async function WizardPage({ searchParams }: Props) {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);

  if (userRole === "view") redirect("/demos");

  const params = await searchParams;
  let prefillData: Partial<Demo> | undefined;
  if (params.prefill) {
    try {
      prefillData = JSON.parse(Buffer.from(params.prefill, "base64").toString("utf-8")) as Partial<Demo>;
    } catch {
      // ignore malformed prefill
    }
  }

  return (
    <div className="min-h-full">
      <Nav isAdmin={userRole === "admin"} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <DemoWizard prefillData={prefillData} hasPrefill={!!params.prefill} />
      </main>
    </div>
  );
}
