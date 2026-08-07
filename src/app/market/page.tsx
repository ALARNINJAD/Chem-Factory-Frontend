"use client";

import { useEffect, useState, useCallback, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";
import { MaterialIcon } from "@/components/material-icon";
import type { MarketItem, InventoryItem } from "@/lib/types";

function MarketPageContent({
  initialTab,
  initialMaterialId,
}: {
  initialTab: "browse" | "sell";
  initialMaterialId: number;
}) {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [inv, setInv] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "sell">(initialTab);

  // sell form
  const [sellMaterialId, setSellMaterialId] = useState(initialMaterialId);
  const [sellAmount, setSellAmount] = useState(0);

  // buy form
  const [buyMarketId, setBuyMarketId] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);

  const ownedAmount =
    inv.find((i) => i.material_id === sellMaterialId)?.amount ?? 0;

  const fetchMarket = useCallback(async (token: string) => api.market.export(token), []);
  const fetchInventory = useCallback(async (token: string) => api.inventory.export(token), []);

  const refreshMarket = useCallback(async () => {
    if (!token) return;
    try {
      setItems(await fetchMarket(token));
    } catch {
      // ignore
    }
  }, [token, fetchMarket]);

  const refreshInventory = useCallback(async () => {
    if (!token) return;
    try {
      setInv(await fetchInventory(token));
    } catch {
      // ignore
    }
  }, [token, fetchInventory]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const [market, inventory] = await Promise.all([
          fetchMarket(token!),
          fetchInventory(token!),
        ]);
        if (!cancelled) {
          setItems(market);
          setInv(inventory);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, router, fetchMarket, fetchInventory]);

  async function handleSell(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (sellMaterialId === 0 || sellAmount <= 0) {
      toast("SELECT A MATERIAL AND AMOUNT", "error");
      return;
    }
    if (sellAmount > ownedAmount) {
      toast("NOT ENOUGH INVENTORY", "error");
      return;
    }
    try {
      await api.market.sell(token, { material_id: sellMaterialId, amount: sellAmount });
      toast("LISTED FOR SALE!", "success");
      refreshMarket();
      refreshInventory();
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handleBuy(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.market.buy(token, { market_id: buyMarketId, amount: buyAmount });
      toast("PURCHASE COMPLETE!", "success");
      refreshMarket();
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-sm text-[var(--accent-warning)]">
        {"<"}MARKET{">"}
      </h1>

      {/* Tabs */}
      <div className="pixel-tabs">
        <button
          onClick={() => setTab("browse")}
          className={`pixel-tab ${tab === "browse" ? "pixel-tab--active" : ""}`}
        >
          [BROWSE]
        </button>
        <button
          onClick={() => setTab("sell")}
          className={`pixel-tab ${tab === "sell" ? "pixel-tab--active" : ""}`}
        >
          [TRADE]
        </button>
      </div>

      {/* Browse Tab */}
      {tab === "browse" && (
        <div>
          {loading ? (
            <div className="space-y-3">
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
          ) : items.length === 0 ? (
            <div className="pixel-panel pixel-panel--inset text-center py-8">
              <p className="text-[8px] text-[var(--text-muted)]">
                NO ITEMS LISTED...
              </p>
              <p className="text-[8px] text-[var(--text-muted)] mt-2">
                CHECK BACK LATER
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div key={item.id} className="pixel-panel hover-lift hover-glow-amber">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={item.material_name} id={item.material_id} />
                      <div>
                        <div className="text-[8px] text-[var(--text-secondary)]">
                          {item.material_name}
                        </div>
                        <div className="text-[8px] text-[var(--text-muted)]">
                          SELLER: {item.username}
                        </div>
                      </div>
                    </div>
                    <span className="text-[var(--coin-gold)] text-[10px]">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-[var(--text-muted)]">
                      QTY: {item.amount}
                    </span>
                    <button
                      onClick={() => {
                        setBuyMarketId(item.id);
                        setBuyAmount(item.amount);
                        setTab("sell");
                      }}
                      className="pixel-btn pixel-btn--success text-[8px] hover-lift"
                    >
                      [BUY]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {tab === "sell" && (
        <div className="space-y-6">
          {/* Sell Form */}
          <div className="pixel-panel">
            <h2 className="text-[10px] text-[var(--accent-warning)] mb-3">
              {"<"}LIST MATERIAL{">"}
            </h2>
            <form onSubmit={handleSell} className="space-y-3">
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">SELECT FROM INVENTORY</label>
                {inv.length === 0 ? (
                  <p className="pixel-input text-[8px] flex items-center text-[var(--text-muted)]">
                    YOUR INVENTORY IS EMPTY...
                  </p>
                ) : (
                  <select
                    className="pixel-input w-full"
                    value={sellMaterialId}
                    onChange={(e) => {
                      setSellMaterialId(Number(e.target.value));
                      setSellAmount(0);
                    }}
                  >
                    <option value={0}>-- select material --</option>
                    {inv.map((item) => (
                      <option key={item.id} value={item.material_id}>
                        {item.material_name} (x{item.amount})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">AMOUNT</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={ownedAmount || undefined}
                    placeholder="amount..."
                    value={sellAmount}
                    onChange={(e) => setSellAmount(Number(e.target.value))}
                    className="pixel-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setSellAmount(ownedAmount)}
                    className="pixel-btn text-[8px] hover-lift"
                  >
                    [MAX]
                  </button>
                </div>
                {ownedAmount > 0 && (
                  <p className="text-[7px] text-[var(--text-muted)] mt-1">
                    YOU OWN: {ownedAmount}
                  </p>
                )}
              </div>
              <button type="submit" className="pixel-btn pixel-btn--warning w-full hover-lift">
                [LIST FOR SALE]
              </button>
              <p className="text-[7px] text-[var(--text-muted)] text-center">
                PRICE IS DETERMINED BY THE MATERIAL
              </p>
            </form>
          </div>

          {/* Buy Form */}
          <div className="pixel-panel">
            <h2 className="text-[10px] text-[var(--accent-success)] mb-3">
              {"<"}BUY MATERIAL{">"}
            </h2>
            <form onSubmit={handleBuy} className="space-y-3">
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MARKET LISTING ID</label>
                <input
                  type="number"
                  placeholder="market id..."
                  value={buyMarketId}
                  onChange={(e) => setBuyMarketId(Number(e.target.value))}
                  className="pixel-input"
                />
              </div>
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">AMOUNT</label>
                <input
                  type="number"
                  placeholder="amount..."
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(Number(e.target.value))}
                  className="pixel-input"
                />
              </div>
              <button type="submit" className="pixel-btn pixel-btn--success w-full hover-lift">
                [BUY]
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketPageInner() {
  const searchParams = useSearchParams();
  const sell = searchParams.get("sell") === "1";
  const materialId = Number(searchParams.get("material_id")) || 0;
  return (
    <MarketPageContent
      key={searchParams.toString()}
      initialTab={sell ? "sell" : "browse"}
      initialMaterialId={materialId}
    />
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={null}>
      <MarketPageInner />
    </Suspense>
  );
}
