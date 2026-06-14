"use client";

import { useState, useEffect } from "react";
import { Check, X, Search, Loader2 } from "lucide-react";
import { fetchWithAuth } from "../../lib/api";

export default function VaultOfferingsPage() {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOfferings = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/vault-offerings");
      const data = await res.json();
      if (res.ok) {
        setOfferings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  const handleReview = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    const adminNotes = prompt(`Masukkan catatan admin untuk status ${status}:`);
    if (adminNotes === null) return; // Cancelled

    try {
      const res = await fetchWithAuth(`/v1/admin/vault-offerings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) {
        fetchOfferings();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengubah status");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-ivory)", letterSpacing: "-0.02em" }}>
          Vault Offerings
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Review pengajuan barang Vault dari user
        </p>
      </div>

      <div className="glass-panel" style={{ overflow: "hidden", minHeight: "300px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <Loader2 className="animate-spin" color="var(--color-emerald)" size={32} />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Item", "User", "Tipe", "Status", "Aksi"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "1rem 1.5rem",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-text-muted)",
                      borderBottom: "1px solid var(--color-border)",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offerings.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <p style={{ fontWeight: 600, color: "var(--color-ivory)", fontSize: "0.9rem" }}>{row.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      Cerita: {row.story.substring(0, 50)}...
                    </p>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <p style={{ fontWeight: 600, color: "var(--color-ivory)", fontSize: "0.85rem" }}>{row.user?.username}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-emerald)" }}>{row.user?.rank}</p>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{row.auctionType}</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ 
                      fontSize: "0.75rem", fontWeight: 600,
                      color: row.status === "PENDING" ? "var(--color-warning)" : 
                             row.status === "ACCEPTED" ? "var(--color-success)" : "var(--color-danger)"
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    {row.status === "PENDING" && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleReview(row.id, "ACCEPTED")}
                          title="Terima"
                          style={{
                            padding: "0.35rem 0.5rem",
                            background: "rgba(34, 197, 94, 0.15)",
                            border: "1px solid rgba(34, 197, 94, 0.5)",
                            color: "var(--color-success)",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReview(row.id, "REJECTED")}
                          title="Tolak"
                          style={{
                            padding: "0.35rem 0.5rem",
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.5)",
                            color: "var(--color-danger)",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {offerings.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                    Tidak ada data vault offering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
