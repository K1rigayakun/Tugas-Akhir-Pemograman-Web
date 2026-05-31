"use client";

/**
 * Audit Log — Admin Panel
 * Tampilan read-only semua aksi admin. Tidak bisa difilter atau disembunyikan.
 */

function Sidebar({ active }: { active: string }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "\u2302", href: "/" },
    { id: "users", label: "Kelola User", icon: "\u263A", href: "/users" },
    { id: "auctions", label: "Kelola Lelang", icon: "\u2694", href: "/auctions" },
    { id: "kyc", label: "Review KYC", icon: "\u2611", href: "/kyc" },
    { id: "museum", label: "Museum", icon: "\u2605", href: "/museum" },
    { id: "events", label: "Events", icon: "\u2600", href: "/events" },
    { id: "audit", label: "Audit Log", icon: "\u2630", href: "/audit" },
  ];
  return (
    <aside style={{ width: "260px", minHeight: "100vh", background: "var(--color-surface)", borderRight: "1px solid var(--color-border)", padding: "1.5rem 0", position: "fixed", left: 0, top: 0 }}>
      <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", color: "var(--color-gold)" }}>Praetorian Console</h1>
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.25rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Emerald Kingdom Admin</p>
      </div>
      <nav>{menuItems.map((item) => (<a key={item.id} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem", color: active === item.id ? "var(--color-gold)" : "var(--color-text-muted)", textDecoration: "none", fontSize: "0.9rem", borderLeft: active === item.id ? "3px solid var(--color-gold)" : "3px solid transparent", background: active === item.id ? "var(--color-gold-dim)" : "transparent" }}><span style={{ fontSize: "1.1rem", width: "20px", textAlign: "center" }}>{item.icon}</span>{item.label}</a>))}</nav>
    </aside>
  );
}

const mockLogs = [
  { id: "log1", admin: "TheEmperor", action: "START_LIVE_AUCTION", targetType: "AUCTION", targetId: "auc1", details: { title: "Dragon Shield" }, ipAddress: "103.145.200.10", timestamp: "2026-05-30T16:30:00Z" },
  { id: "log2", admin: "KYCOfficer", action: "APPROVE_KYC", targetType: "KYC", targetId: "kyc2", details: { username: "BaronVonDuke" }, ipAddress: "103.145.200.11", timestamp: "2026-05-30T16:15:00Z" },
  { id: "log3", admin: "TheEmperor", action: "SUSPEND_USER", targetType: "USER", targetId: "clx4", details: { username: "MarquisDeSade", reason: "Rapid bidding detected", durationDays: 7 }, ipAddress: "103.145.200.10", timestamp: "2026-05-30T15:45:00Z" },
  { id: "log4", admin: "AuctionMaster", action: "CANCEL_AUCTION", targetType: "AUCTION", targetId: "auc7", details: { title: "Cursed Amulet", reason: "Item deskripsi tidak valid" }, ipAddress: "103.145.200.12", timestamp: "2026-05-30T14:00:00Z" },
  { id: "log5", admin: "TheEmperor", action: "CREATE_EVENT", targetType: "EVENT", targetId: "evt1", details: { name: "The Grand Coronation", expMultiplier: 2.0 }, ipAddress: "103.145.200.10", timestamp: "2026-05-30T10:00:00Z" },
  { id: "log6", admin: "TheEmperor", action: "CURATE_MUSEUM", targetType: "AUCTION", targetId: "auc6", details: { title: "Golden Throne Miniature" }, ipAddress: "103.145.200.10", timestamp: "2026-05-29T18:00:00Z" },
  { id: "log7", admin: "KYCOfficer", action: "REJECT_KYC", targetType: "KYC", targetId: "kyc5", details: { username: "FakeUser", notes: "Foto KTP blur, tidak bisa diverifikasi" }, ipAddress: "103.145.200.11", timestamp: "2026-05-29T15:30:00Z" },
  { id: "log8", admin: "TheEmperor", action: "BAN_FROM_AUCTION", targetType: "USER", targetId: "clx9", details: { username: "BotAccount1", reason: "Automated bidding detected" }, ipAddress: "103.145.200.10", timestamp: "2026-05-29T12:00:00Z" },
];

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    START_LIVE_AUCTION: "#22c55e", END_LIVE_AUCTION: "#8a8a9a",
    APPROVE_KYC: "#22c55e", REJECT_KYC: "#ef4444",
    SUSPEND_USER: "#f59e0b", BAN_FROM_AUCTION: "#ef4444", BAN_PERMANENT: "#dc2626",
    WARN_USER: "#f59e0b",
    CANCEL_AUCTION: "#ef4444",
    CREATE_EVENT: "#3b82f6", ACTIVATE_EVENT: "#22c55e", END_EVENT: "#8a8a9a",
    CURATE_MUSEUM: "#8b5cf6",
  };
  return (
    <span style={{
      padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700,
      fontFamily: "'Orbitron', monospace", letterSpacing: "0.05em",
      background: `${colors[action] || "#666"}15`, color: colors[action] || "#666",
    }}>
      {action}
    </span>
  );
}

export default function AuditPage() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="audit" />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Audit Log</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Catatan semua aksi admin — read-only, append-only, tidak bisa diubah atau dihapus
          </p>
        </div>

        {/* Immutability Notice */}
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <span style={{ fontSize: "1.2rem" }}>{"\u26A0"}</span>
          <p style={{ fontSize: "0.8rem", color: "#f59e0b" }}>
            Audit log dilindungi oleh database constraint. Data ini tidak bisa diedit, difilter, atau dihapus oleh siapapun — termasuk Super Admin.
          </p>
        </div>

        {/* Log Table */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Waktu", "Admin", "Aksi", "Target", "Detail", "IP Address"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)",
                    background: "rgba(0,0,0,0.2)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(log.timestamp).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600 }}>{log.admin}</td>
                  <td style={{ padding: "0.75rem 1rem" }}><ActionBadge action={log.action} /></td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {log.targetType}:{log.targetId.slice(0, 8)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {JSON.stringify(log.details)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Menampilkan 1-8 dari 156 log</p>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {[1, 2, 3, "...", 20].map((p, i) => (
                <button key={i} style={{
                  width: "32px", height: "32px", borderRadius: "6px", fontSize: "0.8rem",
                  background: p === 1 ? "var(--color-gold-dim)" : "transparent",
                  border: `1px solid ${p === 1 ? "var(--color-gold)" : "var(--color-border)"}`,
                  color: p === 1 ? "var(--color-gold)" : "var(--color-text-muted)",
                  cursor: typeof p === "number" ? "pointer" : "default",
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
