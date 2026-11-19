"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { SubmissionData } from "@/types/admin";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Lock,
  Gamepad2,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubmissions(json.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const total = submissions.length;
  const pending = submissions.filter((s) => s.status === "Pending").length;
  const underReview = submissions.filter((s) => s.status === "Under Review").length;
  const accepted = submissions.filter((s) => s.status === "Accepted").length;
  const rejected = submissions.filter((s) => s.status === "Rejected").length;

  // Distribusi Platform
  const platformCounts = submissions.reduce<Record<string, number>>((acc, cur) => {
    const key = cur.targetPlatform.split(" ")[0] || "Lainnya";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Distribusi Captable >= 65%
  const eligibleCaptable = submissions.filter((s) => s.captable === ">= 65%").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#F3E000]">
              <Lock className="w-3.5 h-3.5 text-[#E71C34]" />
              Shared Database &amp; Private Storage Connected
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              Executive Curation Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Ringkasan metrik pendaftaran Indigo Game Intake &amp; distribusi pipeline seleksi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141721] hover:bg-[#1b202e] border border-[#252b3b] text-xs font-semibold text-gray-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/submissions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E71C34] hover:bg-[#D3182E] text-xs font-bold text-white shadow-lg shadow-[#E71C34]/25 transition-all"
            >
              Kelola Semua Pendaftar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 1. Ringkasan Metrik Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase">Total Pendaftar</span>
              <Users className="w-4 h-4 text-[#F3E000]" />
            </div>
            <p className="text-3xl font-extrabold text-white">{total}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {eligibleCaptable} studio captable &ge; 65%
            </p>
          </div>

          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-5">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase">Pending (New)</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400">{pending}</p>
            <p className="text-[11px] text-gray-400 mt-1">Menunggu screening berkas</p>
          </div>

          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-5">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-xs font-bold uppercase">Under Review</span>
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-blue-400">{underReview}</p>
            <p className="text-[11px] text-gray-400 mt-1">Sedang dinilai mentor</p>
          </div>

          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-5">
            <div className="flex items-center justify-between text-green-400 mb-2">
              <span className="text-xs font-bold uppercase">Accepted</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-green-400">{accepted}</p>
            <p className="text-[11px] text-gray-400 mt-1">Lolos tahap inkubasi</p>
          </div>

          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-5">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-xs font-bold uppercase">Rejected</span>
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-red-400">{rejected}</p>
            <p className="text-[11px] text-gray-400 mt-1">Belum memenuhi syarat</p>
          </div>
        </div>

        {/* 2. Distribusi Platform & Pendaftar Terbaru */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribusi Platform */}
          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#E71C34]" />
              Distribusi Target Platform
            </h2>
            <div className="space-y-3">
              {Object.entries(platformCounts).map(([plat, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={plat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-200">{plat}</span>
                      <span className="text-gray-400">
                        {count} studio ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#0b0c10] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E71C34] to-[#F2A900]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(platformCounts).length === 0 && (
                <p className="text-xs text-gray-500">Belum ada data pendaftar.</p>
              )}
            </div>
          </div>

          {/* 5 Pendaftar Terbaru */}
          <div className="lg:col-span-2 bg-[#141721] border border-[#252b3b] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Pendaftar Terbaru Masuk
              </h2>
              <Link
                href="/submissions"
                className="text-xs font-bold text-[#F3E000] hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="divide-y divide-[#252b3b]">
              {submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#F3E000]">
                        {sub.registrationCode}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {sub.startupName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Leader: {sub.leaderName} ({sub.leaderCommitment}) •{" "}
                      {sub.gameGenre} • 🔒 {sub.pitchdeckFileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        sub.status === "Accepted"
                          ? "bg-green-950/80 text-green-300 border border-green-700"
                          : sub.status === "Rejected"
                          ? "bg-red-950/80 text-red-300 border border-red-700"
                          : sub.status === "Under Review"
                          ? "bg-blue-950/80 text-blue-300 border border-blue-700"
                          : "bg-amber-950/80 text-amber-300 border border-amber-700"
                      }`}
                    >
                      {sub.status}
                    </span>

                    <Link
                      href={`/submissions/${encodeURIComponent(sub.id)}`}
                      className="px-3 py-1.5 rounded-lg bg-[#0b0c10] hover:bg-white/10 border border-[#252b3b] text-xs font-semibold text-white transition-colors"
                    >
                      Review &amp; Buka PDF
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
