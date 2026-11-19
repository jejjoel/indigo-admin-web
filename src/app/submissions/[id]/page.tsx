"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { SubmissionData, SubmissionStatus } from "@/types/admin";
import {
  ArrowLeft,
  Lock,
  FileText,
  Download,
  ExternalLink,
  User,
  Gamepad2,
  Star,
  Save,
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#E71C34]" />
        </div>
      }
    >
      <SubmissionDetailContent />
    </Suspense>
  );
}

function SubmissionDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = decodeURIComponent(params.id);

  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(true);

  // State Kurasi & Penilaian Mentor
  const [status, setStatus] = useState<SubmissionStatus>("Pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [scoreGameplay, setScoreGameplay] = useState(4);
  const [scoreBusiness, setScoreBusiness] = useState(4);
  const [scoreTeam, setScoreTeam] = useState(4);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.data) {
          const item: SubmissionData = json.data;
          setSubmission(item);
          setStatus(item.status);
          setAdminNotes(
            item.mentorReview?.reviewNotes || item.adminNotes || ""
          );
          if (item.mentorReview) {
            setScoreGameplay(item.mentorReview.scoreGameplay);
            setScoreBusiness(item.mentorReview.scoreBusiness);
            setScoreTeam(item.mentorReview.scoreTeam);
          }
        }
      } catch (err) {
        console.error("Error loading detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    setSaving(true);
    setSavedToast(false);

    try {
      const res = await fetch(
        `/api/submissions/${encodeURIComponent(submission.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            adminNotes,
            mentorReview: {
              scoreGameplay,
              scoreBusiness,
              scoreTeam,
              reviewNotes: adminNotes,
            },
          }),
        }
      );

      const json = await res.json();
      if (json.success && json.data) {
        setSubmission(json.data);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save evaluation:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!submission) return;
    if (
      !window.confirm(
        `Hapus permanen data pendaftaran ${submission.startupName} (${submission.registrationCode})?`
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

  const avgScore = ((scoreGameplay + scoreBusiness + scoreTeam) / 3).toFixed(1);
  const pitchDeckStreamUrl = `/api/pitchdeck/${encodeURIComponent(submission.id)}`;
  const pitchDeckDownloadUrl = `/api/pitchdeck/${encodeURIComponent(
    submission.id
  )}?download=1`;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/submissions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141721] hover:bg-[#1b202e] border border-[#252b3b] text-xs font-semibold text-gray-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Daftar Pendaftar
            </Link>
            <span className="font-mono text-sm font-extrabold text-[#F3E000] bg-[#141721] px-3 py-1 rounded-lg border border-[#252b3b]">
              {submission.registrationCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800 text-xs font-bold text-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Pendaftar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: DATA LENGKAP & PRIVATE PITCH DECK VIEWER */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. PRIVATE PITCH DECK VIEWER (ADMIN ONLY) */}
            <div className="bg-[#141721] border border-[#252b3b] rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-[#700B1C] via-[#BC1428] to-[#E71C34] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#F3E000]">
                    <Lock className="w-3.5 h-3.5" />
                    Admin-Only Private Storage Access
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
                    {showPdfPreview ? "Sembunyikan Preview" : "Tampilkan Preview PDF"}
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
                    className="w-full h-[460px] rounded-xl border border-[#252b3b] bg-white"
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

          {/* RIGHT COLUMN: FORM PENILAIAN MENTOR & UBAH STATUS */}
          <div className="space-y-6">
            <form
              onSubmit={handleSaveEvaluation}
              className="bg-[#141721] border border-[#252b3b] rounded-2xl p-6 sticky top-24 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#F3E000]" />
                  Panel Kurasi &amp; Skor Mentor
                </h3>
                <span className="px-2.5 py-1 rounded-lg bg-[#0b0c10] border border-[#252b3b] text-xs font-extrabold text-[#F3E000]">
                  Avg: {avgScore} / 5.0
                </span>
              </div>

              {savedToast && (
                <div className="mb-4 p-3 rounded-xl bg-green-950/80 border border-green-700 text-green-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Status seleksi &amp; penilaian mentor berhasil disimpan!</span>
                </div>
              )}

              {/* Status Seleksi */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
                  Status Seleksi Studio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_LIST.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        status === st
                          ? "bg-[#E71C34] border-[#E71C34] text-white shadow-md shadow-[#E71C34]/25"
                          : "bg-[#0b0c10] border-[#252b3b] text-gray-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skor Penilaian 1-5 */}
              <div className="space-y-4 mb-5 bg-[#0b0c10] p-4 rounded-xl border border-[#252b3b]">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-semibold">
                      1. Kualitas Gameplay &amp; Teknis
                    </span>
                    <span className="font-bold text-[#F3E000]">
                      {scoreGameplay} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scoreGameplay}
                    onChange={(e) => setScoreGameplay(Number(e.target.value))}
                    className="w-full accent-[#E71C34]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-semibold">
                      2. Potensi Bisnis &amp; Pitch Deck
                    </span>
                    <span className="font-bold text-[#F3E000]">
                      {scoreBusiness} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scoreBusiness}
                    onChange={(e) => setScoreBusiness(Number(e.target.value))}
                    className="w-full accent-[#E71C34]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-semibold">
                      3. Kesiapan Tim &amp; Captable
                    </span>
                    <span className="font-bold text-[#F3E000]">
                      {scoreTeam} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scoreTeam}
                    onChange={(e) => setScoreTeam(Number(e.target.value))}
                    className="w-full accent-[#E71C34]"
                  />
                </div>
              </div>

              {/* Catatan Evaluasi Mentor */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">
                  Catatan Evaluasi Mentor / Kurator
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Tuliskan hasil review Pitch Deck, kualitas vertical slice, atau rekomendasi tindak lanjut..."
                  className="w-full bg-[#0b0c10] border border-[#252b3b] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E71C34]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E71C34] hover:bg-[#D3182E] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#E71C34]/25 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Status &amp; Penilaian
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
