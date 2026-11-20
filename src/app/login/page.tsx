"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Jika masih dalam tab/sesi yang sama dan sudah login, langsung ke dashboard
    if (sessionStorage.getItem("indigo_admin_session") === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal masuk ke portal admin.");
      }

      // Gunakan sessionStorage: aktif selama tab masih terbuka.
      // Begitu tab/browser ditutup, sesi otomatis berakhir dan wajib login lagi.
      sessionStorage.setItem("indigo_admin_session", "true");
      localStorage.removeItem("indigo_admin_logged_in");
      router.push("/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("admin@indigo.id");
    setPassword("IndigoAdmin2026!");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-gradient-to-b from-[#E71C34]/20 via-[#700B1C]/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#141721] border border-[#252b3b] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E71C34] to-[#700B1C] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#E71C34]/25">
            <ShieldAlert className="w-6 h-6 text-[#F3E000]" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#E71C34]/20 border border-[#E71C34]/40 text-[#ff6b7d] text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" /> Restricted Internal Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Indigo Game Admin &amp; Mentor
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Masuk untuk mengelola pendaftar, melihat dokumen Pitch Deck privat, dan memperbarui status seleksi.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email Internal Staf / Mentor
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@indigo.id"
                required
                className="w-full bg-[#0b0c10] border border-[#252b3b] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#E71C34]"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#0b0c10] border border-[#252b3b] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#E71C34]"
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E71C34] hover:bg-[#D3182E] text-white text-sm font-bold shadow-lg shadow-[#E71C34]/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Login ke Portal Admin"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#252b3b]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Mendukung akun Supabase Auth &amp; Demo:</span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="inline-flex items-center gap-1 text-[#F3E000] font-bold hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Isi Akun Demo
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Akun Demo Cepat: <code className="text-gray-300">admin@indigo.id</code> /{" "}
            <code className="text-gray-300">IndigoAdmin2026!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
