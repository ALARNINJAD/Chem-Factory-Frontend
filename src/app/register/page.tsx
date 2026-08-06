"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.register({ username, password });
      toast("ACCOUNT CREATED! SIGN IN TO CONTINUE", "success");
      router.push("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto flex items-center justify-center min-h-[60vh] page-enter">
      <div className="pixel-panel">
        <h1 className="text-sm mb-6 text-[var(--accent-primary)] text-center">
          {"<"}CREATE ACCOUNT{">"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">USERNAME</label>
            <input
              type="text"
              placeholder="choose a username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pixel-input"
              required
            />
          </div>
          <div>
            <label className="text-[8px] text-[var(--text-muted)] mb-1 block">PASSWORD</label>
            <input
              type="password"
              placeholder="choose a password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pixel-input"
              required
            />
          </div>
          {error && (
            <div className="pixel-panel pixel-panel--inset text-[var(--accent-danger)] text-[8px] p-2">
              {"!! "}{error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="pixel-btn pixel-btn--primary w-full mt-2 hover-lift"
          >
            {loading ? "[ CREATING... ]" : "[ REGISTER ]"}
          </button>
        </form>
        <div className="mt-4 text-center text-[8px] text-[var(--text-muted)]">
          HAVE AN ACCOUNT?{" "}
          <Link href="/login" className="text-[var(--accent-primary)] hover:underline">
            [SIGN IN]
          </Link>
        </div>
      </div>
    </div>
  );
}
