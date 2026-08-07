"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuth } from "@/lib/auth-context";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".title-logo",
        { autoAlpha: 0, scale: 0.92, y: -24 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.4)" }
      );
      gsap.fromTo(".title-sub", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, delay: 0.35 });
      gsap.fromTo(
        ".title-menu > *",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.15, delay: 0.55 }
      );
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="h-full overflow-y-auto title-bg flex flex-col items-center justify-center gap-6 p-4 page-enter"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Chem Factory" className="title-logo max-w-xs sm:max-w-sm w-full" />

      <div className="title-sub text-[8px] text-[var(--text-muted)] tracking-widest text-center">
        ::: INDUSTRIAL CHEMISTRY SIMULATOR :::
      </div>

      <div className="title-menu flex flex-col gap-3 w-64">
        <Link href="/login" className="pixel-btn pixel-btn--primary w-full hover-lift hover-glow-teal">
          [ START ]
        </Link>
      </div>
    </div>
  );
}
