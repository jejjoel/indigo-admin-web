import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indigo Game Internal Admin & Curation Portal",
  description:
    "Portal Monitoring Internal & Kurasi Mentor untuk Indigo Game Startup Incubation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0b0c10] text-white selection:bg-[#E71C34] selection:text-white">
        {children}
      </body>
    </html>
  );
}
