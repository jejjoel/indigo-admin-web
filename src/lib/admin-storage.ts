import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type {
  SubmissionData,
  SubmissionStatus,
  MentorReviewScore,
  ContactMessageData,
} from "../types/admin";

// Lokasi shared data lokal dari Repo 1 (saat keduanya dijalankan di komputer lokal)
const SHARED_PUBLIC_DATA_DIR = path.resolve(
  process.cwd(),
  "..",
  "indigo-public-web",
  "data"
);
const LOCAL_FALLBACK_DIR = path.join(process.cwd(), "data");

function getActiveDataDir(): string {
  if (fs.existsSync(SHARED_PUBLIC_DATA_DIR)) {
    return SHARED_PUBLIC_DATA_DIR;
  }
  if (!fs.existsSync(LOCAL_FALLBACK_DIR)) {
    fs.mkdirSync(LOCAL_FALLBACK_DIR, { recursive: true });
  }
  return LOCAL_FALLBACK_DIR;
}

const INITIAL_SUBMISSIONS: SubmissionData[] = [
  {
    id: "sub-101",
    registrationCode: "IND-2026-101A",
    createdAt: "2026-11-17T08:00:00.000Z",
    status: "Accepted",
    adminNotes: "Gameplay demo sangat solid, pitch deck sudah sesuai standar Indigo.",
    agreedToTerms: true,
    leaderName: "Arya Wicaksono",
    leaderRole: "Game Director & Lead Programmer",
    leaderLinkedin: "https://linkedin.com/in/aryawicaksono",
    leaderCommitment: "Full Time",
    leaderEmail: "arya@nusantaragames.id",
    leaderWhatsapp: "081234567890",
    captable: ">= 65%",
    startupName: "Nusantara Game Studio",
    dateFormed: "2024-03-15",
    location: "Bandung, Jawa Barat",
    targetPlatform: "PC (Personal Computer)",
    startupWebsite: "https://nusantaragames.itch.io/project-kresna",
    gameGenre: "Role-playing (RPG)",
    companyStatus: "PT",
    inCommunity: "Ya",
    communityName: "GameDev Bandung & Asosiasi Game Indonesia",
    otherPrograms: "IGDX Academy 2024",
    pitchdeckFileName: "Pitchdeck_NusantaraGames_v3.pdf",
    pitchdeckStoragePath: "pitch-decks/IND-2026-101A_Pitchdeck_NusantaraGames_v3.pdf",
    teaserVideoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    gameDemoUrl: "https://drive.google.com/file/d/sample-build-nusantara/view",
    referralSource: "Social Media (Facebook, Instagram, LinkedIn, lainnya)",
    mentorReview: {
      scoreGameplay: 5,
      scoreBusiness: 4,
      scoreTeam: 5,
      reviewNotes: "Vertical slice sudah playable 30 menit, captable aman >= 65%.",
      reviewedBy: "Lead Mentor Indigo",
      updatedAt: "2026-11-18T10:00:00.000Z",
    },
  },
  {
    id: "sub-102",
    registrationCode: "IND-2026-102B",
    createdAt: "2026-11-18T02:00:00.000Z",
    status: "Under Review",
    adminNotes: "Sedang dikurasi oleh mentor teknis untuk vertical slice review.",
    agreedToTerms: true,
    leaderName: "Dewi Safitri",
    leaderRole: "Game Designer & Producer",
    leaderLinkedin: "https://linkedin.com/in/dewisafitri-gd",
    leaderCommitment: "Full Time",
    leaderEmail: "dewi@pixelcrafters.co",
    leaderWhatsapp: "082198765432",
    captable: ">= 65%",
    startupName: "PixelCrafters Interactive",
    dateFormed: "2025-01-10",
    location: "Yogyakarta",
    targetPlatform: "Mobile (Smartphone & Tablet)",
    startupWebsite: "https://pixelcrafters.co",
    gameGenre: "Puzzle",
    companyStatus: "CV",
    inCommunity: "Ya",
    communityName: "GameLAN Jogja",
    otherPrograms: "-",
    pitchdeckFileName: "PixelCrafters_Deck_2026.pdf",
    pitchdeckStoragePath: "pitch-decks/IND-2026-102B_PixelCrafters_Deck_2026.pdf",
    teaserVideoUrl: "https://youtube.com/watch?v=sample-teaser",
    gameDemoUrl: "https://testflight.apple.com/join/sample",
    referralSource: "Forum, Seminar, Webinar",
    mentorReview: {
      scoreGameplay: 4,
      scoreBusiness: 4,
      scoreTeam: 4,
      reviewNotes: "Mekanik puzzle unik, perlu pendalaman strategi monetisasi F2P.",
      reviewedBy: "Resident Mentor",
      updatedAt: "2026-11-18T14:00:00.000Z",
    },
  },
];

