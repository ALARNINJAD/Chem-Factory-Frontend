"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";
import type { MarketItem } from "@/lib/types";

const SPRITES = ["flask", "bottle", "beaker", "gear", "crystal"] as const;

function getSprite(materialId: number) {
  return SPRITES[materialId % SPRITES.length];
}

export default function MarketPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "sell">("browse");

  // sell form
  const [sellMaterialId, setSellMaterialId] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);

  // buy form
  const [buySellerId, setBuySellerId] = useState(0);
  const [buyMaterialId, setBuyMaterialId] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);

  async function loadMarket() {
    try {
      const data = await api.market.list();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
    loadMarket();
  }, [isAuthenticated, token, router]);

  async function handleSell(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.market.sell(token, { material_id: sellMaterialId, number: sellAmount, price: sellPrice });
      toast("LISTED FOR SALE!", "success");
      loadMarket();
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handleBuy(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.market.buy(token, {
        seller_id: buySellerId,
        material_id: buyMaterialId,
        number: buyAmount,
        price: buyPrice,
      });
      toast("PURCHASE COMPLETE!", "success");
      loadMarket();
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
          [SELL]
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
                      <div className="sprite-slot">
                        <span className={`pixel-sprite pixel-sprite--${getSprite(item.material_id)}`} />
                      </div>
                      <div>
                        <div className="text-[8px] text-[var(--text-secondary)]">
                          MATERIAL #{item.material_id}
                        </div>
                        <div className="text-[8px] text-[var(--text-muted)]">
                          SELLER: #{item.user_id}
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
                        setBuySellerId(item.user_id);
                        setBuyMaterialId(item.material_id);
                        setBuyAmount(item.amount);
                        setBuyPrice(item.price);
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
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MATERIAL ID</label>
                <input
                  type="number"
                  placeholder="material id..."
                  value={sellMaterialId}
                  onChange={(e) => setSellMaterialId(Number(e.target.value))}
                  className="pixel-input"
                />
              </div>
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">AMOUNT</label>
                <input
                  type="number"
                  placeholder="amount..."
                  value={sellAmount}
                  onChange={(e) => setSellAmount(Number(e.target.value))}
                  className="pixel-input"
                />
              </div>
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">PRICE</label>
                <input
                  type="number"
                  placeholder="price..."
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="pixel-input"
                />
              </div>
              <button type="submit" className="pixel-btn pixel-btn--warning w-full hover-lift">
                [LIST FOR SALE]
              </button>
            </form>
          </div>

          {/* Buy Form */}
          <div className="pixel-panel">
            <h2 className="text-[10px] text-[var(--accent-success)] mb-3">
              {"<"}BUY MATERIAL{">"}
            </h2>
            <form onSubmit={handleBuy} className="space-y-3">
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">SELLER ID</label>
                <input
                  type="number"
                  placeholder="seller id..."
                  value={buySellerId}
                  onChange={(e) => setBuySellerId(Number(e.target.value))}
                  className="pixel-input"
                />
              </div>
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MATERIAL ID</label>
                <input
                  type="number"
                  placeholder="material id..."
                  value={buyMaterialId}
                  onChange={(e) => setBuyMaterialId(Number(e.target.value))}
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
              <div>
                <label className="text-[8px] text-[var(--text-muted)] mb-1 block">PRICE</label>
                <input
                  type="number"
                  placeholder="price..."
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
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
