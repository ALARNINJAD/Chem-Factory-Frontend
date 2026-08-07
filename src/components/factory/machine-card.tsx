"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useGame } from "@/lib/game-context";
import { MaterialIcon } from "@/components/material-icon";
import type { MixerEntry } from "@/lib/types";

gsap.registerPlugin(useGSAP);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MachineCardProps {
  mix: MixerEntry;
  totalEstimate: number;
  onCollect: () => void;
  onName: () => void;
}

export function MachineCard({ mix, totalEstimate, onCollect, onName }: MachineCardProps) {
  const { liveRemaining } = useGame();
  const root = useRef<HTMLDivElement>(null);

  const remaining = liveRemaining(mix);
  const done = remaining <= 0;
  const ready = done && !mix.is_new;
  const progress = totalEstimate > 0 ? Math.min(1, Math.max(0, 1 - remaining / totalEstimate)) : 0;

  useGSAP(
    () => {
      gsap.fromTo(
        root.current,
        { scale: 0.9, autoAlpha: 0, y: 14 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(2)" }
      );

      if (!done && !mix.is_new) {
        gsap.to(".bubble", {
          y: -30,
          autoAlpha: 0,
          duration: 1.5,
          ease: "power1.out",
          stagger: 0.45,
          repeat: -1,
        });
      } else {
        gsap.killTweensOf(".bubble");
        gsap.set(".bubble", { autoAlpha: 0 });
      }

      if (done) {
        gsap.fromTo(
          root.current,
          { boxShadow: "0 0 0px rgba(34,197,94,0)" },
          { boxShadow: "0 0 18px rgba(34,197,94,0.65)", duration: 0.7, yoyo: true, repeat: -1 }
        );
      }
    },
    { scope: root, dependencies: [mix.id, done, mix.is_new] }
  );

  return (
    <div
      ref={root}
      className={`pixel-panel flex flex-col ${ready ? "machine-ready" : ""} hover-lift`}
    >
      <div className="machine-viewport pixel-panel pixel-panel--inset p-2 mb-2 flex flex-col items-center">
        {mix.is_new && (
          <span className="text-[7px] text-[var(--accent-warning)] animate-blink mb-1">
            [UNKNOWN COMBO]
          </span>
        )}
        <div className="flex items-center gap-1">
          <MaterialIcon name={mix.first_ingredient_name} id={mix.first_ingredient_id} size={22} />
          <span className="text-[var(--text-muted)] text-[8px]">+</span>
          <MaterialIcon name={mix.second_ingredient_name} id={mix.second_ingredient_id} size={22} />
        </div>
        <div className="relative h-8 w-full mt-1">
          <span className="bubble" style={{ left: "20%" }} />
          <span className="bubble" style={{ left: "48%", animationDelay: "0.3s" }} />
          <span className="bubble" style={{ left: "72%", animationDelay: "0.6s" }} />
        </div>
      </div>

      <div className="text-center mb-1">
        {done ? (
          <span className={`text-[9px] ${mix.is_new ? "text-[var(--accent-warning)]" : "text-[var(--accent-success)]"}`}>
            {mix.is_new ? "READY TO NAME" : "READY"}
          </span>
        ) : (
          <span className="text-[9px] text-[var(--accent-info)]">{formatTime(remaining)}</span>
        )}
      </div>

      <div className="pixel-progress mb-2">
        <div className="pixel-progress__fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="text-[7px] text-[var(--text-muted)] text-center mb-2">
        QTY x{mix.amount} {mix.first_ingredient_name} + {mix.second_ingredient_name}
      </div>

      {done &&
        (mix.is_new ? (
          <button onClick={onName} className="pixel-btn pixel-btn--warning text-[8px] hover-lift w-full">
            [NAME IT]
          </button>
        ) : (
          <button onClick={onCollect} className="pixel-btn pixel-btn--success text-[8px] hover-lift w-full">
            [COLLECT]
          </button>
        ))}
    </div>
  );
}
