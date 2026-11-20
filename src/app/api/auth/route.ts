import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/admin-storage";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    let authenticatedEmail = "";
    let role = "SUPER_ADMIN";

    // 1. Coba autentikasi via Supabase Auth terlebih dahulu
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (!error && data.user) {
        authenticatedEmail = data.user.email || email.trim();
      }
    }

    // 2. Fallback / Built-in Internal Mentor Account untuk Demo Day
    if (!authenticatedEmail) {
      if (
        (email.trim().toLowerCase() === "admin@indigo.id" ||
          email.trim().toLowerCase() === "mentor@indigo.id") &&
        (password === "IndigoAdmin2026!" || password === "admin123")
      ) {
        authenticatedEmail = email.trim().toLowerCase();
        role =
          authenticatedEmail === "mentor@indigo.id"
            ? "MENTOR_REVIEWER"
            : "SUPER_ADMIN";
      }
    }

    if (!authenticatedEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email atau password salah. Gunakan akun Supabase Auth Anda atau akun Demo Mentor (admin@indigo.id / IndigoAdmin2026!).",
        },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: { email: authenticatedEmail, role },
    });

    res.cookies.set("indigo_admin_session", `${authenticatedEmail}:${role}`, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      // Tanpa maxAge: otomatis menjadi Session Cookie (berakhir saat browser ditutup)
    });

    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal melakukan autentikasi";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("indigo_admin_session");
  return res;
}
