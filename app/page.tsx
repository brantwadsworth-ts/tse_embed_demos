import DoorDashLogo from "@/components/DoorDashLogo";
import LoginForm from "@/components/LoginForm";
import { getDemoUsers } from "@/lib/demoUsers";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await getDemoUsers();

  return (
    <div className="flex min-h-screen flex-1">
      {/* Left — branded panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #FF3008 0%, #c41e00 100%)" }}
      >
        <DoorDashLogo light />

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/60">
            Brand Partner Analytics
          </p>
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Your brand's performance,<br />all in one place.
          </h2>
          <p className="mt-4 text-base text-white/80">
            Real-time sales data, category trends, and AI-powered insights — secured to your scope.
          </p>
        </div>

        <div className="flex gap-8 text-white/70 text-sm">
          <span>© {new Date().getFullYear()} DoorDash, Inc.</span>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-1 flex-col bg-[#f7f7f7]">
        {/* Mobile header */}
        <header className="border-b border-dd-border bg-white px-6 py-4 lg:hidden">
          <DoorDashLogo />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <div className="mb-8 hidden lg:block">
              <DoorDashLogo />
            </div>

            <div className="rounded-2xl border border-dd-border bg-white p-8 shadow-sm">
              <h1 className="mb-1 text-2xl font-extrabold text-dd-black">
                Brand Portal
              </h1>
              <p className="mb-6 text-sm text-dd-gray">
                Sign in to view your brand&apos;s DoorDash performance data.
              </p>
              <LoginForm users={users} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
