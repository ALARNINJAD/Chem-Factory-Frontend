import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { GameProvider } from "@/lib/game-context";
import { ToastProvider } from "@/components/toast";
import { GameHud } from "@/components/game-hud";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chem Factory",
  description: "Chemical mixing & trading game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${pixelFont.className} bg-[var(--bg-deep)] text-[#c0c0c0] h-dvh overflow-hidden flex flex-col`}>
        <AuthProvider>
          <ToastProvider>
            <GameProvider>
              <GameHud />
              <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
            </GameProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
