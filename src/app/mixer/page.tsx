"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";

export default function MixerPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // add to mixer
  const [addFirst, setAddFirst] = useState(0);
  const [addSecond, setAddSecond] = useState(0);
  const [addAmount, setAddAmount] = useState(0);

  // check time
  const [checkId, setCheckId] = useState(0);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  // pick mix
  const [pickId, setPickId] = useState(0);

  // pick new mix
  const [newId, setNewId] = useState(0);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newMixTime, setNewMixTime] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.mixer.add(token, { first_ingredient_id: addFirst, second_ingredient_id: addSecond, amount: addAmount });
      toast("ADDED TO MIXER!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handleCheckTime(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await api.mixer.checkTime(token, { id: checkId });
      setCheckResult(JSON.stringify(res));
    } catch (err) {
      setCheckResult(null);
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handlePick(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.mixer.pick(token, { id: pickId });
      toast("MIX PICKED!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
  }

  async function handlePickNew(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await api.mixer.pickNew(token, { id: newId, name: newName, price: newPrice, mix_time: newMixTime });
      toast("NEW MIX CREATED!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "FAILED", "error");
    }
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
          <div className="pixel-panel pixel-panel--inset text-[var(--accent-info)] text-[8px] p-2 mt-3">
            {">"} {checkResult}
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
