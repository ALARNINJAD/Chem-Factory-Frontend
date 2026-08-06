"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useIsClient } from "@/lib/use-is-client";
import { useToast } from "@/components/toast";
import type { MixerEntry } from "@/lib/types";

export default function MixerPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isClient = useIsClient();

  // my mixes
  const [mixes, setMixes] = useState<MixerEntry[]>([]);
  const [mixesLoading, setMixesLoading] = useState(true);

  // add to mixer
  const [addFirst, setAddFirst] = useState(0);
  const [addSecond, setAddSecond] = useState(0);
  const [addAmount, setAddAmount] = useState(0);

  // check time
  const [checkId, setCheckId] = useState(0);
  const [checkResult, setCheckResult] = useState<MixerEntry | null>(null);

  // pick mix
  const [pickId, setPickId] = useState(0);

  // pick new mix
  const [newId, setNewId] = useState(0);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newMixTime, setNewMixTime] = useState(0);

  const fetchMixes = useCallback(async (token: string) => api.mixer.mixes(token), []);

  const refreshMixes = useCallback(async () => {
    if (!token) return;
    try {
      setMixes(await fetchMixes(token));
    } catch (err) {
      toast(err instanceof Error ? err.message : "COULD NOT LOAD MIXES", "error");
    }
  }, [token, fetchMixes, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchMixes(token!);
        if (!cancelled) setMixes(data);
      } catch (err) {
        if (cancelled) return;
        setMixes([]);
        toast(err instanceof Error ? err.message : "COULD NOT LOAD MIXES", "error");
      } finally {
        if (!cancelled) setMixesLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, router, fetchMixes, toast]);

  if (!isClient) return null;

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.mixer.add(token, { first_ingredient_id: addFirst, second_ingredient_id: addSecond, amount: addAmount });
      toast("ADDED TO MIXER!", "success");
      refreshMixes();
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function checkMix(id: number) {
    if (!token) return;
    try {
      const res = await api.mixer.checkTime(token, { id });
      setCheckResult(res);
    } catch (err) {
      setCheckResult(null);
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handleCheckTime(e: FormEvent) {
    e.preventDefault();
    await checkMix(checkId);
  }

  async function pickMix(id: number) {
    if (!token) return;
    try {
      const res = await api.mixer.pick(token, { id });
      if (res.is_new) {
        setNewId(id);
        toast("NEW COMBO! NAME THE MATERIAL", "info");
      } else if (res.remaining_seconds > 0) {
        toast(`NOT READY YET — ${res.remaining_seconds}s LEFT`, "info");
      } else {
        toast("MIX PICKED!", "success");
      }
      refreshMixes();
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handlePick(e: FormEvent) {
    e.preventDefault();
    await pickMix(pickId);
  }

  async function handlePickNew(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.mixer.pickNew(token, { id: newId, name: newName, price: newPrice, mix_time: newMixTime });
      toast("NEW MIX CREATED!", "success");
      refreshMixes();
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  function startName(mix: MixerEntry) {
    setNewId(mix.id);
    setNewName(mix.material_name || `${mix.first_ingredient_name}+${mix.second_ingredient_name}`);
    setNewPrice(0);
    setNewMixTime(0);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-sm text-[var(--accent-secondary)]">
        {"<"}MIXER{">"}
      </h1>

      {/* Mixer visualization */}
      <div className="pixel-panel text-center py-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="sprite-slot">
            <span className="pixel-sprite pixel-sprite--beaker animate-float" />
          </div>
          <span className="text-[var(--accent-secondary)] text-lg">+</span>
          <div className="sprite-slot">
            <span className="pixel-sprite pixel-sprite--flask animate-float" style={{ animationDelay: "0.5s" }} />
          </div>
          <span className="text-[var(--accent-secondary)] text-lg">=</span>
          <div className="sprite-slot animate-pulse-glow">
            <span className="pixel-sprite pixel-sprite--crystal" />
          </div>
        </div>
        <div className="text-[8px] text-[var(--text-muted)]">
          COMBINE TWO INGREDIENTS TO CREATE NEW MATERIALS
        </div>
      </div>

      {/* My Mixes */}
      <div className="pixel-panel hover-glow-purple">
        <h2 className="text-[10px] text-[var(--accent-secondary)] mb-3">
          {"<"}MY MIXES{">"}
        </h2>
        {mixesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="pixel-skeleton pixel-skeleton--text" />
            ))}
          </div>
        ) : mixes.length === 0 ? (
          <div className="pixel-panel pixel-panel--inset text-center py-6">
            <p className="text-[8px] text-[var(--text-muted)]">
              NO ACTIVE MIXES... START ONE BELOW
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {mixes.map((mix) => (
              <div key={mix.id} className="pixel-panel pixel-panel--inset p-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[8px] text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)]">#{mix.id}</span>{" "}
                    {mix.first_ingredient_name} + {mix.second_ingredient_name}
                    {" = "}
                    {mix.is_new ? (
                      <span className="text-[var(--accent-warning)]">[NEW!]</span>
                    ) : (
                      mix.material_name || "[UNKNOWN]"
                    )}
                  </div>
                  <span className="text-[8px] text-[var(--text-muted)]">
                    QTY: {mix.amount} | {mix.remaining_seconds}s LEFT
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => checkMix(mix.id)}
                    className="pixel-btn text-[8px] hover-lift"
                  >
                    [CHECK]
                  </button>
                  {mix.is_new ? (
                    <button
                      onClick={() => startName(mix)}
                      className="pixel-btn pixel-btn--warning text-[8px] hover-lift"
                    >
                      [NAME MATERIAL]
                    </button>
                  ) : (
                    <button
                      onClick={() => pickMix(mix.id)}
                      className="pixel-btn pixel-btn--success text-[8px] hover-lift"
                    >
                      [PICK]
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Mixer */}
      <div className="pixel-panel hover-glow-purple">
        <h2 className="text-[10px] text-[var(--accent-secondary)] mb-3">
          {"<"}ADD TO MIXER{">"}
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">FIRST INGREDIENT ID</label>
            <input
              type="number"
              placeholder="ingredient 1..."
              value={addFirst}
              onChange={(e) => setAddFirst(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">SECOND INGREDIENT ID</label>
            <input
              type="number"
              placeholder="ingredient 2..."
              value={addSecond}
              onChange={(e) => setAddSecond(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">AMOUNT</label>
            <input
              type="number"
              placeholder="amount..."
              value={addAmount}
              onChange={(e) => setAddAmount(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <button type="submit" className="pixel-btn pixel-btn--primary w-full hover-lift">
            [ADD]
          </button>
        </form>
      </div>

      {/* Check Time */}
      <div className="pixel-panel hover-glow-teal">
        <h2 className="text-[10px] text-[var(--accent-info)] mb-3">
          {"<"}CHECK MIX TIME{">"}
        </h2>
        <form onSubmit={handleCheckTime} className="space-y-3">
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MIXER ENTRY ID</label>
            <input
              type="number"
              placeholder="entry id..."
              value={checkId}
              onChange={(e) => setCheckId(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <button type="submit" className="pixel-btn w-full hover-lift">
            [CHECK]
          </button>
        </form>
        {checkResult && (
          <div className="pixel-panel pixel-panel--inset text-[var(--accent-info)] text-[8px] p-2 mt-3 space-y-1">
            <div>{">"} {checkResult.first_ingredient_name} + {checkResult.second_ingredient_name} = {checkResult.material_name || "[NEW!]"}</div>
            <div>{">"} QTY: {checkResult.amount}</div>
            <div>{">"} REMAINING: {checkResult.remaining_seconds}s</div>
          </div>
        )}
      </div>

      {/* Pick Mix */}
      <div className="pixel-panel hover-glow-teal">
        <h2 className="text-[10px] text-[var(--accent-success)] mb-3">
          {"<"}PICK MIX{">"}
        </h2>
        <form onSubmit={handlePick} className="space-y-3">
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MIXER ENTRY ID</label>
            <input
              type="number"
              placeholder="entry id..."
              value={pickId}
              onChange={(e) => setPickId(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <button type="submit" className="pixel-btn pixel-btn--success w-full hover-lift">
            [PICK]
          </button>
        </form>
      </div>

      {/* Create New Mix */}
      <div className="pixel-panel hover-glow-amber">
        <h2 className="text-[10px] text-[var(--accent-warning)] mb-3">
          {"<"}CREATE NEW MIX{">"}
        </h2>
        <form onSubmit={handlePickNew} className="space-y-3">
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MIXER ENTRY ID</label>
            <input
              type="number"
              placeholder="entry id..."
              value={newId}
              onChange={(e) => setNewId(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">NAME</label>
            <input
              type="text"
              placeholder="material name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="pixel-input"
            />
          </div>
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">PRICE</label>
            <input
              type="number"
              placeholder="price..."
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">MIX TIME (SECONDS)</label>
            <input
              type="number"
              placeholder="mix time..."
              value={newMixTime}
              onChange={(e) => setNewMixTime(Number(e.target.value))}
              className="pixel-input"
            />
          </div>
          <button type="submit" className="pixel-btn pixel-btn--warning w-full hover-lift">
            [CREATE]
          </button>
        </form>
      </div>
    </div>
  );
}
