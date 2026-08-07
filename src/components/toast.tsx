"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { sfx } from "@/lib/sfx";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    if (type === "error") sfx.error();
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 200);
    }, 3000);
  }, []);

  const colorMap: Record<ToastType, { bg: string; border: string; text: string }> = {
    success: { bg: "#1a3a2a", border: "#22c55e", text: "#4ade80" },
    error:   { bg: "#3a1a1a", border: "#ef4444", text: "#f87171" },
    info:    { bg: "#1a2a3a", border: "#38bdf8", text: "#7dd3fc" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-[60px] right-4 z-[10000] flex flex-col gap-2">
        {toasts.map((t) => {
          const c = colorMap[t.type];
          return (
            <div
              key={t.id}
              className={`pixel-toast pixel-panel ${t.exiting ? "pixel-toast--exit" : ""}`}
              style={{
                background: c.bg,
                borderColor: c.border,
                color: c.text,
              }}
            >
              {t.type === "success" && "[OK] "}
              {t.type === "error" && "[!!] "}
              {t.type === "info" && "[i] "}
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
