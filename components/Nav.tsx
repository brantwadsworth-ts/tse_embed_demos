"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Nav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/demos" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2770ef]">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Demo Builder</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/demos"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/demos"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Library
            </Link>
            <Link
              href="/demos/new"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/demos/new"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              New Demo
            </Link>
            {isAdmin && (
              <Link
                href="/admin/access"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/admin/access"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Team
              </Link>
            )}
            <Link
              href="/settings"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/settings"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/demos/new"
            className="rounded-lg bg-[#2770ef] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#1a56c4] transition-colors"
          >
            + New Demo
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
