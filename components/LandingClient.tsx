"use client";

import { useMemo, useState } from "react";
import LiveboardEmbedView from "@/components/LiveboardEmbedView";
import SpotterEmbedView from "@/components/SpotterEmbedView";
import UserOnboardingView from "@/components/UserOnboardingView";
import Sidebar from "@/components/Sidebar";
import { DemoUser } from "@/lib/demoUsers";

export type View = "overview" | "ai-analytics" | "user-onboarding";

interface LandingClientProps {
  user: DemoUser;
  /** RLS-scoped Country Name values fetched live for this user. */
  countries: string[];
}

export default function LandingClient({ user, countries }: LandingClientProps) {
  const countryOptions = useMemo(() => {
    if (countries.length === 0) return ["ALL"];
    return countries.length > 1 ? ["ALL", ...countries] : countries;
  }, [countries]);

  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [activeView, setActiveView] = useState<View>("overview");
  const dropdownDisabled = countryOptions.length <= 1;

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar user={user} activeView={activeView} onNavigate={setActiveView} />

      {activeView === "overview" && (
        <main className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-dd-black">
                Coke Performance on DoorDash
              </h1>
              <p className="text-sm text-dd-gray">
                Sales and category totals, filtered by your access level.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-dd-black">
              Country
              <select
                value={selectedCountry}
                disabled={dropdownDisabled}
                onChange={(event) => setSelectedCountry(event.target.value)}
                className="rounded-lg border border-dd-border bg-white px-3 py-1.5 text-sm text-dd-black focus:border-dd-red focus:outline-none focus:ring-2 focus:ring-dd-red/20 disabled:bg-dd-gray-light disabled:text-dd-gray"
              >
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country === "ALL" ? "All countries" : country}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="min-h-[600px] flex-1 rounded-xl border border-dd-border bg-white p-2">
            <LiveboardEmbedView selectedCountry={selectedCountry} />
          </div>
        </main>
      )}

      {activeView === "ai-analytics" && (
        <main className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h1 className="text-xl font-extrabold text-dd-black">AI Analytics</h1>
            <p className="text-sm text-dd-gray">
              Ask questions about Coke&apos;s performance on DoorDash in plain English.
            </p>
          </div>

          <div className="min-h-[600px] flex-1 rounded-xl border border-dd-border bg-white p-2">
            <SpotterEmbedView />
          </div>
        </main>
      )}

      {activeView === "user-onboarding" && (
        <main className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h1 className="text-xl font-extrabold text-dd-black">User Onboarding</h1>
            <p className="text-sm text-dd-gray">
              Create a new user, assign a ThoughtSpot group, and set their RLS variable
              values.
            </p>
          </div>

          <UserOnboardingView />
        </main>
      )}
    </div>
  );
}
