import { NextRequest, NextResponse } from "next/server";
import {
  getSubmissionById,
  getPrivatePitchDeckPdfBuffer,
} from "@/lib/admin-storage";

/**
 * ENDPOINT KHUSUS ADMIN: Membuka / Mengunduh File PDF Pitch Deck dari Private Storage.
 * Hanya dapat diakses melalui indigo-admin-web.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await getSubmissionById(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Pitch Deck tidak ditemukan." },
        { status: 404 }
      );
    }

    const pdfBuffer = await getPrivatePitchDeckPdfBuffer(submission);
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";

    const safeName = submission.pitchdeckFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const disposition = isDownload
      ? `attachment; filename="${safeName}"`
      : `inline; filename="${safeName}"`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memuat dokumen PDF";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
