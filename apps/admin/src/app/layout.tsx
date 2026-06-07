import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Praetorian Console — Emerald Kingdom Admin",
  description: "Admin panel untuk mengelola platform Emerald Kingdom.",
};

import { Sidebar } from "../components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ marginLeft: "260px", flex: 1, width: "calc(100% - 260px)" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
