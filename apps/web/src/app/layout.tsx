// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import LenisProvider from "./LenisProvider";
import BackgroundCanvas from "../components/BackgroundCanvas";
import SiteHeader from "../components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emerald Kingdom — Where Fortune Meets Glory",
  description:
    "Platform lelang online premium bertema kerajaan medieval fantasy. Bid. Conquer. Ascend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-platform min-h-screen">
        {/* Layer 0 — Background canvas, posisi fixed di belakang semua konten */}
        <BackgroundCanvas />

        {/* Layer 1 — Konten halaman, harus di atas canvas */}
        <LenisProvider>
          <div style={{ position: "relative", zIndex: 1 }}>
            <SiteHeader />
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
