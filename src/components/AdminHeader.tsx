"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  FolderKanban,
  Inbox,
  LogOut,
  Lock,
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Submissions", href: "/submissions", icon: FolderKanban },
  { label: "Inbox", href: "/inbox", icon: Inbox },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    localStorage.removeItem("indigo_admin_logged_in");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#252b3b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E71C34] to-[#700B1C] flex items-center justify-center text-white shadow-lg shadow-[#E71C34]/20">
            <ShieldAlert className="w-5 h-5 text-[#F3E000]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">
                indigo<span className="text-[#E71C34]">Admin</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E71C34]/20 border border-[#E71C34]/40 text-[#ff6b7d] flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Internal
              </span>
            </div>
            <p className="text-[10px] text-gray-400 -mt-0.5 hidden sm:block">
              Curation &amp; Intake Management Portal
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#E71C34] text-white shadow-md shadow-[#E71C34]/25"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-[#252b3b] hover:border-red-800/60 transition-colors"
            title="Keluar dari Portal Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
