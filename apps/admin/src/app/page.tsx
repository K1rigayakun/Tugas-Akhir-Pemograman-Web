"use client";

import { useState, useEffect } from "react";

/**
 * Admin Dashboard — The Praetorian Console
 *
 * Halaman utama admin panel yang menampilkan:
 * - Statistik platform real-time
 * - Fraud alerts
 * - Quick actions (KYC review, auction management)
 * - Sidebar navigasi
 */

// ============================================================
// Types
// ============================================================

interface DashboardStats {
  activeUsers: number;
  activeAuctions: number;
  totalTopUpToday: number;
  totalBidsToday: number;
  pendingKYC: number;
}

interface FraudAlert {
  type: string;
  userId: string;
  detail: string;
}

// ============================================================
// Stat Card Component
// ============================================================

function StatCard({
  label,
  value,
  icon,
  trend,
  color = "gold",
}: {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: "gold" | "green" | "blue" | "red";
}) {
  const colorMap = {
    gold: "rgba(201, 168, 76, 0.15)",
    green: "rgba(34, 197, 94, 0.15)",
    blue: "rgba(59, 130, 246, 0.15)",
    red: "rgba(239, 68, 68, 0.15)",
  };

  const borderMap = {
    gold: "#c9a84c",
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
  };

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: `1px solid var(--color-border)`,
        borderRadius: "12px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = borderMap[color];
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: colorMap[color],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: borderMap[color],
        }}
      >
        {value}
      </p>
      {trend && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            marginTop: "0.25rem",
          }}
        >
          {trend}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Sidebar Component
// ============================================================

function Sidebar({ active }: { active: string }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "\u2302" },
    { id: "users", label: "Kelola User", icon: "\u263A" },
    { id: "auctions", label: "Kelola Lelang", icon: "\u2694" },
    { id: "kyc", label: "Review KYC", icon: "\u2611" },
    { id: "museum", label: "Museum", icon: "\u2605" },
    { id: "events", label: "Events", icon: "\u2600" },
    { id: "audit", label: "Audit Log", icon: "\u2630" },
    { id: "fraud", label: "Fraud Alerts", icon: "\u26A0" },
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
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "1.1rem",
            color: "var(--color-gold)",
            letterSpacing: "0.05em",
          }}
        >
          Praetorian Console
        </h1>
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--color-text-muted)",
            marginTop: "0.25rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Emerald Kingdom Admin
        </p>
      </div>

      {/* Nav */}
      <nav>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.5rem",
              color:
                active === item.id ? "var(--color-gold)" : "var(--color-text-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              borderLeft:
                active === item.id
                  ? "3px solid var(--color-gold)"
                  : "3px solid transparent",
              background:
                active === item.id ? "var(--color-gold-dim)" : "transparent",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "1.1rem", width: "20px", textAlign: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Admin Info */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "1.5rem",
          right: "1.5rem",
          padding: "1rem",
          background: "rgba(201, 168, 76, 0.08)",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "var(--color-ivory)" }}>
          TheEmperor
        </p>
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
          SUPER_ADMIN
        </p>
      </div>
    </aside>
  );
}

// ============================================================
// Alert Card Component
// ============================================================

