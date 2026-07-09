import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-10 page-enter">
      {/* Pixel art logo */}
      <div className="relative">
        <h1 className="text-2xl tracking-wider text-[var(--accent-primary)] animate-pulse-glow">
          CHEM FACTORY
        </h1>
        <div className="mt-3 text-[8px] text-[var(--text-muted)] tracking-widest">
          {"::: INDUSTRIAL CHEMISTRY SIMULATOR :::"}
        </div>
      </div>

      {/* Pixel art factory with animated smoke */}
      <div className="pixel-panel p-6">
        <div className="relative inline-block">
          {/* Smoke puffs */}
          <div className="absolute -top-6 left-[18px] flex gap-1">
            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] opacity-30 animate-float" style={{ animationDelay: "0s" }} />
            <span className="w-1 h-1 bg-[var(--text-muted)] opacity-20 animate-float" style={{ animationDelay: "0.5s" }} />
            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] opacity-25 animate-float" style={{ animationDelay: "1s" }} />
          </div>
          <pre className="font-mono text-[8px] leading-tight text-[var(--text-secondary)]">
{`    ___
   |   |~~
   |   |~~
   |___|
  /|   |\\
 / |   | \\
/  |___|  \\
   |   |
===|   |===
   |___|`}
          </pre>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-[8px]">
          <span className="text-[var(--accent-success)]">[ BUY ]</span>
          <span className="text-[var(--accent-secondary)]">[ MIX ]</span>
          <span className="text-[var(--accent-warning)]">[ SELL ]</span>
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-muted)] max-w-md leading-relaxed">
        Mix chemicals. Trade materials. Build your empire in the chemical factory.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="pixel-btn pixel-btn--primary hover-lift hover-glow-teal"
        >
          {"[ GET STARTED ]"}
        </Link>
        <Link
          href="/login"
          className="pixel-btn hover-lift"
        >
          {"[ SIGN IN ]"}
        </Link>
      </div>
    </div>
  );
}
