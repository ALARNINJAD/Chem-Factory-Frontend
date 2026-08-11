"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface GameModalProps {
  open: boolean;
  title: string;
  tone?: "teal" | "amber" | "purple" | "green" | "red";
  onClose: () => void;
  children: ReactNode;
}

const TITLE_COLORS: Record<NonNullable<GameModalProps["tone"]>, string> = {
  teal: "text-[var(--accent-primary)]",
  amber: "text-[var(--accent-warning)]",
  purple: "text-[var(--accent-secondary)]",
  green: "text-[var(--accent-success)]",
  red: "text-[var(--accent-danger)]",
};

export function GameModal({ open, title, tone = "teal", onClose, children }: GameModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".modal-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
      gsap.fromTo(
        ".modal-panel",
        { scale: 0.85, autoAlpha: 0, y: 18 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.28, ease: "back.out(1.7)" }
      );
    }, ref);
    return () => ctx.revert();
  }, [open]);

  if (!open) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div className="modal-overlay absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="modal-panel relative pixel-panel w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-[10px] ${TITLE_COLORS[tone]}`}>{"<"}{title}{">"}</h2>
          <button
            onClick={onClose}
            className="text-[8px] text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-colors"
          >
            [CLOSE]
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
