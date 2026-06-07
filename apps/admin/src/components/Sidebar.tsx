"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gavel,
  ShieldCheck,
  Building2,
  CalendarDays,
  FileText,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: "/", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "/users", label: "Kelola User", icon: Users, href: "/users" },
    { id: "/auctions", label: "Kelola Lelang", icon: Gavel, href: "/auctions" },
    { id: "/kyc", label: "Review KYC", icon: ShieldCheck, href: "/kyc" },
    { id: "/museum", label: "Museum", icon: Building2, href: "/museum" },
    { id: "/events", label: "Events", icon: CalendarDays, href: "/events" },
    { id: "/finance", label: "Keuangan", icon: FileText, href: "/finance" },
    { id: "/cosmetics", label: "Cosmetics", icon: Building2, href: "/cosmetics" },
    { id: "/achievements", label: "Achievements", icon: ShieldCheck, href: "/achievements" },
    { id: "/content", label: "Kelola Konten", icon: FileText, href: "/content" },
    { id: "/security", label: "Keamanan", icon: ShieldAlert, href: "/security" },
    { id: "/audit", label: "Audit Log", icon: FileText, href: "/audit" },
  ];

  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "1.5rem 0",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "0 1.5rem", marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-emerald)",
            letterSpacing: "0.02em",
          }}
        >
          Praetorian Console
        </h1>
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--color-text-muted)",
            marginTop: "0.25rem",
            letterSpacing: "0.05em",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          Emerald Kingdom Admin
        </p>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0 1rem" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                color: isActive ? "var(--color-ivory)" : "var(--color-text-muted)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                borderRadius: "8px",
                background: isActive ? "var(--color-emerald-glow)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "rgba(16, 185, 129, 0.2)" : "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--color-surface-hover)";
                  e.currentTarget.style.color = "var(--color-ivory)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? "var(--color-emerald)" : "inherit" }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1.5rem" }}>
        <div style={{
          padding: "1rem",
          background: "var(--color-bg)",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          fontSize: "0.75rem",
          color: "var(--color-text-muted)"
        }}>
          Logged in as<br />
          <strong style={{ color: "var(--color-ivory)", fontSize: "0.875rem" }}>TheEmperor</strong><br />
          <span style={{ color: "var(--color-emerald)" }}>Super Admin</span>
        </div>
      </div>
    </aside>
  );
}
