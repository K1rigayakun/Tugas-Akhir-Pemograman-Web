import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "../components/AdminShell";

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
      <body style={{ minHeight: "100vh" }}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
