// Client-side sprite system for materials.
//
// The backend has no icon field, so icons are resolved here:
//   1. a per-material override saved in localStorage (set by the mixer picker)
//   2. a curated icon for the seeded base materials (matched by name)
//   3. a deterministic fallback chosen by material id hash
//
// All sprite files live in /public/items (Terraria 1.2.1.2 item textures).

export type IconFile = string;

// The "?" crystal used for unnamed/discovery results — the single place that
// knows the filename instead of three hardcoded /items/Item_487.png spots.
export const UNKNOWN_ICON: IconFile = "Item_487.png";

export const CURATED_ICONS: IconFile[] = [
  "Item_109.png",
  "Item_11.png",
  "Item_110.png",
  "Item_12.png",
  "Item_126.png",
  "Item_13.png",
  "Item_14.png",
  "Item_149.png",
  "Item_169.png",
  "Item_172.png",
  "Item_173.png",
  "Item_174.png",
  "Item_175.png",
  "Item_177.png",
  "Item_178.png",
  "Item_179.png",
  "Item_180.png",
  "Item_181.png",
  "Item_182.png",
  "Item_183.png",
  "Item_184.png",
  "Item_188.png",
  "Item_189.png",
  "Item_2.png",
  "Item_226.png",
  "Item_227.png",
  "Item_23.png",
  "Item_28.png",
  "Item_283.png",
  "Item_288.png",
  "Item_289.png",
  "Item_29.png",
  "Item_290.png",
  "Item_291.png",
  "Item_292.png",
  "Item_293.png",
  "Item_294.png",
  "Item_295.png",
  "Item_296.png",
  "Item_297.png",
  "Item_298.png",
  "Item_299.png",
  "Item_300.png",
  "Item_301.png",
  "Item_302.png",
  "Item_303.png",
  "Item_304.png",
  "Item_305.png",
  "Item_307.png",
  "Item_31.png",
  "Item_313.png",
  "Item_320.png",
  "Item_331.png",
  "Item_364.png",
  "Item_365.png",
  "Item_366.png",
  "Item_487.png",
  "Item_499.png",
  "Item_5.png",
  "Item_500.png",
  "Item_501.png",
  "Item_502.png",
  "Item_520.png",
  "Item_521.png",
  "Item_522.png",
  "Item_53.png",
  "Item_547.png",
  "Item_548.png",
  "Item_549.png",
  "Item_56.png",
  "Item_60.png",
  "Item_62.png",
  "Item_66.png",
  "Item_67.png",
  "Item_75.png",
  "Item_8.png",
];

const STORAGE_PREFIX = "material-icon:";

const KNOWN_ICONS: Record<string, IconFile> = {
  water: "Item_126.png",
  dirt: "Item_2.png",
  weed_seed: "Item_283.png",
  warm_air: "Item_53.png",
  paper: "Item_149.png",
  planted_weed: "Item_313.png",
  weed: "Item_5.png",
  dried_weed: "Item_331.png",
  weed_cigarette: "Item_172.png",
};

function canStore(): boolean {
  return typeof window !== "undefined";
}

export function getIconOverride(name: string): IconFile | null {
  if (!canStore()) return null;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + name.trim().toLowerCase());
  } catch {
    return null;
  }
}

export function setIconOverride(name: string, file: IconFile): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + name.trim().toLowerCase(), file);
    notifyIconsChanged();
  } catch {
    // ignore (private mode etc.)
  }
}

export function clearIconOverride(name: string): void {
  if (!canStore()) return;
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + name.trim().toLowerCase());
    notifyIconsChanged();
  } catch {
    // ignore
  }
}

export function notifyIconsChanged(): void {
  if (!canStore()) return;
  try {
    window.dispatchEvent(new CustomEvent("material-icons-changed"));
  } catch {
    // ignore
  }
}

export function iconFileFor(name?: string, id?: number): IconFile | null {
  if (name) {
    const key = name.trim().toLowerCase();
    const override = getIconOverride(key);
    if (override) return override;
    if (KNOWN_ICONS[key]) return KNOWN_ICONS[key];
  }
  if (typeof id === "number" && id > 0) {
    return CURATED_ICONS[id % CURATED_ICONS.length];
  }
  return null;
}

export function iconUrl(name?: string, id?: number): string | null {
  const file = iconFileFor(name, id);
  return file ? `/items/${file}` : null;
}

const CSS_SPRITES = ["flask", "bottle", "beaker", "gear", "crystal"] as const;

export function fallbackSprite(id?: number): string {
  return CSS_SPRITES[(id ?? 0) % CSS_SPRITES.length];
}
