"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useIsClient } from "@/lib/use-is-client";
import { useToast } from "@/components/toast";
import type { MaterialCatalogItem } from "@/lib/types";

const SPRITES = ["flask", "bottle", "beaker", "gear", "crystal"] as const;

function getSprite(materialId: number) {
  return SPRITES[materialId % SPRITES.length];
}

type Filter = "all" | "raw" | "crafted";

export default function MaterialsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isClient = useIsClient();
  const [items, setItems] = useState<MaterialCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchMaterials = useCallback(async (token: string) => api.materials.list(token), []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchMaterials(token!);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (cancelled) return;
        toast(err instanceof Error ? err.message : "COULD NOT LOAD MATERIALS", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, router, fetchMaterials, toast]);

  if (!isClient) return null;

  const filtered = items.filter((m) => {
    if (filter === "raw") return !m.first_ingredient_id;
    if (filter === "crafted") return !!m.first_ingredient_id;
    return true;
  });

  const rawCount = items.filter((m) => !m.first_ingredient_id).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-[var(--accent-secondary)]">
          {"<"}MATERIALS{">"}
        </h1>
        {!loading && (
          <span className="text-[8px] text-[var(--text-muted)]">
            {items.length} KNOWNS
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="pixel-tabs">
        <button
          onClick={() => setFilter("all")}
          className={`pixel-tab ${filter === "all" ? "pixel-tab--active" : ""}`}
        >
          [ALL]
        </button>
        <button
          onClick={() => setFilter("raw")}
          className={`pixel-tab ${filter === "raw" ? "pixel-tab--active" : ""}`}
        >
          [RAW]
        </button>
        <button
          onClick={() => setFilter("crafted")}
          className={`pixel-tab ${filter === "crafted" ? "pixel-tab--active" : ""}`}
        >
          [CRAFTED]
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pixel-panel flex items-start gap-3">
              <div className="pixel-skeleton pixel-skeleton--box" />
              <div className="flex-1 space-y-2">
                <div className="pixel-skeleton pixel-skeleton--text" style={{ width: "50%" }} />
                <div className="pixel-skeleton pixel-skeleton--text" style={{ width: "30%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="pixel-panel pixel-panel--inset text-center py-8">
          <p className="text-[8px] text-[var(--text-muted)]">
            NO MATERIALS FOUND...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="pixel-panel hover-lift hover-glow-purple">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="sprite-slot">
                    <span className={`pixel-sprite pixel-sprite--${getSprite(item.id)}`} />
                  </div>
                  <div>
                    <div className="text-[8px] text-[var(--text-secondary)]">
                      #{item.id} {item.name}
                    </div>
                    <div className="text-[8px] text-[var(--text-muted)]">
                      {item.first_ingredient_id ? "CRAFTED" : "RAW MATERIAL"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--coin-gold)] text-[10px]">
                    ${item.price}
                  </div>
                  {item.mix_time ? (
                    <div className="text-[7px] text-[var(--text-muted)]">
                      {item.mix_time}s
                    </div>
                  ) : null}
                </div>
              </div>
              {item.first_ingredient_id ? (
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-[var(--accent-primary)]">
                    {item.first_ingredient_name} + {item.second_ingredient_name}
                  </span>
                  <Link
                    href={`/mixer?first=${item.first_ingredient_id}&second=${item.second_ingredient_id}`}
                    className="pixel-btn pixel-btn--primary text-[8px] hover-lift"
                  >
                    [MIX]
                  </Link>
                </div>
              ) : (
                <div className="text-[8px] text-[var(--text-muted)]">
                  FOUND IN NATURE... BUY AT MARKET
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[7px] text-[var(--text-muted)]">
        {rawCount} RAW + {items.length - rawCount} CRAFTED = {items.length} TOTAL
      </p>
    </div>
  );
}
