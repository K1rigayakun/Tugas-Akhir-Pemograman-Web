"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import {
  Radio,
  Play,
  Pause,
  Square,
  Users,
  Clock,
  Gavel,
  Eye,
  Loader2,
  Plus,
  ChevronRight,
  Timer,
} from "lucide-react";

/**
 * Admin Live Control Panel
 * Mengelola sesi live auction: start/pause/end, lihat penonton, antrian item.
 */

interface LiveAuction {
  id: string;
  title: string;
  status: string;
  auctionType: string;
  currentPrice: number;
  startTime: string;
  endTime: string;
  category?: string;
  imageUrls?: string[];
  _count?: { bids: number };
}

export default function LiveControlPage() {
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAuction, setActiveAuction] = useState<LiveAuction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadLiveAuctions = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/auctions?page=1");
      const data = await res.json();
      if (res.ok) {
        const allAuctions = data.data || [];
        // Filter hanya auction tipe LIVE
        const liveAuctions = allAuctions.filter(
          (a: any) => a.auctionType === "LIVE"
        );
        setAuctions(liveAuctions);
        // Auto-select yang sedang aktif
        const active = liveAuctions.find(
          (a: any) => a.status === "ACTIVE" || a.status === "ENDING"
        );
        if (active) setActiveAuction(active);
      }
    } catch (err) {
      console.error("Failed to load live auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveAuctions();
  }, []);

  const handleAction = async (
    auctionId: string,
    action: "start" | "end"
  ) => {
    setActionLoading(action);
    try {
      const res = await fetchWithAuth(
        `/v1/live-auction/${auctionId}/${action}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || `Gagal ${action} live auction`);
      } else {
        alert(`Live auction berhasil di-${action}.`);
        loadLiveAuctions();
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "ENDING":
        return "#ef4444";
      case "UPCOMING":
        return "#f59e0b";
      case "ENDED":
      case "CANCELLED":
        return "#6b7280";
      default:
        return "var(--color-text-muted)";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "LIVE NOW";
      case "ENDING":
        return "ENDING SOON";
      case "UPCOMING":
        return "AKAN DIMULAI";
      case "ENDED":
        return "SELESAI";
      case "CANCELLED":
        return "DIBATALKAN";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Loader2 className="animate-spin" size={32} color="var(--color-gold)" />
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
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <Radio size={24} color="#ef4444" />
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.5rem",
              color: "var(--color-ivory)",
            }}
          >
            Live Control Panel
          </h2>
        </div>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.85rem",
          }}
        >
          Kelola sesi live auction: mulai, jeda, atau akhiri siaran langsung.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: activeAuction ? "1fr 380px" : "1fr",
          gap: "2rem",
        }}
      >
        {/* Daftar Live Auction */}
        <div>
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            Antrian Lelang Live ({auctions.length})
          </h3>

          {auctions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--color-text-muted)",
                border: "1px dashed var(--color-border)",
                borderRadius: "12px",
              }}
            >
              <Radio
                size={48}
                style={{ marginBottom: "1rem", opacity: 0.3 }}
              />
              <p>
                Belum ada lelang bertipe LIVE. Buat lelang baru dengan tipe
                &quot;LIVE&quot; di halaman Kelola Lelang.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {auctions.map((auction) => {
                const isActive =
                  auction.status === "ACTIVE" || auction.status === "ENDING";
                const isSelected = activeAuction?.id === auction.id;

                return (
                  <button
                    key={auction.id}
                    type="button"
                    onClick={() => setActiveAuction(auction)}
                    style={{
                      background: isSelected
                        ? "rgba(16, 185, 129, 0.08)"
                        : "var(--color-surface)",
                      border: `1px solid ${isSelected ? "var(--color-emerald)" : "var(--color-border)"}`,
                      borderRadius: "12px",
                      padding: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "left",
                      width: "100%",
                      color: "inherit",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#1a1a1a",
                      }}
                    >
                      {auction.imageUrls?.[0] ? (
                        <img
                          src={auction.imageUrls[0]}
                          alt={auction.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Gavel size={24} color="var(--color-text-muted)" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {isActive && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "#ef4444",
                              display: "inline-block",
                              animation: "pulse 1.5s infinite",
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "var(--color-ivory)",
                          }}
                        >
                          {auction.title}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        <span>
                          {auction.currentPrice.toLocaleString("id-ID")} CC
                        </span>
                        <span>{auction.category || "—"}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: `${getStatusColor(auction.status)}22`,
                        color: getStatusColor(auction.status),
                        border: `1px solid ${getStatusColor(auction.status)}44`,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {getStatusLabel(auction.status)}
                    </span>

                    <ChevronRight
                      size={16}
                      color="var(--color-text-muted)"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel Kontrol (Kanan) */}
        {activeAuction && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "1.5rem",
              position: "sticky",
              top: "2rem",
              alignSelf: "start",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "1.1rem",
                color: "var(--color-ivory)",
                marginBottom: "0.25rem",
              }}
            >
              {activeAuction.title}
            </h3>
            <span
              style={{
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: `${getStatusColor(activeAuction.status)}22`,
                color: getStatusColor(activeAuction.status),
              }}
            >
              {getStatusLabel(activeAuction.status)}
            </span>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "1rem",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <Gavel
                  size={18}
                  color="var(--color-gold)"
                  style={{ marginBottom: "0.5rem" }}
                />
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--color-gold)",
                  }}
                >
                  {activeAuction.currentPrice.toLocaleString("id-ID")}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Crown Coins
                </div>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "1rem",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <Clock
                  size={18}
                  color="var(--color-emerald)"
                  style={{ marginBottom: "0.5rem" }}
                />
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--color-ivory)",
                  }}
                >
                  {new Date(activeAuction.endTime).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Berakhir
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              {activeAuction.status === "UPCOMING" && (
                <button
                  type="button"
                  onClick={() => handleAction(activeAuction.id, "start")}
                  disabled={actionLoading === "start"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.9rem",
                    background:
                      "linear-gradient(135deg, #059669, #10b981)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  {actionLoading === "start" ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                  Mulai Live Sekarang
                </button>
              )}

              {(activeAuction.status === "ACTIVE" ||
                activeAuction.status === "ENDING") && (
                <button
                  type="button"
                  onClick={() => handleAction(activeAuction.id, "end")}
                  disabled={actionLoading === "end"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.9rem",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "10px",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  {actionLoading === "end" ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                  Akhiri Live Auction
                </button>
              )}
            </div>

            {/* Info */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(245, 158, 11, 0.05)",
                border: "1px solid rgba(245, 158, 11, 0.15)",
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--color-gold)" }}>Info:</strong>{" "}
              Saat menekan &quot;Mulai Live&quot;, status auction akan berubah
              menjadi ACTIVE dan penonton dapat mulai masuk ke room. Pastikan
              host sudah siap sebelum memulai.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
