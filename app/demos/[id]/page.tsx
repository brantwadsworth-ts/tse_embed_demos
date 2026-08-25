import { getDemoById } from "@/lib/demos";
import { auth } from "@/auth";
import DemoDetail from "@/components/DemoDetail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DemoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [demo, session] = await Promise.all([getDemoById(id), auth()]);
  if (!demo) notFound();
  const currentLogin = (session?.user as { login?: string })?.login ?? "";
  return <DemoDetail demo={demo} currentLogin={currentLogin} />;
}
