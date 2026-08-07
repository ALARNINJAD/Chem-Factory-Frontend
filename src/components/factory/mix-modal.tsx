"use client";

import { useState } from "react";
import { useGame } from "@/lib/game-context";
import { useToast } from "@/components/toast";
import { MaterialIcon } from "@/components/material-icon";
import { GameModal } from "@/components/factory/game-modal";
import { QtyStepper } from "@/components/factory/qty-stepper";
import type { InventoryItem } from "@/lib/types";

interface MixModalProps {
  open: boolean;
  onClose: () => void;
}

export function MixModal({ open, onClose }: MixModalProps) {
  const { inventory, mixes, addMix } = useGame();
  const { toast } = useToast();
  const [picking, setPicking] = useState<1 | 2>(1);
  const [first, setFirst] = useState<InventoryItem | null>(null);
  const [second, setSecond] = useState<InventoryItem | null>(null);
  const [amount, setAmount] = useState(1);
  const [saving, setSaving] = useState(false);

  function close() {
    setPicking(1);
    setFirst(null);
    setSecond(null);
    setAmount(1);
    onClose();
  }

  const materials = Array.from(new Map(inventory.map((m) => [m.material_id, m])).values()).filter(
    (m) => m.amount > 0
  );

  const maxAmount = Math.min(10, first?.amount ?? 10, second?.amount ?? 10);

  function isActiveMixing(a: number, b: number) {
    return mixes.some(
      (m) =>
        (m.first_ingredient_id === a && m.second_ingredient_id === b) ||
        (m.first_ingredient_id === b && m.second_ingredient_id === a)
    );
  }

  function assign(m: InventoryItem) {
    if (picking === 1) {
      if (second?.material_id === m.material_id) {
        toast("PICK A DIFFERENT INGREDIENT", "error");
        return;
      }
      setFirst(m);
      setAmount(1);
      setPicking(2);
    } else {
      if (first?.material_id === m.material_id) {
        toast("PICK A DIFFERENT INGREDIENT", "error");
        return;
      }
      setSecond(m);
    }
  }

  async function handleStart() {
    if (!first || !second) return;
    if (isActiveMixing(first.material_id, second.material_id)) {
      toast("ALREADY MIXING THESE INGREDIENTS", "error");
      return;
    }
    setSaving(true);
    try {
      await addMix(first.material_id, second.material_id, amount);
      toast("MIX STARTED!", "success");
      close();
    } catch (err) {
      toast(err instanceof Error ? err.message : "COULD NOT START MIX", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GameModal open={open} title="START A MIX" tone="purple" onClose={close}>
      <div className="space-y-3">
        {/* Slots */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPicking(1)}
            className={`pixel-panel pixel-panel--inset flex flex-col items-center p-2 hover-lift ${
              picking === 1 && !first ? "station-tile--active" : ""
            }`}
          >
            <span className="text-[6px] text-[var(--text-muted)] mb-1">1ST</span>
            {first ? (
              <MaterialIcon name={first.material_name} id={first.material_id} size={30} />
            ) : (
              <span className="sprite-slot text-[var(--text-muted)] text-lg">?</span>
            )}
          </button>
          <span className="text-[var(--accent-secondary)] text-sm">+</span>
          <button
            type="button"
            onClick={() => setPicking(2)}
            className={`pixel-panel pixel-panel--inset flex flex-col items-center p-2 hover-lift ${
              picking === 2 && !second ? "station-tile--active" : ""
            }`}
          >
            <span className="text-[6px] text-[var(--text-muted)] mb-1">2ND</span>
            {second ? (
              <MaterialIcon name={second.material_name} id={second.material_id} size={30} />
            ) : (
              <span className="sprite-slot text-[var(--text-muted)] text-lg">?</span>
            )}
          </button>
          <span className="text-[var(--accent-secondary)] text-sm">=</span>
          <div className="pixel-panel pixel-panel--inset flex flex-col items-center p-2">
            <span className="text-[6px] text-[var(--text-muted)] mb-1">OUT</span>
            <span className="sprite-slot">
              <span className="pixel-sprite pixel-sprite--crystal animate-pulse-glow" />
            </span>
          </div>
        </div>

        <div className="text-[7px] text-[var(--text-muted)] text-center">
          {picking === 1 ? "CLICK A MATERIAL FOR THE FIRST SLOT" : "CLICK A MATERIAL FOR THE SECOND SLOT"}
        </div>

        {/* Picker */}
        {materials.length === 0 ? (
          <div className="pixel-panel pixel-panel--inset text-center py-6">
            <p className="text-[8px] text-[var(--text-muted)]">
              INVENTORY EMPTY... BUY MATERIALS AT THE SHOP
            </p>
          </div>
        ) : (
          <div className="pixel-panel pixel-panel--inset p-2 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto">
            {materials.map((m) => {
              const selected = first?.material_id === m.material_id || second?.material_id === m.material_id;
              return (
                <button
                  key={m.material_id}
                  type="button"
                  onClick={() => assign(m)}
                  className={`pixel-sprite-pick flex flex-col items-center justify-center gap-1 p-1 h-auto ${
                    selected ? "pixel-sprite-pick--active" : ""
                  }`}
                >
                  <MaterialIcon name={m.material_name} id={m.material_id} size={26} />
                  <span className="text-[5px] text-[var(--text-secondary)] truncate w-full text-center">
                    {m.material_name}
                  </span>
                  <span className="text-[6px] text-[var(--accent-primary)]">x{m.amount}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Amount + start */}
        {first && second && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[7px] text-[var(--text-muted)]">QTY</span>
              <QtyStepper value={amount} onChange={setAmount} max={maxAmount} size="sm" />
            </div>
            <button
              onClick={handleStart}
              disabled={saving}
              className="pixel-btn pixel-btn--primary hover-lift"
            >
              {saving ? "[STARTING...]" : "[START MIX]"}
            </button>
          </div>
        )}
      </div>
    </GameModal>
  );
}
