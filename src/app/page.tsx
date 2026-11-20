"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = sessionStorage.getItem("indigo_admin_session");
    if (isAuth) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] text-white">
      <Loader2 className="w-8 h-8 animate-spin text-[#E71C34]" />
    </div>
  );
}
