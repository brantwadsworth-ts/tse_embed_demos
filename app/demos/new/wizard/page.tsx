import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
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

  // Only redirect if we have a confirmed login AND it's view-only
  // Empty login means JWT is stale — allow through rather than locking out
  if (login && userRole === "view") redirect("/demos");

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
    <main className="mx-auto max-w-2xl px-6 py-10">
      <DemoWizard prefillData={prefillData} hasPrefill={!!params.prefill} />
    </main>
  );
}
