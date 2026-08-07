"use client";

interface QtyStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  size?: "sm" | "md";
}

export function QtyStepper({ value, onChange, min = 1, max, size = "md" }: QtyStepperProps) {
  const btnCls = size === "sm" ? "pixel-btn text-[8px] px-2 py-1 hover-lift" : "pixel-btn text-[9px] px-2 py-1 hover-lift";
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={btnCls}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        {"[-]"}
      </button>
      <span className="text-[9px] w-7 text-center text-[var(--text-secondary)]">{value}</span>
      <button
        type="button"
        className={btnCls}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        {"[+]"}
      </button>
    </div>
  );
}
