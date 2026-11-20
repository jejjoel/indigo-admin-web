"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { SubmissionData, SubmissionStatus } from "@/types/admin";
import {
  ArrowLeft,
  Lock,
  FileText,
  Download,
  ExternalLink,
  User,
  Gamepad2,
  Trash2,
  CheckCircle2,
  Loader2,
  Eye,
  Video,
} from "lucide-react";

const STATUS_LIST: SubmissionStatus[] = [
  "Pending",
  "Under Review",
  "Accepted",
  "Rejected",
];

export default function SubmissionDetailReviewPage() {
  return (
    <AdminAuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] text-white">
            <Loader2 className="w-8 h-8 animate-spin text-[#E71C34]" />
          </div>
        }
      >
        <SubmissionDetailContent />
      </Suspense>
    </AdminAuthGuard>
  );
}

function SubmissionDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = decodeURIComponent(params.id);

  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSubmission(json.data);
        }
      } catch (err) {
        console.error("Error loading detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const handleStatusChange = async (newStatus: SubmissionStatus) => {
    if (!submission || submission.status === newStatus) return;
    setUpdatingStatus(true);
    setSavedToast(false);

    try {
      const res = await fetch(
        `/api/submissions/${encodeURIComponent(submission.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const json = await res.json();
      if (json.success && json.data) {
        setSubmission(json.data);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!submission) return;
    if (
      !window.confirm(
        `Hapus permanen data pendaftaran ${submission.startupName}?`
      )
    ) {
      return;
    }

    await fetch(`/api/submissions/${encodeURIComponent(submission.id)}`, {
      method: "DELETE",
    });
    router.push("/submissions");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E71C34]" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
        <AdminHeader />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Pendaftar Tidak Ditemukan</h1>
          <Link
            href="/submissions"
            className="text-sm text-[#F3E000] hover:underline"
          >
            &larr; Kembali ke Daftar Pendaftar
          </Link>
        </div>
      </div>
    );
  }

  const pitchDeckStreamUrl = `/api/pitchdeck/${encodeURIComponent(submission.id)}`;
  const pitchDeckDownloadUrl = `/api/pitchdeck/${encodeURIComponent(
    submission.id
  )}?download=1`;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
      <AdminHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar: Back Button, Status Selector, Delete Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-[#141721] border border-[#252b3b] rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/submissions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b0c10] hover:bg-[#1b202e] border border-[#252b3b] text-xs font-semibold text-gray-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white">
                {submission.startupName}
              </h1>
              <p className="text-[11px] text-gray-400">
                Terdaftar pada{" "}
                {new Date(submission.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-gray-400">
              Status Pendaftaran:
            </span>
            <select
              value={submission.status}
              disabled={updatingStatus}
              onChange={(e) =>
                handleStatusChange(e.target.value as SubmissionStatus)
              }
              className="bg-[#0b0c10] border border-[#252b3b] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#E71C34]"
            >
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {savedToast && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
              </span>
            )}

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-800 text-xs font-bold text-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. PRIVATE PITCH DECK VIEWER (ADMIN ONLY) */}
          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-[#700B1C] via-[#BC1428] to-[#E71C34] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#F3E000]">
                  <Lock className="w-3.5 h-3.5" />
                  Dokumen Pitch Deck Privat (Hanya Diakses Admin)
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
                  <FileText className="w-5 h-5" />
                  {submission.pitchdeckFileName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPdfPreview((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-xs font-bold text-white"
                >
                  <Eye className="w-3.5 h-3.5 text-[#F3E000]" />
                  {showPdfPreview
                    ? "Sembunyikan Preview"
                    : "Tampilkan Preview PDF"}
                </button>
                <a
                  href={pitchDeckDownloadUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F3E000] hover:bg-[#F2A900] text-xs font-extrabold text-black shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            </div>

            {showPdfPreview && (
              <div className="p-4 bg-[#0b0c10]">
                <iframe
                  src={pitchDeckStreamUrl}
                  title="Private Pitch Deck PDF Preview"
                  className="w-full h-[500px] rounded-xl border border-[#252b3b] bg-white"
                />
              </div>
            )}

            {/* Media Links (Teaser Video & Game Demo Build) */}
            <div className="p-4 bg-[#0d0f17] border-t border-[#252b3b] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {submission.teaserVideoUrl ? (
                  <a
                    href={submission.teaserVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141721] hover:bg-white/10 border border-[#252b3b] text-[#F3E000] font-bold"
                  >
                    <Video className="w-3.5 h-3.5 text-[#E71C34]" />
                    Tonton Teaser Video Game
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-gray-500">
                    Teaser Video: Tidak dilampirkan
                  </span>
                )}

                {submission.gameDemoUrl ? (
                  <a
                    href={submission.gameDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141721] hover:bg-white/10 border border-[#252b3b] text-green-400 font-bold"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    Buka Link Installer Game Demo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-gray-500">
                    Game Demo: Tidak dilampirkan
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. PROFIL GAME DIRECTOR (LEADER) - HALAMAN 2 FORM */}
          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#F3E000] uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E71C34]" />
              Profil Game Director / Team Leader (Halaman 2)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Nama Lengkap Game Director
                </span>
                <span className="text-sm font-bold text-white">
                  {submission.leaderName}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">Role di Tim</span>
                <span className="text-sm font-bold text-white">
                  {submission.leaderRole}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Komitmen Leader
                </span>
                <span className="text-sm font-bold text-[#F3E000]">
                  {submission.leaderCommitment}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Captable (Kepemilikan Saham)
                </span>
                <span
                  className={`text-sm font-extrabold ${
                    submission.captable === ">= 65%"
                      ? "text-green-400"
                      : "text-amber-400"
                  }`}
                >
                  {submission.captable}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">Email Resmi</span>
                <a
                  href={`mailto:${submission.leaderEmail}`}
                  className="text-sm font-semibold text-blue-400 hover:underline"
                >
                  {submission.leaderEmail}
                </a>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">No. WhatsApp</span>
                <span className="text-sm font-semibold text-white">
                  {submission.leaderWhatsapp}
                </span>
              </div>
              <div className="sm:col-span-2 bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  LinkedIn Game Director
                </span>
                <a
                  href={submission.leaderLinkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#F3E000] hover:underline inline-flex items-center gap-1"
                >
                  {submission.leaderLinkedin}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* 3. DETAIL GAME STARTUP - HALAMAN 3 & 5 FORM */}
          <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#F3E000] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#E71C34]" />
              Game Startup Details &amp; Preference (Halaman 3 &amp; 5)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Nama Team Game Startup
                </span>
                <span className="text-sm font-bold text-white">
                  {submission.startupName}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Tanggal Dibentuk &amp; Status Badan Usaha
                </span>
                <span className="text-sm font-bold text-white">
                  {submission.dateFormed} • ({submission.companyStatus})
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Lokasi Domisili
                </span>
                <span className="text-sm font-semibold text-white">
                  {submission.location}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Target Platform &amp; Genre Dominan
                </span>
                <span className="text-sm font-bold text-[#F3E000]">
                  {submission.gameGenre} — {submission.targetPlatform}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Komunitas Game Developer
                </span>
                <span className="text-sm font-semibold text-white">
                  {submission.inCommunity === "Ya"
                    ? `Ya (${submission.communityName || "-"})`
                    : "Tidak"}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Program Lain yang Pernah Diikuti
                </span>
                <span className="text-sm font-semibold text-white">
                  {submission.otherPrograms}
                </span>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Website / itch.io / Steam Page
                </span>
                <a
                  href={submission.startupWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  {submission.startupWebsite}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-[#0b0c10] p-3.5 rounded-xl border border-[#252b3b]">
                <span className="text-gray-400 block mb-0.5">
                  Sumber Mengetahui Indigo Game
                </span>
                <span className="text-xs font-semibold text-gray-200">
                  {submission.referralSource}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
