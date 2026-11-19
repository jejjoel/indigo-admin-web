export type SubmissionStatus = "Pending" | "Under Review" | "Accepted" | "Rejected";

export interface MentorReviewScore {
  scoreGameplay: number; // 1 - 5
  scoreBusiness: number; // 1 - 5
  scoreTeam: number;     // 1 - 5
  reviewNotes: string;
  reviewedBy?: string;
  updatedAt?: string;
}

export interface SubmissionData {
  id: string;
  registrationCode: string;
  createdAt: string;
  updatedAt?: string;
  status: SubmissionStatus;
  adminNotes?: string;

  // Halaman 1: Kriteria
  agreedToTerms: boolean;

  // Halaman 2: Game Director (Leader)
  leaderName: string;
  leaderRole: string;
  leaderLinkedin: string;
  leaderCommitment: "Full Time" | "Part Time";
  leaderEmail: string;
  leaderWhatsapp: string;
  captable: ">= 65%" | "< 65%";

  // Halaman 3: Game Startup Details
  startupName: string;
  dateFormed: string;
  location: string;
  targetPlatform: string;
  startupWebsite: string;
  gameGenre: string;
  companyStatus: "PT" | "CV" | "Belum terdaftar";
  inCommunity: "Ya" | "Tidak";
  communityName?: string;
  otherPrograms: string;

  // Halaman 4: Game Startup Documents (Private Pitch Deck)
  pitchdeckFileName: string;
  pitchdeckStoragePath: string;
  teaserVideoUrl?: string;
  gameDemoUrl?: string;

  // Halaman 5: Preference
  referralSource: string;

  // Skor Penilaian Mentor
  mentorReview?: MentorReviewScore;
}

export interface ContactMessageData {
  id: string;
  fullName: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
