import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";
import PortalBuilder from "@/components/PortalBuilder";

export const dynamic = "force-dynamic";

export default async function PortalBuilderPage() {
  const session = await auth();
  const login = (session?.user as { login?: string })?.login ?? "";
  const userRole = await getRole(login);

  if (login && userRole === "view") redirect("/demos");

  return <PortalBuilder />;
}
