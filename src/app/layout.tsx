import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { GameProvider } from "@/lib/game-context";
import { ToastProvider } from "@/components/toast";
import { Navbar } from "@/components/navbar";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chem Factory",
  description: "Chemical mixing & trading game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pixelFont.className} bg-[#0f0f23] text-[#c0c0c0] min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            <GameProvider>
              <Navbar />
              <main className="max-w-5xl mx-auto px-4 py-8 page-enter">{children}</main>
            </GameProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