const INITIAL_MESSAGES: ContactMessageData[] = [
  {
    id: "msg-101",
    fullName: "Rendra Mahendra (Publisher Representative)",
    email: "rendra@southeastgames.pub",
    message:
      "Halo Tim Indigo Game, kami tertarik menjajaki kemitraan co-publishing untuk batch studio PC/Console tahun 2026.",
    isRead: false,
    createdAt: "2026-11-18T09:30:00.000Z",
  },
];

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your-project-id")) {
    return null;
  }
  return createClient(url, key);
}

// Konversi row snake_case dari tabel PostgreSQL game_submissions ke camelCase SubmissionData
function mapDbRowToSubmission(row: Record<string, unknown>): SubmissionData {
  const reviews = Array.isArray(row.submission_reviews)
    ? (row.submission_reviews as Record<string, unknown>[])
    : [];
  const latestReview = reviews[0];

  return {
    id: String(row.id),
    registrationCode: String(row.registration_code || `IND-2026-${String(row.id).slice(0, 4).toUpperCase()}`),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    status: (row.status as SubmissionStatus) || "Pending",
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    agreedToTerms: Boolean(row.agreed_to_terms ?? true),
    leaderName: String(row.leader_name || ""),
    leaderRole: String(row.leader_role || ""),
    leaderLinkedin: String(row.leader_linkedin || ""),
    leaderCommitment: row.leader_commitment === "Part Time" ? "Part Time" : "Full Time",
    leaderEmail: String(row.leader_email || ""),
    leaderWhatsapp: String(row.leader_whatsapp || ""),
    captable: row.captable === "< 65%" ? "< 65%" : ">= 65%",
    startupName: String(row.startup_name || ""),
    dateFormed: String(row.date_formed || ""),
    location: String(row.location || ""),
    targetPlatform: String(row.target_platform || ""),
    startupWebsite: String(row.startup_website || ""),
    gameGenre: String(row.game_genre || ""),
    companyStatus:
      row.company_status === "PT" || row.company_status === "CV"
        ? (row.company_status as "PT" | "CV")
        : "Belum terdaftar",
    inCommunity: row.in_community === "Ya" ? "Ya" : "Tidak",
    communityName: row.community_name ? String(row.community_name) : undefined,
    otherPrograms: String(row.other_programs || "-"),
    pitchdeckFileName: String(row.pitchdeck_file_name || "Pitchdeck.pdf"),
    pitchdeckStoragePath: String(row.pitchdeck_storage_path || ""),
    teaserVideoUrl: row.teaser_video_url ? String(row.teaser_video_url) : undefined,
    gameDemoUrl: row.game_demo_url ? String(row.game_demo_url) : undefined,
    referralSource: String(row.referral_source || ""),
    mentorReview: latestReview
      ? {
          scoreGameplay: Number(latestReview.score_gameplay || 4),
          scoreBusiness: Number(latestReview.score_business || 4),
          scoreTeam: Number(latestReview.score_team || 4),
          reviewNotes: String(latestReview.review_notes || row.admin_notes || ""),
          updatedAt: String(latestReview.created_at || ""),
        }
      : undefined,
  };
}

function readLocalSubmissions(): SubmissionData[] {
  try {
    const dir = getActiveDataDir();
    const file = path.join(dir, "submissions.json");
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(INITIAL_SUBMISSIONS, null, 2), "utf-8");
      return INITIAL_SUBMISSIONS;
    }
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (!Array.isArray(parsed)) return INITIAL_SUBMISSIONS;
    return parsed.map((item: SubmissionData) => ({
      ...item,
      registrationCode:
        item.registrationCode ||
        `IND-2026-${item.id.slice(-4).toUpperCase()}`,
      pitchdeckFileName: item.pitchdeckFileName || "Pitchdeck_Startup.pdf",
      pitchdeckStoragePath:
        item.pitchdeckStoragePath ||
        `pitch-decks/${item.id}_${item.pitchdeckFileName || "Pitchdeck.pdf"}`,
    }));
  } catch (err) {
    console.error("Error reading local submissions:", err);
    return INITIAL_SUBMISSIONS;
  }
}

