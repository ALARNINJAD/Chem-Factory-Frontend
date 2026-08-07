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
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      if (cancelled) return;
      setUrl(iconUrl(name, id));
    };
    // defer to avoid a synchronous setState during the effect
    const timer = setTimeout(update, 0);
    window.addEventListener("material-icons-changed", update);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("material-icons-changed", update);
    };
  }, [name, id]);

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
