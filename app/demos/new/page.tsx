import Nav from "@/components/Nav";
import NewDemoForm from "@/components/NewDemoForm";

export default function NewDemoPage() {
  return (
    <div className="min-h-full">
      <Nav />
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
