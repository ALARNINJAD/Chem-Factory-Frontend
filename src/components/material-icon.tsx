"use client";

import { useEffect, useState } from "react";
import { iconUrl, fallbackSprite } from "@/lib/icons";

interface MaterialIconProps {
  name?: string;
  id?: number;
  size?: number;
  className?: string;
}

export function MaterialIcon({ name, id, size = 36, className }: MaterialIconProps) {
  // iconUrl is a cheap localStorage lookup — derive during render so the
  // fallback sprite never flashes; the tick only re-renders when an icon
  // override is changed elsewhere (icon picker in the discovery modal)
  const [, setTick] = useState(0);
  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    window.addEventListener("material-icons-changed", update);
    return () => window.removeEventListener("material-icons-changed", update);
  }, []);

  const url = iconUrl(name, id);
  const slotStyle = { width: size, height: size };

  if (url) {
    return (
      <div className={`sprite-slot ${className ?? ""}`} style={slotStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name ?? "material"} className="pixel-sprite-img" />
      </div>
    );
  }

  return (
    <div className={`sprite-slot ${className ?? ""}`} style={slotStyle}>
      <span className={`pixel-sprite pixel-sprite--${fallbackSprite(id)}`} />
    </div>
  );
}
