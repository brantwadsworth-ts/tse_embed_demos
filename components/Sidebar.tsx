"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { resetCachedAuthToken } from "@thoughtspot/visual-embed-sdk";
import DoorDashLogo from "@/components/DoorDashLogo";
import { DemoUser } from "@/lib/demoUsers";
import type { View } from "@/components/LandingClient";

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const NAV_ITEMS: Array<{
  label: string;
  view?: View;
  icon: ReactNode;
  adminOnly?: boolean;
}> = [
  {
    label: "Overview",
    view: "overview",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
      </svg>
    ),
  },
  {
    label: "AI Analytics",
    view: "ai-analytics",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M8 1.5l1.2 3.3L12.5 6 9.2 7.2 8 10.5 6.8 7.2 3.5 6l3.3-1.2L8 1.5Z" />
        <path d="M12.5 10l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z" />
      </svg>
    ),
  },
  {
    label: "User Onboarding",
    view: "user-onboarding",
    adminOnly: true,
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="6" cy="5.5" r="2.5" />
        <path d="M1.5 14c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" />
        <path d="M12.5 4.5v4M10.5 6.5h4" />
      </svg>
    ),
  },
  {
    label: "Performance Reports",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M2 14V8.5M8 14V2M14 14V6" />
      </svg>
    ),
  },
  {
    label: "Campaigns",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M1.5 6.5v3l10 3V3.5l-10 3Z" />
        <path d="M4.5 9.5v3a1 1 0 0 0 2 0V10" />
        <path d="M11.5 6c1.4 0 2.5 1.1 2.5 2.5S12.9 11 11.5 11" />
      </svg>
    ),
  },
  {
    label: "Brand Assets",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
        <circle cx="5.5" cy="6.5" r="1.25" />
        <path d="M2 12l3.5-3.5 2 2 3-3.5 3.5 4" />
      </svg>
    ),
  },
  {
    label: "Audience Insights",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="5.75" cy="5.5" r="2" />
        <path d="M2 13c0-1.9 1.68-3.25 3.75-3.25S9.5 11.1 9.5 13" />
        <circle cx="11.25" cy="6" r="1.5" />
        <path d="M10.5 9.75c1.6.1 2.75 1.2 2.75 2.75" />
      </svg>
    ),
  },
  {
    label: "Billing",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
        <path d="M1.5 6.5h13" />
        <path d="M4 9.5h3" />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="8" cy="8" r="2" />
        <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
      </svg>
    ),
  },
  {
    label: "Help & Support",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M6.2 6.2a1.8 1.8 0 1 1 2.7 1.9c-.6.4-.9.7-.9 1.5" />
        <path d="M8 11.2v.1" />
      </svg>
    ),
  },
];

function initialsFromRole(role: string) {
  return role
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface SidebarProps {
  user: DemoUser;
  activeView: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ user, activeView, onNavigate }: SidebarProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    resetCachedAuthToken();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="hidden w-64 shrink-0 flex-col bg-dd-sidebar py-4 sm:flex">
      <div className="px-5 pb-4">
        <DoorDashLogo light />
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-dd-sidebar-border bg-dd-sidebar-card px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dd-red text-sm font-bold text-white">
          C
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Coke</p>
          <p className="truncate text-xs text-dd-sidebar-muted">{user.role}</p>
        </div>
        <button
          type="button"
          title="Switch account"
          onClick={(event) => event.preventDefault()}
          className="shrink-0 text-dd-sidebar-muted transition hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 5.5h9l-2-2M13.5 10.5h-9l2 2" />
          </svg>
        </button>
      </div>

      <ul className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "Internal Admin").map(
          (item) => {
            const isActive = item.view !== undefined && item.view === activeView;
            return (
              <li key={item.label}>
                <a
                  href="#"
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    if (item.view) onNavigate(item.view);
                  }}
                  className={
                    isActive
                      ? "flex items-center gap-3 rounded-lg bg-dd-sidebar-card px-3 py-2 text-sm font-semibold text-white"
                      : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-dd-sidebar-muted transition hover:bg-dd-sidebar-card hover:text-white"
                  }
                >
                  <span className={isActive ? "text-dd-red" : "text-current"}>
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          },
        )}
      </ul>

      <div className="mx-3 mt-2 flex items-center gap-3 border-t border-dd-sidebar-border px-3 pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dd-sidebar-card text-xs font-bold text-white">
          {initialsFromRole(user.role)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user.role}</p>
          <p className="truncate text-xs text-dd-sidebar-muted">{user.username}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out"
          className="shrink-0 text-dd-sidebar-muted transition hover:text-white disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 14H3.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1H6" />
            <path d="M10.5 11.5 14 8l-3.5-3.5M14 8H6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
