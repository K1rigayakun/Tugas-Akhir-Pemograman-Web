import type { Metadata } from "next";
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
      <body className="bg-platform min-h-screen">{children}</body>
    </html>
  );
}
