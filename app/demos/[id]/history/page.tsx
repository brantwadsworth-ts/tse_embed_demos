import { getDemoById } from "@/lib/demos";
import { getRevisions } from "@/lib/revisions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export const dynamic = "force-dynamic";

export default async function DemoHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [demo, revisions] = await Promise.all([getDemoById(id), getRevisions(id)]);
  if (!demo) notFound();

  const login = (session.user as { login?: string }).login ?? "";
  const isOwner = !demo.owner || demo.owner === login;

  return <HistoryClient demo={demo} revisions={revisions} isOwner={isOwner} />;
}
