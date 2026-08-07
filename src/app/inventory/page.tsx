"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useIsClient } from "@/lib/use-is-client";
import { useToast } from "@/components/toast";
import { MaterialIcon } from "@/components/material-icon";
import type { InventoryItem } from "@/lib/types";

export default function InventoryPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isClient = useIsClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async (token: string) => api.inventory.export(token), []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchInventory(token!);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (cancelled) return;
        toast(err instanceof Error ? err.message : "COULD NOT LOAD INVENTORY", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, router, fetchInventory, toast]);

  if (!isClient) return null;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto page-enter">
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-[var(--accent-primary)]">
          {"<"}INVENTORY{">"}
        </h1>
        {!loading && (
          <span className="text-[8px] text-[var(--text-muted)]">
            {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
          </span>
        )}
      </div>

      <div className="pixel-panel">
        <h2 className="text-[10px] text-[var(--text-secondary)] mb-3">
          {"<"}YOUR STOCK{">"}
        </h2>
        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pixel-panel pixel-panel--inset p-2 flex flex-col items-center gap-2">
                <div className="pixel-skeleton pixel-skeleton--box" />
                <div className="pixel-skeleton pixel-skeleton--text" style={{ width: 20 }} />
                <div className="pixel-skeleton pixel-skeleton--text" style={{ width: 16 }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="pixel-panel pixel-panel--inset text-center py-6">
            <p className="text-[8px] text-[var(--text-muted)]">
              EMPTY... VISIT THE SHOP ON THE FLOOR
            </p>
            <Link href="/dashboard" className="pixel-btn pixel-btn--warning text-[8px] mt-3 hover-lift inline-block">
              {"[ GO TO THE FLOOR ]"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="pixel-panel pixel-panel--inset p-2 flex flex-col items-center gap-1 hover:border-[var(--accent-primary)] transition-colors hover-lift"
              >
                <MaterialIcon name={item.material_name} id={item.material_id} />
                <span className="text-[7px] text-[var(--text-secondary)] text-center">
                  {item.material_name}
                </span>
                <span className="text-[8px] text-[var(--accent-primary)]">
                  x{item.amount}
                </span>
                <Link
                  href="/dashboard"
                  className="text-[7px] text-[var(--accent-warning)] hover:text-[var(--text-primary)] transition-colors"
                >
                  [TRADE]
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
