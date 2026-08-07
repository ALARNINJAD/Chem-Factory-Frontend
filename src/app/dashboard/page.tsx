"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuth } from "@/lib/auth-context";
import { useGame } from "@/lib/game-context";
import { useToast } from "@/components/toast";
import { MaterialIcon } from "@/components/material-icon";
import { MachineCard } from "@/components/factory/machine-card";
import { DiscoveryModal } from "@/components/factory/discovery-modal";
import type { MixerEntry, InventoryItem, MarketItem } from "@/lib/types";

gsap.registerPlugin(useGSAP);

type StationId = "shop" | "storage" | "market";

const STATIONS: Array<{
  id: StationId;
  label: string;
  sub: string;
  icon: string;
  color: string;
}> = [
  { id: "shop", label: "SHOP", sub: "BUY RAW MATERIALS", icon: "Item_126.png", color: "amber" },
  { id: "storage", label: "STORAGE", sub: "YOUR STOCK", icon: "Item_174.png", color: "teal" },
  { id: "market", label: "MARKET", sub: "TRADE WITH PLAYERS", icon: "Item_172.png", color: "purple" },
];

export default function FactoryFloorPage() {
  const { isAuthenticated } = useAuth();
  const { user, inventory, market, mixes, loading, pick, mixTotal } = useGame();
  const { toast } = useToast();
  const router = useRouter();
  const floorRef = useRef<HTMLDivElement>(null);
  const xpRef = useRef<HTMLDivElement>(null);
  const [station, setStation] = useState<StationId | null>(null);
  const [discoveryMix, setDiscoveryMix] = useState<MixerEntry | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useGSAP(
    () => {
      if (loading) return;
      gsap.fromTo(".hud-panel", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
      if (mixes.length > 0) {
        gsap.fromTo(
          ".machine-wrap",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(2)", stagger: 0.08 }
        );
      }
      gsap.fromTo(
        ".station-tile",
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)", stagger: 0.06 }
      );
    },
    { scope: floorRef, dependencies: [loading, mixes.length] }
  );

  useGSAP(
    () => {
      if (xpRef.current && user) {
        const pct = Math.min((user.xp / 1000) * 100, 100);
        gsap.fromTo(xpRef.current, { width: "0%" }, { width: `${pct}%`, duration: 0.8, ease: "power2.out" });
      }
    },
    { dependencies: [user?.xp, user?.level], revertOnUpdate: true }
  );

  const SHOP_USERNAME = "ADMIN HASTAM";
  const shopItems = market.filter((m) => m.username === SHOP_USERNAME);
  const playerItems = market.filter((m) => m.username !== SHOP_USERNAME);

  async function handleCollect(mix: MixerEntry) {
    try {
      const res = await pick(mix.id);
      if (res.is_new) {
        setDiscoveryMix(mix);
      } else {
        toast("MATERIAL COLLECTED!", "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "COULD NOT COLLECT", "error");
    }
  }

  if (loading && !user) {
    return (
      <div className="space-y-4" ref={floorRef}>
        <div className="pixel-panel space-y-3">
          <div className="flex justify-between">
            <div className="pixel-skeleton pixel-skeleton--title" />
            <div className="pixel-skeleton pixel-skeleton--text" style={{ width: 40 }} />
          </div>
          <div className="pixel-skeleton pixel-skeleton--text" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="pixel-panel pixel-panel--inset p-3">
              <div className="pixel-skeleton pixel-skeleton--box" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pct = user ? Math.min((user.xp / 1000) * 100, 100) : 0;

  return (
    <div className="floor-bg p-4 sm:p-5 space-y-5 page-enter" ref={floorRef}>
      {/* HUD */}
      <div className="hud-panel pixel-panel flex items-center justify-between gap-3">
        <div>
          <span className="text-[var(--accent-primary)] text-xs">{" > "}{user?.username}</span>
          <div className="text-[7px] text-[var(--text-muted)] mt-1">PLAYER #{user?.id}</div>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-[7px] text-[var(--text-muted)] mb-1">
            <span>LVL {user?.level}</span>
            <span>{user?.xp} / 1000 XP</span>
          </div>
          <div className="pixel-progress">
            <div ref={xpRef} className="pixel-progress__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="sprite-slot" style={{ width: 18, height: 18 }}>
            <span className="pixel-sprite pixel-sprite--coin" />
          </span>
          <span className="text-[var(--coin-gold)] text-[10px]">{user?.balance} credits</span>
        </div>
      </div>

      {/* Machines */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] text-[var(--accent-secondary)]">
            {"<"}MIXING MACHINES{">"}
          </h2>
          <Link href="/mixer" className="text-[7px] text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
            [+ NEW MIX]
          </Link>
        </div>
        {mixes.length === 0 ? (
          <div className="machine-wrap pixel-panel pixel-panel--inset text-center py-8">
            <p className="text-[8px] text-[var(--text-muted)]">
              ALL MACHINES IDLE...
            </p>
            <p className="text-[7px] text-[var(--text-muted)] mt-2">
              BUY MATERIALS AT THE SHOP, THEN START A MIX
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {mixes.map((mix) => (
              <div key={mix.id} className="machine-wrap">
                <MachineCard
                  mix={mix}
                  totalEstimate={mixTotal(mix.id)}
                  onCollect={() => handleCollect(mix)}
                  onName={() => setDiscoveryMix(mix)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stations */}
      <div>
        <h2 className="text-[10px] text-[var(--text-secondary)] mb-2">
          {"<"}FACTORY STATIONS{">"}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {STATIONS.map((s) => {
            const active = station === s.id;
            return (
              <div
                key={s.id}
                className={`station-tile pixel-panel flex flex-col items-center py-4 hover-lift ${active ? "station-tile--active" : ""}`}
                onClick={() => setStation(active ? null : s.id)}
              >
                <div className="station-icon mb-2 sprite-slot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/items/${s.icon}`} alt={s.label} className="pixel-sprite-img" />
                </div>
                <div className="text-[9px] text-[var(--text-secondary)]">[{s.label}]</div>
                <div className="text-[6px] text-[var(--text-muted)] mt-1">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Station panels */}
      {station && (
        <StationPanel
          station={station}
          shopItems={shopItems}
          playerItems={playerItems}
          inventory={inventory}
        />
      )}

      <DiscoveryModal key={discoveryMix?.id ?? "none"} mix={discoveryMix} onDone={() => setDiscoveryMix(null)} />
    </div>
  );
}

function StationPanel({
  station,
  shopItems,
  playerItems,
  inventory,
}: {
  station: StationId;
  shopItems: MarketItem[];
  playerItems: MarketItem[];
  inventory: InventoryItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(ref.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
    },
    { dependencies: [station] }
  );

  const title = STATIONS.find((s) => s.id === station);

  return (
    <div ref={ref} className="pixel-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[9px] text-[var(--accent-warning)]">
          {"<"}{title?.label}{">"}
        </h3>
      </div>

      {station === "storage" && (
        <div>
          {inventory.length === 0 ? (
            <div className="pixel-panel pixel-panel--inset text-center py-6">
              <p className="text-[8px] text-[var(--text-muted)]">EMPTY... VISIT THE SHOP</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {inventory.map((item) => (
                <div key={item.material_id} className="pixel-panel pixel-panel--inset p-2 flex flex-col items-center gap-1">
                  <MaterialIcon name={item.material_name} id={item.material_id} />
                  <span className="text-[6px] text-[var(--text-secondary)]">{item.material_name}</span>
                  <span className="text-[8px] text-[var(--accent-primary)]">x{item.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {station === "shop" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {shopItems.map((item) => (
            <div key={item.material_id} className="pixel-panel pixel-panel--inset p-2 flex items-center gap-2">
              <MaterialIcon name={item.material_name} id={item.material_id} size={28} />
              <div className="min-w-0">
                <div className="text-[7px] text-[var(--text-secondary)] truncate">{item.material_name}</div>
                <div className="text-[8px] text-[var(--coin-gold)]">${item.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {station === "market" && (
        <div>
          {playerItems.length === 0 ? (
            <div className="pixel-panel pixel-panel--inset text-center py-6">
              <p className="text-[8px] text-[var(--text-muted)]">NO PLAYER LISTINGS...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {playerItems.map((item) => (
                <div key={item.material_id} className="pixel-panel pixel-panel--inset p-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MaterialIcon name={item.material_name} id={item.material_id} size={26} />
                    <div className="min-w-0">
                      <div className="text-[7px] text-[var(--text-secondary)] truncate">{item.material_name}</div>
                      <div className="text-[6px] text-[var(--text-muted)] truncate">SELLER: {item.username}</div>
                    </div>
                  </div>
                  <span className="text-[8px] text-[var(--coin-gold)] whitespace-nowrap">
                    ${item.price} x{item.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