function writeLocalSubmissions(data: SubmissionData[]): void {
  try {
    const dir = getActiveDataDir();
    const file = path.join(dir, "submissions.json");
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local submissions:", err);
  }
}

export async function getAllSubmissions(): Promise<SubmissionData[]> {
  const localData = readLocalSubmissions();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("game_submissions")
      .select("*, submission_reviews(*)")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const dbItems = data.map((row) =>
        mapDbRowToSubmission(row as Record<string, unknown>)
      );
      // Gabungkan data Supabase dengan data lokal (berdasarkan registrationCode) agar data tes sebelum konek Supabase tetap tampil
      const seenCodes = new Set(dbItems.map((i) => i.registrationCode));
      const merged = [
        ...dbItems,
        ...localData.filter((l) => !seenCodes.has(l.registrationCode)),
      ];
      return merged;
    }
  }

  return localData;
}

export async function getSubmissionById(id: string): Promise<SubmissionData | null> {
  const all = await getAllSubmissions();
  return (
    all.find((item) => item.id === id || item.registrationCode === id) || null
  );
}

export async function updateSubmissionById(
  id: string,
  payload: {
    status?: SubmissionStatus;
    adminNotes?: string;
    mentorReview?: MentorReviewScore;
  }
): Promise<SubmissionData | null> {
  const supabase = getSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (supabase && isUuid) {
    const updateObj: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.status) updateObj.status = payload.status;
    if (payload.adminNotes !== undefined) updateObj.admin_notes = payload.adminNotes;

    await supabase.from("game_submissions").update(updateObj).eq("id", id);

    if (payload.mentorReview) {
      await supabase.from("submission_reviews").insert({
        submission_id: id,
        score_gameplay: payload.mentorReview.scoreGameplay,
        score_business: payload.mentorReview.scoreBusiness,
        score_team: payload.mentorReview.scoreTeam,
        review_notes: payload.mentorReview.reviewNotes,
      });
    }
  }

  // Update juga di local JSON jika ada
  const local = readLocalSubmissions();
  const idx = local.findIndex((i) => i.id === id || i.registrationCode === id);
  if (idx !== -1) {
    local[idx] = {
      ...local[idx],
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.adminNotes !== undefined ? { adminNotes: payload.adminNotes } : {}),
      ...(payload.mentorReview
        ? {
            mentorReview: {
              ...payload.mentorReview,
              updatedAt: new Date().toISOString(),
            },
          }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    writeLocalSubmissions(local);
  }

  return getSubmissionById(id);
}