function AlertCard({ alert }: { alert: FraudAlert }) {
  const typeColors: Record<string, string> = {
    RAPID_BIDDING: "#ef4444",
    HIGH_WIN_RATE: "#f59e0b",
  };

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${typeColors[alert.type] || "var(--color-border)"}`,
        borderRadius: "8px",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: typeColors[alert.type] || "var(--color-warning)",
          boxShadow: `0 0 8px ${typeColors[alert.type] || "var(--color-warning)"}`,
          animation: "pulse 2s infinite",
        }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>
          {alert.type.replace("_", " ")}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          User: {alert.userId.slice(0, 8)}... — {alert.detail}
        </p>
      </div>
      <button
        style={{
          padding: "0.4rem 0.75rem",
          fontSize: "0.75rem",
          background: "transparent",
          border: `1px solid ${typeColors[alert.type]}`,
          color: typeColors[alert.type],
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Investigasi
      </button>
    </div>
  );
}

// ============================================================
// Quick Actions Table
// ============================================================

function KYCTable() {
  const mockData = [
    { id: "kyc_1", user: "SirLancelot", email: "knight@demo.id", status: "PENDING", date: "30 Mei 2026" },
    { id: "kyc_2", user: "BaronVonDuke", email: "baron@demo.id", status: "PENDING", date: "29 Mei 2026" },
    { id: "kyc_3", user: "NewCivis", email: "civis@demo.id", status: "PENDING", date: "28 Mei 2026" },
  ];

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "1rem",
            color: "var(--color-gold)",
          }}
        >
          KYC Menunggu Review
        </h3>
        <span
          style={{
            background: "rgba(245, 158, 11, 0.15)",
            color: "#f59e0b",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {mockData.length} pending
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["User", "Email", "Tanggal", "Aksi"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockData.map((row) => (
            <tr
              key={row.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLTableRowElement).style.background =
                  "var(--color-surface-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
              }
            >
              <td style={{ padding: "0.75rem 1.5rem", fontSize: "0.85rem" }}>
                {row.user}
              </td>
              <td
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {row.email}
              </td>
              <td
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {row.date}
              </td>
              <td style={{ padding: "0.75rem 1.5rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "1px solid #22c55e",
                      color: "#22c55e",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Main Dashboard Page
// ============================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 127,
    activeAuctions: 23,
    totalTopUpToday: 1250000,
    totalBidsToday: 342,
    pendingKYC: 3,
  });

  const [alerts] = useState<FraudAlert[]>([
    {
      type: "RAPID_BIDDING",
      userId: "clx123abc",
      detail: "8 bid dalam 1 menit terakhir",
    },
    {
      type: "HIGH_WIN_RATE",
      userId: "clx456def",
      detail: "12 kemenangan dalam 7 hari terakhir",
    },
  ]);

  const formatCC = (amount: number) => {
    return `\u265B ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="dashboard" />

      {/* Main Content */}
      <main
        style={{
          marginLeft: "260px",
          flex: 1,
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.5rem",
              color: "var(--color-ivory)",
            }}
          >
            Dashboard
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Statistik platform hari ini —{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            label="User Aktif"
            value={stats.activeUsers}
            icon={"\u263A"}
            color="blue"
            trend="hari ini"
          />
          <StatCard
            label="Lelang Aktif"
            value={stats.activeAuctions}
            icon={"\u2694"}
            color="gold"
          />
          <StatCard
            label="Top Up Hari Ini"
            value={formatCC(stats.totalTopUpToday)}
            icon={"\u265B"}
            color="green"
          />
          <StatCard
            label="Total Bid"
            value={stats.totalBidsToday}
            icon={"\u2191"}
            color="blue"
          />
          <StatCard
            label="KYC Pending"
            value={stats.pendingKYC}
            icon={"\u2611"}
            color={stats.pendingKYC > 0 ? "red" : "green"}
          />
        </div>

        {/* 7-Day Activity Chart */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1rem",
              color: "var(--color-gold)",
              marginBottom: "1.25rem",
            }}
          >
            Aktivitas Platform — 7 Hari Terakhir
          </h3>

          {/* Chart Legend */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginBottom: "1rem",
              fontSize: "0.75rem",
            }}
          >
            {[
              { label: "Bids", color: "#c9a84c" },
              { label: "Top Up (x1000)", color: "#22c55e" },
              { label: "User Baru", color: "#3b82f6" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: item.color,
                  }}
                />
                <span style={{ color: "var(--color-text-muted)" }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.5rem",
              height: "160px",
              paddingTop: "0.5rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {[
              { day: "Sen", bids: 45, topUp: 12, users: 3 },
              { day: "Sel", bids: 67, topUp: 25, users: 5 },
              { day: "Rab", bids: 38, topUp: 8, users: 2 },
              { day: "Kam", bids: 89, topUp: 32, users: 7 },
              { day: "Jum", bids: 55, topUp: 18, users: 4 },
              { day: "Sab", bids: 95, topUp: 45, users: 8 },
              { day: "Min", bids: 72, topUp: 28, users: 6 },
            ].map((d) => {
              const maxVal = 100;
              return (
                <div
                  key={d.day}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "100%" }}>
                    {/* Bids bar */}
                    <div
                      style={{
                        width: "14px",
                        height: `${(d.bids / maxVal) * 100}%`,
                        background: "linear-gradient(to top, #c9a84c, #e8d48b)",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.5s ease",
                        minHeight: "4px",
                      }}
                      title={`${d.bids} bids`}
                    />
                    {/* TopUp bar */}
                    <div
                      style={{
                        width: "14px",
                        height: `${(d.topUp / 50) * 100}%`,
                        background: "linear-gradient(to top, #22c55e, #86efac)",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.5s ease",
                        minHeight: "4px",
                      }}
                      title={`${d.topUp}k top up`}
                    />
                    {/* Users bar */}
                    <div
                      style={{
                        width: "14px",
                        height: `${(d.users / 10) * 100}%`,
                        background: "linear-gradient(to top, #3b82f6, #93c5fd)",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.5s ease",
                        minHeight: "4px",
                      }}
                      title={`${d.users} user baru`}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Fraud Alerts */}
          <div>
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "1rem",
                color: "var(--color-gold)",
                marginBottom: "1rem",
              }}
            >
              Fraud Alerts
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {alerts.length > 0 ? (
                alerts.map((alert, i) => <AlertCard key={i} alert={alert} />)
              ) : (
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                    padding: "2rem",
                    textAlign: "center",
                    background: "var(--color-surface)",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  Tidak ada alert aktif
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "1rem",
                color: "var(--color-gold)",
                marginBottom: "1rem",
              }}
            >
              Aktivitas Terakhir
            </h3>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                padding: "1.25rem",
              }}
            >
              {[
                { time: "2 menit lalu", action: "SirLancelot bid \u265B12,500 di Dragon Shield", color: "var(--color-info)" },
                { time: "5 menit lalu", action: "KYC BaronVonDuke disetujui", color: "var(--color-success)" },
                { time: "12 menit lalu", action: "Event 'Grand Coronation' diaktifkan", color: "var(--color-gold)" },
                { time: "1 jam lalu", action: "Lelang 'Royal Crown' dijadwalkan", color: "var(--color-text-muted)" },
                { time: "3 jam lalu", action: "NewCivis mendaftar", color: "var(--color-info)" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.6rem 0",
                    borderBottom:
                      i < 4 ? "1px solid var(--color-border)" : "none",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: item.color,
                      marginTop: "0.5rem",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontSize: "0.85rem" }}>{item.action}</p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KYC Table */}
        <KYCTable />
      </main>
    </div>
  );
}
