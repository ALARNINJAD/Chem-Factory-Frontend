"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcon } from "@/components/material-icon";
import type { User, InventoryItem, MixerEntry } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [mixes, setMixes] = useState<MixerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const [profile, inv, mx] = await Promise.all([
          api.user.profile(token!),
          api.inventory.export(token!),
          api.mixer.mixes(token!).catch(() => []),
        ]);
        setUser(profile);
        setInventory(inv);
        setMixes(mx);
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
              <span>{user.xp} / 1000</span>
            </div>
            <div className="pixel-progress">
              <div
                className="pixel-progress__fill"
                style={{ width: `${Math.min((user.xp / 1000) * 100, 100)}%` }}
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

      {/* Active Mixes */}
      <div className="pixel-panel">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] text-[var(--accent-secondary)]">
            {"<"}ACTIVE MIXES{">"}
          </h2>
          <Link
            href="/mixer"
            className="text-[7px] text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors"
          >
            [GO TO MIXER]
          </Link>
        </div>
        {mixes.length === 0 ? (
          <div className="pixel-panel pixel-panel--inset text-center py-4">
            <p className="text-[8px] text-[var(--text-muted)]">
              NO MIXES RUNNING
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {mixes.map((mix) => (
              <div key={mix.id} className="flex items-center justify-between text-[8px]">
                <span className="text-[var(--text-secondary)]">
                  #{mix.id} {mix.first_ingredient_name} + {mix.second_ingredient_name} ={" "}
                  {mix.is_new ? (
                    <span className="text-[var(--accent-warning)]">[NEW!]</span>
                  ) : (
                    mix.material_name
                  )}
                </span>
                <span className="text-[var(--text-muted)]">
                  {mix.remaining_seconds}s LEFT
                </span>
              </div>
            ))}
          </div>
        )}
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
                <MaterialIcon name={item.material_name} id={item.material_id} />
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
