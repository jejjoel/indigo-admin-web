"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { SubmissionData, SubmissionStatus } from "@/types/admin";
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Lock,
  RefreshCw,
  FileText,
} from "lucide-react";

const STATUS_OPTIONS: Array<"ALL" | SubmissionStatus> = [
  "ALL",
  "Pending",
  "Under Review",
  "Accepted",
  "Rejected",
];

const PLATFORM_OPTIONS = ["ALL", "PC", "Mobile", "Console", "VR/AR"];

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SubmissionStatus>("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<SubmissionData | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubmissions(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    const matchesPlatform =
      platformFilter === "ALL" ||
      item.targetPlatform.toLowerCase().includes(platformFilter.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.startupName.toLowerCase().includes(q) ||
      item.leaderName.toLowerCase().includes(q) ||
      item.registrationCode.toLowerCase().includes(q) ||
      item.gameGenre.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `/api/submissions/${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setSubmissions((prev) =>
          prev.filter((s) => s.id !== deleteTarget.id)
        );
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      "Registration Code",
      "Created At",
      "Status",
      "Startup Name",
      "Company Status",
      "Location",
      "Date Formed",
      "Target Platform",
      "Genre",
      "Leader Name",
      "Leader Role",
      "Leader Commitment",
      "Captable",
      "Leader Email",
      "Leader WhatsApp",
      "Leader LinkedIn",
      "Community",
      "Other Programs",
      "Pitch Deck File",
      "Teaser Video URL",
      "Game Demo URL",
      "Referral Source",
      "Admin Notes",
    ];

    const escapeCsv = (val: unknown) =>
      `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = filtered.map((s) =>
      [
        s.registrationCode,
        s.createdAt,
        s.status,
        s.startupName,
        s.companyStatus,
        s.location,
        s.dateFormed,
        s.targetPlatform,
        s.gameGenre,
        s.leaderName,
        s.leaderRole,
        s.leaderCommitment,
        s.captable,
        s.leaderEmail,
        s.leaderWhatsapp,
        s.leaderLinkedin,
        s.inCommunity === "Ya" ? s.communityName || "Ya" : "Tidak",
        s.otherPrograms,
        s.pitchdeckFileName,
        s.teaserVideoUrl || "-",
        s.gameDemoUrl || "-",
        s.referralSource,
        s.adminNotes || "-",
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Indigo_Game_Submissions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Daftar Pendaftar Game Startup
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Menampilkan {filtered.length} dari {submissions.length} pendaftaran. Klik &ldquo;Detail &amp; Buka PDF&rdquo; untuk membaca Pitch Deck privat dan memberi nilai.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchSubmissions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141721] hover:bg-[#1b202e] border border-[#252b3b] text-xs font-semibold text-gray-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F3E000] hover:bg-[#F2A900] text-xs font-extrabold text-black shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kode Tiket, Nama Studio, Game Director, Genre, atau Kota..."
              className="w-full bg-[#0b0c10] border border-[#252b3b] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#E71C34]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | SubmissionStatus)
              }
              className="bg-[#0b0c10] border border-[#252b3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E71C34]"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === "ALL" ? "Semua Status" : st}
                </option>
              ))}
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-[#0b0c10] border border-[#252b3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E71C34]"
            >
              {PLATFORM_OPTIONS.map((pl) => (
                <option key={pl} value={pl}>
                  {pl === "ALL" ? "Semua Platform" : pl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#141721] border border-[#252b3b] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0d0f17] border-b border-[#252b3b] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4">Kode Tiket</th>
                  <th className="py-3.5 px-4">Team Game Startup</th>
                  <th className="py-3.5 px-4">Game Director (Leader)</th>
                  <th className="py-3.5 px-4">Genre &amp; Platform</th>
                  <th className="py-3.5 px-4">Pitch Deck (Private)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Kurasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252b3b] text-xs">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-[#F3E000] whitespace-nowrap">
                      {item.registrationCode}
                      <div className="text-[10px] font-sans font-normal text-gray-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">
                        {item.startupName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.companyStatus} • {item.location}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-200">
                        {item.leaderName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.leaderCommitment} • Captable{" "}
                        <span
                          className={
                            item.captable === ">= 65%"
                              ? "text-green-400 font-bold"
                              : "text-amber-400 font-bold"
                          }
                        >
                          {item.captable}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#E71C34]/20 border border-[#E71C34]/40 text-[#ff6b7d] font-bold text-[11px] mb-1">
                        {item.gameGenre}
                      </span>
                      <div className="text-[11px] text-gray-400">
                        {item.targetPlatform.split(" ")[0]}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Link
                        href={`/submissions/${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0c10] hover:bg-white/10 border border-[#252b3b] text-amber-300 font-medium"
                        title="Klik untuk membuka preview PDF Pitch Deck"
                      >
                        <Lock className="w-3 h-3 text-[#F2A900]" />
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[140px]">
                          {item.pitchdeckFileName}
                        </span>
                      </Link>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === "Accepted"
                            ? "bg-green-950/80 text-green-300 border border-green-700"
                            : item.status === "Rejected"
                            ? "bg-red-950/80 text-red-300 border border-red-700"
                            : item.status === "Under Review"
                            ? "bg-blue-950/80 text-blue-300 border border-blue-700"
                            : "bg-amber-950/80 text-amber-300 border border-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/submissions/${encodeURIComponent(item.id)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E71C34] hover:bg-[#D3182E] text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail &amp; Buka PDF
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg bg-[#0b0c10] hover:bg-red-950/60 border border-[#252b3b] hover:border-red-800 text-gray-400 hover:text-red-400 transition-colors"
                          title="Hapus pendaftaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-500 text-sm"
                    >
                      Tidak ada data pendaftar yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-[#141721] border border-[#252b3b] rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">
                Hapus Data Pendaftar?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Anda yakin ingin menghapus pendaftaran{" "}
                <strong className="text-white">{deleteTarget.startupName}</strong> (
                <code className="text-[#F3E000]">{deleteTarget.registrationCode}</code>
                ) beserta dokumen Pitch Deck privatnya? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg border border-[#252b3b] text-xs font-semibold text-gray-300 hover:bg-white/5"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-[#E71C34] hover:bg-[#D3182E] text-xs font-bold text-white"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
