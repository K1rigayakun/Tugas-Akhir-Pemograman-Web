import type { Metadata } from "next";

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
      <body style={{
        fontFamily: "'Lato', sans-serif",
        backgroundColor: "#050508",
        color: "#F5F0E8",
        margin: 0,
      }}>
        {children}
      </body>
    </html>
  );
}
