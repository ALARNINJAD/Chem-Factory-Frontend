"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuth } from "@/lib/auth-context";
import { useGame } from "@/lib/game-context";
import { sfx } from "@/lib/sfx";

gsap.registerPlugin(useGSAP);

export function GameHud() {
  const { isAuthenticated, logout } = useAuth();
  const { user } = useGame();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!menuOpen || !menuRef.current) return;
      gsap.fromTo(
        ".menu-overlay",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.15 }
      );
      gsap.fromTo(
        ".menu-panel",
        { scale: 0.85, autoAlpha: 0, y: 16 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.25, ease: "back.out(1.7)" }
      );
    },
    { scope: menuRef, dependencies: [menuOpen] }
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(path: string) {
    setMenuOpen(false);
    router.push(path);
  }

  function handleLogout() {
    sfx.click();
    setMenuOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <div className="h-14 shrink-0 border-b-4 border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between px-4">
      <a
        href={isAuthenticated ? "/dashboard" : "/"}
        className="flex items-center hover:opacity-90 transition-opacity"
        aria-label="Chem Factory"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sm.png" alt="Chem Factory" className="h-9 w-auto" />
      </a>

      <div className="flex items-center gap-3">
        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <span className="sprite-slot" style={{ width: 18, height: 18 }}>
              <span className="pixel-sprite pixel-sprite--coin" />
            </span>
            <span className="text-[var(--coin-gold)] text-[10px]">{user.balance}</span>
          </div>
        )}
        {isAuthenticated && (
          <button
            onClick={() => {
              sfx.click();
              setMenuOpen((o) => !o);
            }}
            className="pixel-btn text-[9px] px-3 py-1 hover-lift"
          >
            [MENU]
          </button>
        )}
      </div>

      {menuOpen && (
        <div ref={menuRef} className="fixed inset-0 z-[8000] flex items-center justify-center p-4">
          <div className="menu-overlay absolute inset-0 bg-black/80" onClick={() => setMenuOpen(false)} />
          <div className="menu-panel relative pixel-panel w-72 text-center p-6">
            <h2 className="text-[10px] text-[var(--accent-primary)] mb-1">{"<"}PAUSED{">"}</h2>
            <div className="text-[7px] text-[var(--text-muted)] mb-5">{user?.username}</div>
            <div className="space-y-3">
              <button onClick={() => go("/dashboard")} className="pixel-btn w-full hover-lift">
                [ FLOOR ]
              </button>
              <button onClick={() => go("/profile")} className="pixel-btn w-full hover-lift">
                [ PROFILE ]
              </button>
              <button onClick={handleLogout} className="pixel-btn pixel-btn--danger w-full hover-lift">
                [ LOGOUT ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
