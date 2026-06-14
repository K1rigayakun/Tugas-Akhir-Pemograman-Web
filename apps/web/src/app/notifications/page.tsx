"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { API_URL } from "../../lib/api";
import { Bell, Award, DollarSign, Crown, AlertTriangle, CheckCircle } from "lucide-react";

type Notification = { id: string; type: string; payload: Record<string, unknown>; isRead: boolean; createdAt: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem("accessToken") || "";
  
  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/notifications?unread=${filter === "unread"}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((response) => response.ok ? response.json() : { data: [] })
      .then((result) => {
        setItems(result.data || []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    void load();
  }, [filter]);

  async function readAll() {
    await fetch(`${API_URL}/notifications/read-all`, { method: "PUT", headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "OUTBID": return <AlertTriangle color="var(--color-danger)" size={24} />;
      case "AUCTION_WON": return <Award color="var(--color-gold)" size={24} />;
      case "RANK_UP": return <Crown color="var(--color-emerald)" size={24} />;
      case "GLOBAL_ANNOUNCEMENT": return <Bell color="var(--color-ivory)" size={24} />;
      default: return <Bell color="var(--color-text-muted)" size={24} />;
    }
  };

  const getTitle = (item: Notification) => {
    if (item.type === "OUTBID") return "Seseorang Melewati Penawaran Anda!";
    if (item.type === "AUCTION_WON") return "Lelang Dimenangkan!";
    if (item.type === "RANK_UP") return "Kenaikan Pangkat Kekaisaran!";
    if (item.type === "GLOBAL_ANNOUNCEMENT") return String(item.payload?.title || "Pengumuman Global");
    return item.type.replace(/_/g, " ");
  };

  const getMessage = (item: Notification) => {
    if (item.type === "OUTBID") return `Penawaran Anda sebesar ${item.payload?.previousAmount} CC telah dikalahkan.`;
    if (item.type === "AUCTION_WON") return `Anda berhasil memenangkan lelang dengan harga akhir ${item.payload?.newAmount || item.payload?.amount || 0} CC.`;
    if (item.type === "RANK_UP") return `Pangkat Anda telah naik menjadi ${item.payload?.newRank}. Selamat!`;
    if (item.type === "GLOBAL_ANNOUNCEMENT") return String(item.payload?.message || "");
    return String(item.payload?.message || "Aktivitas baru tercatat di akun Anda.");
  };

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Herald's Scroll" title="Messages Across the Realm" description="Peringatan bid, hasil lelang, kenaikan rank, status KYC, dan keamanan akun." />
      
      <AnimatedSection delay={100}>
        <div className="toolbar" style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className={`tool-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
            <button className={`tool-button ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>Unread</button>
          </div>
          <button 
            onClick={readAll}
            className="primary-action"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)" }}
          >
            <CheckCircle size={16} /> Mark all read
          </button>
        </div>
      </AnimatedSection>
      
      <AnimatedSection staggerChildren staggerSelector=".notification-item" delay={200}>
        <section className="notification-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Menggulir perkamen...</p>
          ) : !items.length ? (
            <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed var(--color-border)" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: "1.2rem", fontFamily: "var(--font-cinzel)" }}>Belum ada pesan yang dibawa oleh gagak pembawa pesan.</p>
            </div>
          ) : (
            items.map((item) => (
              <article 
                key={item.id} 
                className={`panel notification-item ${item.isRead ? "" : "unread"}`}
                style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "1.5rem",
                  padding: "1.5rem",
                  borderLeft: item.isRead ? "4px solid transparent" : "4px solid var(--color-gold)",
                  background: item.isRead ? "rgba(255,255,255,0.02)" : "rgba(212,175,55,0.05)",
                  opacity: item.isRead ? 0.7 : 1
                }}
              >
                <div style={{ padding: "1rem", background: "rgba(0,0,0,0.5)", borderRadius: "50%" }}>
                  {getIcon(item.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: "1.2rem", marginBottom: "0.5rem", color: item.isRead ? "var(--color-text-muted)" : "var(--color-ivory)" }}>
                    {getTitle(item)}
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", lineHeight: "1.6" }}>
                    {getMessage(item)}
                  </p>
                  <span style={{ display: "block", marginTop: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </article>
            ))
          )}
        </section>
      </AnimatedSection>
    </main>
  );
}
