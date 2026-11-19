import { NextRequest, NextResponse } from "next/server";
import {
  getAllContactMessages,
  toggleContactMessageRead,
} from "@/lib/admin-storage";

export async function GET() {
  try {
    const data = await getAllContactMessages();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memuat kotak masuk";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, isRead } = await req.json();
    const ok = await toggleContactMessageRead(id, Boolean(isRead));
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbarui pesan";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
