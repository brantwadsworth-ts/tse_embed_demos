import { getDemoById } from "@/lib/demos";
import DemoPortal from "@/components/portal/DemoPortal";
import { notFound } from "next/navigation";
import "./portal.css";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = await getDemoById(slug);
  if (!demo) notFound();
  return <DemoPortal demo={demo} />;
}
