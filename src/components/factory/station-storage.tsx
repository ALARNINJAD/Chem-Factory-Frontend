"use client";

import { MaterialIcon } from "@/components/material-icon";
import type { InventoryItem } from "@/lib/types";

export function StorageStation({
  inventory,
  onMix,
}: {
  inventory: InventoryItem[];
  onMix?: (materialId: number) => void;
}) {
  if (inventory.length === 0) {
    return (
      <div className="pixel-panel pixel-panel--inset text-center py-6">
        <p className="text-[8px] text-[var(--text-muted)]">EMPTY... VISIT THE SHOP</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {inventory.map((item) => (
        <div
          key={item.material_id}
          className="pixel-panel pixel-panel--inset p-2 flex flex-col items-center gap-1 hover:border-[var(--accent-primary)] transition-colors hover-lift"
        >
          <MaterialIcon name={item.material_name} id={item.material_id} />
          <span className="text-[6px] text-[var(--text-secondary)] text-center">{item.material_name}</span>
          <span className="text-[8px] text-[var(--accent-primary)]">x{item.amount}</span>
          {onMix && (
            <button
              onClick={() => onMix(item.material_id)}
              className="pixel-btn pixel-btn--mini text-[6px] hover-lift"
            >
              [MIX]
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