export async function deleteSubmissionById(id: string): Promise<boolean> {
  const target = await getSubmissionById(id);
  const supabase = getSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let deletedInDb = false;
  if (supabase && isUuid) {
    if (target?.pitchdeckStoragePath) {
      const storageKey = target.pitchdeckStoragePath.replace(/^pitch-decks\//, "");
      await supabase.storage.from("pitch-decks").remove([storageKey]);
    }
    const { error } = await supabase.from("game_submissions").delete().eq("id", id);
    if (!error) deletedInDb = true;
  }

  const local = readLocalSubmissions();
  const filtered = local.filter(
    (i) => i.id !== id && i.registrationCode !== target?.registrationCode
  );
  const deletedInLocal = filtered.length < local.length;
  if (deletedInLocal) {
    writeLocalSubmissions(filtered);
  }

  return deletedInDb || deletedInLocal;
}

/**
 * Mengambil file PDF Pitch Deck dari Private Storage Bucket Supabase atau Folder Privat Lokal.
 * Hanya dapat dipanggil oleh Admin dari indigo-admin-web.
 */
export async function getPrivatePitchDeckPdfBuffer(
  submission: SubmissionData
): Promise<Buffer> {
  const storageFileName = submission.pitchdeckStoragePath.replace(
    /^pitch-decks\//,
    ""
  );

  // 1. Cek di folder privat lokal terlebih dahulu
  const dir = getActiveDataDir();
  const localPdfPath = path.join(dir, "pitch-decks", storageFileName);
  if (fs.existsSync(localPdfPath)) {
    return fs.readFileSync(localPdfPath);
  }

  // 2. Cek jika ada file di pitch-decks lokal yang mengandung registrationCode
  const pitchDecksDir = path.join(dir, "pitch-decks");
  if (fs.existsSync(pitchDecksDir)) {
    const files = fs.readdirSync(pitchDecksDir);
    const matched = files.find(
      (f) =>
        f.includes(submission.registrationCode) ||
        f.endsWith(submission.pitchdeckFileName)
    );
    if (matched) {
      return fs.readFileSync(path.join(pitchDecksDir, matched));
    }
  }

  // 3. Unduh dari Supabase Private Storage Bucket 'pitch-decks'
  const supabase = getSupabaseAdminClient();
  if (supabase && storageFileName) {
    const { data, error } = await supabase.storage
      .from("pitch-decks")
      .download(storageFileName);
    if (!error && data) {
      const arr = await data.arrayBuffer();
      return Buffer.from(arr);
    }
  }

  // 4. Fallback: Buat dokumen PDF ringkasan Pitch Deck resmi yang valid agar preview tetap tampil untuk data sample
  return generateFallbackPitchDeckPdf(submission);
}

function generateFallbackPitchDeckPdf(sub: SubmissionData): Buffer {
  const clean = (str: string) =>
    (str || "-").replace(/[()\\]/g, "").slice(0, 75);

  const lines = [
    "INDIGO GAME STARTUP INCUBATION - OFFICIAL PITCH DECK DOCUMENT",
    "-------------------------------------------------------------",
    `Startup Team Name : ${clean(sub.startupName)}`,
    `Company Status    : ${clean(sub.companyStatus)} (${clean(sub.location)})`,
    `Game Director     : ${clean(sub.leaderName)} (${clean(sub.leaderRole)})`,
    `Commitment & Cap  : ${clean(sub.leaderCommitment)} | Captable ${clean(sub.captable)}`,
    `Email & WhatsApp  : ${clean(sub.leaderEmail)} | ${clean(sub.leaderWhatsapp)}`,
    `Target Platform   : ${clean(sub.targetPlatform)}`,
    `Dominant Genre    : ${clean(sub.gameGenre)}`,
    `Website / Store   : ${clean(sub.startupWebsite)}`,
    `Attached Filename : ${clean(sub.pitchdeckFileName)}`,
    "-------------------------------------------------------------",
    "CONFIDENTIAL - INTERNAL CURATION & MENTOR REVIEW ONLY",
  ];

  const textOps = lines
    .map((line, i) => `1 0 0 1 50 ${750 - i * 24} Tm (${line}) Tj`)
    .join("\n");

  const stream = `BT\n/F1 11 Tf\n${textOps}\nET`;
  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${stream.length} >>
stream
${stream}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000300 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
370
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}

// ============================================================================
// CONTACT MESSAGES (/inbox)
// ============================================================================
export async function getAllContactMessages(): Promise<ContactMessageData[]> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        fullName: String(r.full_name || ""),
        email: String(r.email || ""),
        message: String(r.message || ""),
        isRead: Boolean(r.is_read),
        createdAt: String(r.created_at || new Date().toISOString()),
      }));
    }
  }

  try {
    const dir = getActiveDataDir();
    const file = path.join(dir, "contact_messages.json");
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(INITIAL_MESSAGES, null, 2), "utf-8");
      return INITIAL_MESSAGES;
    }
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    return Array.isArray(parsed) ? parsed : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
}

export async function toggleContactMessageRead(id: string, isRead: boolean): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (supabase && isUuid) {
    await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  }

  try {
    const dir = getActiveDataDir();
    const file = path.join(dir, "contact_messages.json");
    if (fs.existsSync(file)) {
      const list: ContactMessageData[] = JSON.parse(fs.readFileSync(file, "utf-8"));
      const idx = list.findIndex((m) => m.id === id);
      if (idx !== -1) {
        list[idx].isRead = isRead;
        fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf-8");
      }
    }
    return true;
  } catch {
    return false;
  }
}
