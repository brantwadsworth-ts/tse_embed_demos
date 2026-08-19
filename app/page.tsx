import DoorDashLogo from "@/components/DoorDashLogo";
import LoginForm from "@/components/LoginForm";
import { getDemoUsers } from "@/lib/demoUsers";

// The demo user list is mutated at runtime (see lib/demoUsers.ts), so this
// page must re-read it on every request rather than being statically
// optimized at build time.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await getDemoUsers();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-dd-border bg-white px-6 py-4">
        <DoorDashLogo />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-dd-border bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-extrabold text-dd-black">
            Brand Portal
          </h1>
          <p className="mb-6 text-sm text-dd-gray">
            Sign in to view your brand&apos;s DoorDash performance data.
          </p>
          <LoginForm users={users} />
        </div>
      </main>
    </div>
  );
}
