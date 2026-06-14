"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import {
  LayoutDashboard,
  Users,
  Gavel,
  ShieldCheck,
  Building2,
  CalendarDays,
  FileText,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  LogOut,
  List,
  Image,
  Palette,
  Wallet,
  Radio,
} from "lucide-react";
import { buildApiUrl } from "../lib/api";

// ── Context untuk share state collapsed ke layout ──
export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

// ── Menu items ──
const menuGroups = [
  {
    label: "Overview",
    items: [
      { id: "/", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    ],
  },
  {
    label: "Kelola",
    items: [
      { id: "/users", label: "Kelola User", icon: Users, href: "/users" },
      { id: "/auctions", label: "Kelola Lelang", icon: Gavel, href: "/auctions" },
      { id: "/live-control", label: "Live Control", icon: Radio, href: "/live-control" },
      { id: "/vault-offerings", label: "Vault Offerings", icon: Building2, href: "/vault-offerings" },
      { id: "/categories", label: "Kelola Kategori", icon: List, href: "/categories" },
      { id: "/kyc", label: "Review KYC", icon: ShieldCheck, href: "/kyc" },
      { id: "/museum", label: "Museum", icon: Building2, href: "/museum" },
      { id: "/events", label: "Events", icon: CalendarDays, href: "/events" },
      { id: "/topups", label: "Top Ups", icon: Wallet, href: "/topups" },
      { id: "/payments", label: "Payments", icon: Wallet, href: "/payments" },
    ],
  },
  {
    label: "Web Content",
    items: [
      { id: "/theme", label: "Kelola Tema", icon: Palette, href: "/theme" },
      { id: "/news-slider", label: "Berita & Slider", icon: Image, href: "/news-slider" },
      { id: "/content", label: "Kelola Halaman", icon: FileText, href: "/content" },
    ],
  },
  {
    label: "Fitur",
    items: [
      { id: "/finance", label: "Keuangan", icon: FileText, href: "/finance" },
      { id: "/cosmetics", label: "Cosmetics", icon: Sparkles, href: "/cosmetics" },
      { id: "/achievements", label: "Achievements", icon: Trophy, href: "/achievements" },
    ],
  },
  {
    label: "Sistem",
    items: [
      { id: "/security", label: "Keamanan", icon: ShieldAlert, href: "/security" },
      { id: "/audit", label: "Audit Log", icon: FileText, href: "/audit" },
    ],
  },
];

// ── Sidebar Component ──
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const width = collapsed ? 72 : 260;

  const [adminUser, setAdminUser] = useState<{ username: string; email: string; rank: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      fetch(buildApiUrl("/v1/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setAdminUser({
              username: data.username || payload.email?.split("@")[0] || "Admin",
              email: data.email || payload.email || "",
              rank: data.rank || "ADMIN",
            });
          } else {
            setAdminUser({
              username: payload.email?.split("@")[0] || "Admin",
              email: payload.email || "",
              rank: "ADMIN",
            });
          }
        })
        .catch(() => {
          setAdminUser({
            username: payload.email?.split("@")[0] || "Admin",
            email: payload.email || "",
            rank: "ADMIN",
          });
        });
    } catch {
      // Invalid token
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  const displayInitial = (adminUser?.username || "A").charAt(0).toUpperCase();

  return (
    <aside
      style={{
        width: `${width}px`,
        height: "100vh",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: collapsed ? "1.25rem 0" : "1.25rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid var(--color-border)",
          minHeight: "64px",
        }}
      >
        {!collapsed && (
          <div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-emerald)",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Praetorian Console
            </h1>
            <p
              style={{
                fontSize: "0.65rem",
                color: "var(--color-text-muted)",
                marginTop: "2px",
                letterSpacing: "0.06em",
                fontWeight: 500,
                textTransform: "uppercase",
              }}
            >
              Emerald Kingdom
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "transparent",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
            borderRadius: "6px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-emerald)";
            e.currentTarget.style.color = "var(--color-emerald)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          padding: collapsed ? "1rem 0.5rem" : "1rem 0.75rem",
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-border) transparent",
        }}
      >
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.5rem",
                  paddingLeft: "0.75rem",
                }}
              >
                {group.label}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                      padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
                      justifyContent: collapsed ? "center" : "flex-start",
                      color: isActive ? "var(--color-ivory)" : "var(--color-text-muted)",
                      textDecoration: "none",
                      fontSize: "0.82rem",
                      fontWeight: isActive ? 600 : 400,
                      borderRadius: "8px",
                      background: isActive ? "var(--color-emerald-glow)" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "rgba(16, 185, 129, 0.15)" : "transparent",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
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
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? "var(--color-emerald)" : "inherit",
                        flexShrink: 0,
                      }}
                    />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer: Dynamic User Info ── */}
      <div style={{ padding: collapsed ? "0.75rem 0.5rem" : "0.75rem", borderTop: "1px solid var(--color-border)" }}>
        <div
          style={{
            padding: collapsed ? "0.6rem 0" : "0.75rem",
            background: "var(--color-bg)",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: collapsed ? "center" : "flex-start",
            flexDirection: collapsed ? "column" : "row",
            justifyContent: collapsed ? "center" : "space-between",
            gap: collapsed ? "4px" : "0",
          }}
        >
          {collapsed ? (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--color-emerald-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-emerald)",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              {displayInitial}
            </div>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                {adminUser ? (
                  <>
                    <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Logged in as</p>
                    <p style={{ color: "var(--color-ivory)", fontSize: "0.82rem", fontWeight: 600, marginTop: "2px" }}>
                      {adminUser.username}
                    </p>
                    <p style={{ color: "var(--color-emerald)", fontSize: "0.7rem", marginTop: "1px" }}>
                      {adminUser.rank}
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Belum login</p>
                )}
              </div>
              {adminUser && (
                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger, #ef4444)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
                >
                  <LogOut size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
