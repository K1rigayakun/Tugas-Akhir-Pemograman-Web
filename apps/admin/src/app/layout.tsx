import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Praetorian Console — Emerald Kingdom Admin",
  description: "Admin panel untuk mengelola platform Emerald Kingdom.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
