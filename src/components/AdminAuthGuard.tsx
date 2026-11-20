"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Sesi aktif selama tab masih terbuka (sessionStorage).
    // Ketika tab ditutup atau dibuka di sesi baru, wajib login kembali.
    const isAuth = sessionStorage.getItem("indigo_admin_session");
    if (!isAuth) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] text-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E71C34] mx-auto mb-2" />
          <p className="text-xs text-gray-400">Memeriksa sesi login admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
