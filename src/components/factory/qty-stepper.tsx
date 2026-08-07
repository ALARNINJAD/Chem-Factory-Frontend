"use client";

interface QtyStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  size?: "sm" | "md";
}

export function QtyStepper({ value, onChange, min = 1, max, size = "md" }: QtyStepperProps) {
  const btnCls = `pixel-btn pixel-btn--mini hover-lift ${size === "md" ? "text-[9px]" : "text-[8px]"}`;
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className={btnCls}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="decrease"
      >
        {"-"}
      </button>
      <span className="text-[8px] w-5 text-center text-[var(--text-secondary)]">{value}</span>
      <button
        type="button"
        className={btnCls}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="increase"
      >
        {"+"}
      </button>
    </div>
  );
}
