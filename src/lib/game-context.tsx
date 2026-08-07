"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { User, InventoryItem, MarketItem, MixerEntry, PickResult } from "@/lib/types";

interface GameStore {
  user: User | null;
  inventory: InventoryItem[];
  market: MarketItem[];
  mixes: MixerEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
  buy: (marketId: number, amount: number) => Promise<void>;
  sell: (materialId: number, amount: number) => Promise<void>;
  addMix: (first: number, second: number, amount: number) => Promise<void>;
  pick: (id: number) => Promise<PickResult>;
  pickNew: (id: number, data: { name: string; price: number; mix_time: number }) => Promise<void>;
  liveRemaining: (mix: MixerEntry) => number;
}

const GameContext = createContext<GameStore | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [market, setMarket] = useState<MarketItem[]>([]);
  const [mixes, setMixes] = useState<MixerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedAtRef = useRef(0);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    const [profile, inv, mk, mx] = await Promise.all([
      api.user.profile(token),
      api.inventory.export(token),
      api.market.export(token),
      api.mixer.mixes(token).catch(() => []),
    ]);
    setUser(profile);
    setInventory(inv);
    setMarket(mk);
    setMixes(mx);
    loadedAtRef.current = Date.now();
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let cancelled = false;
    async function load() {
      try {
        await refresh();
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
  }, [isAuthenticated, token, refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      if (mixes.length > 0) setTick((t) => t + 1);
    }, 500);
    return () => clearInterval(id);
  }, [mixes.length]);

  const liveRemaining = useCallback(
    (mix: MixerEntry) => {
      const elapsed = Math.floor((Date.now() - loadedAtRef.current) / 1000);
      return Math.max(0, mix.remaining_seconds - elapsed);
    },
    []
  );

  const buy = useCallback(
    async (marketId: number, amount: number) => {
      if (!token) return;
      await api.market.buy(token, { market_id: marketId, amount });
      await refresh();
    },
    [token, refresh]
  );

  const sell = useCallback(
    async (materialId: number, amount: number) => {
      if (!token) return;
      await api.market.sell(token, { material_id: materialId, amount });
      await refresh();
    },
    [token, refresh]
  );

  const addMix = useCallback(
    async (first: number, second: number, amount: number) => {
      if (!token) return;
      await api.mixer.add(token, {
        first_ingredient_id: first,
        second_ingredient_id: second,
        amount,
      });
      await refresh();
    },
    [token, refresh]
  );

  const pick = useCallback(
    async (id: number) => {
      if (!token) return Promise.resolve<PickResult>({ is_picked: false, is_new: false, remaining_seconds: 0 });
      const res = await api.mixer.pick(token, { id });
      await refresh();
      return res;
    },
    [token, refresh]
  );

  const pickNew = useCallback(
    async (id: number, data: { name: string; price: number; mix_time: number }) => {
      if (!token) return;
      await api.mixer.pickNew(token, { id, ...data });
      await refresh();
    },
    [token, refresh]
  );

  return (
    <GameContext.Provider
      value={{ user, inventory, market, mixes, loading, refresh, buy, sell, addMix, pick, pickNew, liveRemaining }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
