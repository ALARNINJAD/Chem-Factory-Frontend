"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useIsClient } from "@/lib/use-is-client";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const isClient = useIsClient();
  const authed = isClient && isAuthenticated;

  return (
    <nav className="border-b-4 border-[var(--border-color)] bg-[var(--bg-panel)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-sm tracking-wider text-[var(--accent-primary)] hover:text-[#2dd4aa] transition-colors">
          {"<"}CHEM FACTORY{">"}
        </Link>
        <div className="flex items-center gap-4 text-xs">
          {authed ? (
            <>
              <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                [DASHBOARD]
              </Link>
              <Link href="/profile" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                [PROFILE]
              </Link>
              <Link href="/inventory" className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                [INVENTORY]
              </Link>
              <Link href="/market" className="text-[var(--text-muted)] hover:text-[var(--accent-warning)] transition-colors">
                [MARKET]
              </Link>
              <Link href="/mixer" className="text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
                [MIXER]
              </Link>
              <button
                onClick={logout}
                className="text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-colors"
              >
                [LOGOUT]
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                [LOGIN]
              </Link>
              <Link
                href="/register"
                className="pixel-btn pixel-btn--primary text-[10px] py-1 px-3"
              >
                [REGISTER]
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
