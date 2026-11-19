"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { ContactMessageData } from "@/types/admin";
import { Inbox, Mail, CheckCircle2, Clock, RefreshCw } from "lucide-react";

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<ContactMessageData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Failed to load inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const toggleRead = async (msg: ContactMessageData) => {
    const nextRead = !msg.isRead;
    await fetch("/api/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, isRead: nextRead }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: nextRead } : m))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white">
      <AdminHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Inbox className="w-7 h-7 text-[#E71C34]" />
              Kotak Masuk Pesan &amp; Kolaborasi
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Daftar pesan kemitraan &amp; pertanyaan umum yang dikirim oleh pengunjung melalui formulir kontak website publik.
            </p>
          </div>

          <button
            type="button"
            onClick={loadInbox}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141721] hover:bg-[#1b202e] border border-[#252b3b] text-xs font-semibold text-gray-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-[#141721] border rounded-2xl p-5 transition-all ${
                msg.isRead ? "border-[#252b3b]" : "border-[#E71C34]/60"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#F3E000]" />
                  <span className="font-bold text-sm text-white">
                    {msg.fullName}
                  </span>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    &lt;{msg.email}&gt;
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500">
                    {new Date(msg.createdAt).toLocaleString("id-ID")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRead(msg)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      msg.isRead
                        ? "bg-green-950/60 border-green-700 text-green-300"
                        : "bg-amber-950/60 border-amber-700 text-amber-300"
                    }`}
                  >
                    {msg.isRead ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Sudah Dibaca
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Belum Dibaca
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-[#0b0c10] p-4 rounded-xl border border-[#252b3b]">
                {msg.message}
              </p>
            </div>
          ))}

          {!loading && messages.length === 0 && (
            <div className="bg-[#141721] border border-[#252b3b] rounded-2xl p-12 text-center text-gray-500 text-sm">
              Belum ada pesan masuk di kotak masuk.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
