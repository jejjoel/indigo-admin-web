import { NextRequest, NextResponse } from "next/server";
import {
  getSubmissionById,
  updateSubmissionById,
  deleteSubmissionById,
} from "@/lib/admin-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getSubmissionById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateSubmissionById(id, {
      status: body.status,
      adminNotes: body.adminNotes,
      mentorReview: body.mentorReview,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui data";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteSubmissionById(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Data tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Data pendaftar dan dokumen Pitch Deck berhasil dihapus.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghapus data";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
