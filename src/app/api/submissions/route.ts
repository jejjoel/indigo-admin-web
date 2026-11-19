import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions } from "@/lib/admin-storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const q = searchParams.get("q")?.toLowerCase().trim();

    let data = await getAllSubmissions();

    if (status && status !== "ALL") {
      data = data.filter((item) => item.status === status);
    }

    if (platform && platform !== "ALL") {
      data = data.filter((item) =>
        item.targetPlatform.toLowerCase().includes(platform.toLowerCase())
      );
    }

    if (q) {
      data = data.filter(
        (item) =>
          item.startupName.toLowerCase().includes(q) ||
          item.leaderName.toLowerCase().includes(q) ||
          item.registrationCode.toLowerCase().includes(q) ||
          item.gameGenre.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memuat data pendaftar";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
