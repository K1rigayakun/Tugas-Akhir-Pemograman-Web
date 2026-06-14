"use client";

import { useState, useEffect } from "react";
import { Users, Gavel, Coins, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import { fetchWithAuth } from "../lib/api";

/**
 * Admin Dashboard — The Praetorian Console
 */

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
  icon: Icon,
  trend,
  color = "emerald",
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: "emerald" | "green" | "blue" | "red";
}) {
  const colorMap = {
    emerald: "var(--color-emerald)",
    green: "var(--color-success)",
    blue: "var(--color-info)",
    red: "var(--color-danger)",
  };

  const bgMap = {
    emerald: "var(--color-emerald-glow)",
    green: "rgba(34, 197, 94, 0.15)",
    blue: "rgba(59, 130, 246, 0.15)",
    red: "rgba(239, 68, 68, 0.15)",
  };

  return (
    <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: bgMap[color],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colorMap[color],
        }}
      >
        <Icon size={20} />
      </div>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: colorMap[color],
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
// Alert Card Component
// ============================================================

function AlertCard({ alert }: { alert: FraudAlert }) {
  const isHighRisk = alert.type === "RAPID_BIDDING";

  return (
    <div
      className="glass-panel"
      style={{
        border: `1px solid ${isHighRisk ? "var(--color-danger)" : "var(--color-border)"}`,
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        background: isHighRisk ? "rgba(239,68,68,0.05)" : "var(--color-surface)",
      }}
    >
      <div
        style={{
          color: isHighRisk ? "var(--color-danger)" : "var(--color-warning)",
        }}
      >
        <ShieldAlert size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-ivory)" }}>
          {alert.type.replace("_", " ")}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          User: <span style={{ fontFamily: "monospace" }}>{alert.userId.slice(0, 8)}...</span> — {alert.detail}
        </p>
      </div>
      <button
        style={{
          padding: "0.4rem 0.8rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: "transparent",
          border: `1px solid ${isHighRisk ? "var(--color-danger)" : "var(--color-warning)"}`,
          color: isHighRisk ? "var(--color-danger)" : "var(--color-warning)",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isHighRisk ? "var(--color-danger)" : "var(--color-warning)";
          e.currentTarget.style.color = "#000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = isHighRisk ? "var(--color-danger)" : "var(--color-warning)";
        }}
      >
        Investigasi
      </button>
    </div>
  );
}

// ============================================================
// Main Dashboard Page
// ============================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          fetchWithAuth("/v1/admin/dashboard/stats"),
          fetchWithAuth("/v1/admin/fraud-alerts"),
        ]);

        if (!statsRes.ok) throw new Error("Gagal mengambil data statistik");
        if (!alertsRes.ok) throw new Error("Gagal mengambil data fraud alerts");

        const statsData = await statsRes.json();
        const alertsData = await alertsRes.json();

        setStats(statsData.data || {
          activeUsers: 0, activeAuctions: 0, totalTopUpToday: 0, totalBidsToday: 0, pendingKYC: 0
        });
        setAlerts(alertsData.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const formatCC = (amount: number) => {
    return `${amount.toLocaleString("id-ID")} CC`;
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "var(--color-emerald)", fontSize: "1.1rem" }}>Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <main
      style={{
        padding: "2.5rem",
        minHeight: "100vh",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--color-ivory)",
            letterSpacing: "-0.02em"
          }}
        >
          Dashboard Overview
        </h2>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
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
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <StatCard
          label="User Aktif"
          value={stats?.activeUsers || 0}
          icon={Users}
          color="blue"
          trend="hari ini"
        />
        <StatCard
          label="Lelang Aktif"
          value={stats?.activeAuctions || 0}
          icon={Gavel}
          color="emerald"
        />
        <StatCard
          label="Top Up Hari Ini"
          value={formatCC(stats?.totalTopUpToday || 0)}
          icon={Coins}
          color="green"
        />
        <StatCard
          label="Total Bid"
          value={stats?.totalBidsToday || 0}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Activity Chart Placeholder (Left Column) */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ivory)", marginBottom: "1.5rem" }}>
            Aktivitas Platform — 7 Hari Terakhir
          </h3>
          <div style={{ height: "300px", display: "flex", alignItems: "flex-end", gap: "10px", marginTop: "2rem" }}>
            {/* Dummy Bars */}
            {[40, 70, 50, 90, 60, 100, 80].map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", justifyContent: "flex-end" }}>
                <div style={{ background: "var(--color-emerald)", height: `${h}%`, width: "100%", borderRadius: "4px 4px 0 0", opacity: 0.8 }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fraud Alerts & Pending KYC */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Fraud Alerts Section */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <AlertTriangle size={20} color="var(--color-danger)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ivory)" }}>
                Fraud Alerts Aktif
              </h3>
            </div>
            
            {alerts.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>
                Platform aman. Tidak ada indikasi fraud.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {alerts.map((alert, i) => (
                  <AlertCard key={i} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {/* Pending KYC Section */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ivory)" }}>
                Pending KYC
              </h3>
              <span style={{ 
                background: stats && stats.pendingKYC > 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                color: stats && stats.pendingKYC > 0 ? "var(--color-danger)" : "var(--color-success)",
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 700
              }}>
                {stats?.pendingKYC || 0} Antrian
              </span>
            </div>
            
            <button 
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--color-emerald)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#0d9488"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-emerald)"}
            >
              <CheckCircle size={18} />
              Review Pengajuan Sekarang
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
