import { getAllDemos } from "@/lib/demos";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const all = await getAllDemos();
  const live = all.filter((d) => d.status === "live");
  return <GalleryClient demos={live} />;
}
