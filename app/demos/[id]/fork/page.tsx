import Nav from "@/components/Nav";
import Link from "next/link";

export default async function ForkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-full">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link href={`/demos/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Fork Demo</h1>
        <p className="mt-2 text-gray-500">Fork form coming soon.</p>
      </main>
    </div>
  );
}
