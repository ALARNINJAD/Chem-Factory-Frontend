"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { User, InventoryItem } from "@/lib/types";
import Link from "next/link";

const SPRITES = ["flask", "bottle", "beaker", "gear", "crystal"] as const;

function getSprite(materialId: number) {
  return SPRITES[materialId % SPRITES.length];
}

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const [profile, inv] = await Promise.all([
          api.user.profile(token!),
          api.inventory.export(token!),
        ]);
        setUser(profile);
        setInventory(inv);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated, token, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* HUD skeleton */}
        <div className="pixel-panel space-y-3">
          <div className="flex justify-between">
            <div className="pixel-skeleton pixel-skeleton--title" />
            <div className="pixel-skeleton pixel-skeleton--text" style={{ width: 40 }} />
          </div>
          <div className="pixel-skeleton pixel-skeleton--text" />
          <div className="pixel-skeleton pixel-skeleton--text" style={{ width: "40%" }} />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pixel-panel pixel-panel--inset p-2 flex flex-col items-center gap-2">
              <div className="pixel-skeleton pixel-skeleton--box" />
              <div className="pixel-skeleton pixel-skeleton--text" style={{ width: 20 }} />
              <div className="pixel-skeleton pixel-skeleton--text" style={{ width: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HUD Header */}
      {user && (
        <div className="pixel-panel">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--accent-primary)] text-xs hover-lift">
              {">"} {user.username}
            </span>
            <span className="text-[8px] text-[var(--text-muted)]">
              LVL {user.level}
            </span>
          </div>

          {/* XP Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[8px] text-[var(--text-muted)] mb-1">
              <span>XP</span>
              <span>{user.xp} / {(user.level + 1) * 100}</span>
            </div>
            <div className="pixel-progress">
              <div
                className="pixel-progress__fill"
                style={{ width: `${Math.min((user.xp / ((user.level + 1) * 100)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-2">
            <span className="sprite-slot" style={{ width: 18, height: 18 }}>
              <span className="pixel-sprite pixel-sprite--coin" />
            </span>
            <span className="text-[var(--coin-gold)] text-[10px]">
              {user.balance} credits
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/market" className="pixel-btn pixel-btn--warning w-full hover-lift hover-glow-amber">
          {"[ MARKET ]"}
        </Link>
        <Link href="/mixer" className="pixel-btn pixel-btn--primary w-full hover-lift hover-glow-teal">
          {"[ MIXER ]"}
        </Link>
      </div>

      {/* Inventory Grid */}
      <div className="pixel-panel">
        <h2 className="text-[10px] text-[var(--text-secondary)] mb-3">
          {"<"}INVENTORY{">"}
        </h2>
        {inventory.length === 0 ? (
          <div className="pixel-panel pixel-panel--inset text-center py-6">
            <p className="text-[8px] text-[var(--text-muted)]">
              EMPTY... VISIT THE MARKET
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="pixel-panel pixel-panel--inset p-2 flex flex-col items-center gap-1 hover:border-[var(--accent-primary)] transition-colors hover-lift"
              >
                <div className="sprite-slot">
                  <span className={`pixel-sprite pixel-sprite--${getSprite(item.material_id)}`} />
                </div>
                <span className="text-[7px] text-[var(--text-secondary)]">
                  {item.material_name}
                </span>
                <span className="text-[8px] text-[var(--accent-primary)]">
                  x{item.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
