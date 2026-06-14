"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { API_URL } from "../../../lib/api";
import { Check, X, Clock, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/vault-offerings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });
      const data = await res.json();
      if (data.data) {
        setSubmissions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    const notes = prompt(`Masukkan catatan untuk ${status === 'APPROVED' ? 'Persetujuan' : 'Penolakan'}:`);
    if (notes === null) return; // User cancelled

    try {
      const res = await fetch(`${API_URL}/admin/vault-offerings/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
        },
        body: JSON.stringify({ status, adminNotes: notes })
      });
      
      if (res.ok) {
        alert("Status berhasil diperbarui.");
        fetchSubmissions();
      } else {
        alert("Gagal memperbarui status.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "APPROVED") return "var(--color-emerald)";
    if (status === "REJECTED") return "var(--color-danger)";
    return "var(--color-gold)";
  };

  return (
    <main className="page-wrap">
      <PageHeading 
        eyebrow="Praetorian Console" 
        title="Penyelesaian Relik" 
        description="Tinjau, nilai, dan setujui pengajuan barang lelang dari warga kekaisaran." 
      />

      <AnimatedSection delay={100}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "var(--font-cinzel)", color: "var(--color-gold)" }}>Daftar Antrean</h2>
            <Link href="/admin" style={{ color: "var(--color-text-muted)", textDecoration: "underline" }}>Kembali ke Dashboard Admin</Link>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Memuat data pengajuan...</p>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--color-border)", borderRadius: "12px" }}>
              <p style={{ color: "var(--color-text-muted)" }}>Belum ada pengajuan relik saat ini.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {submissions.map(sub => (
                <div key={sub.id} className="panel" style={{ display: "flex", gap: "1.5rem", padding: "1.5rem" }}>
                  <div style={{ width: "120px", height: "120px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                    {sub.imageUrls && sub.imageUrls.length > 0 ? (
                      <img src={sub.imageUrls[0]} alt="Relic" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>No Image</div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: "1.3rem", color: "var(--color-ivory)", marginBottom: "0.25rem" }}>{sub.title}</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                          Diajukan oleh: <span style={{ color: "var(--color-gold)" }}>{sub.user?.username || "Unknown"}</span> ({sub.user?.rank || "CIVIS"})
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.8rem", borderRadius: "4px", border: `1px solid ${getStatusColor(sub.status)}`, background: "rgba(0,0,0,0.3)" }}>
                        {sub.status === "PENDING" && <Clock size={16} color={getStatusColor(sub.status)} />}
                        {sub.status === "APPROVED" && <Check size={16} color={getStatusColor(sub.status)} />}
                        {sub.status === "REJECTED" && <X size={16} color={getStatusColor(sub.status)} />}
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: getStatusColor(sub.status) }}>{sub.status}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem", fontSize: "0.9rem" }}>
                      <div>
                        <p style={{ color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Rarity</p>
                        <p style={{ color: "var(--color-ivory)" }}>{sub.rarity}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Harga Awal Harapan</p>
                        <p style={{ color: "var(--color-gold)", fontWeight: "bold" }}>{sub.startingPrice} CC</p>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "1rem" }}>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontStyle: "italic", lineHeight: 1.5 }}>"{sub.description}"</p>
                    </div>

                    {sub.status === "PENDING" && (
                      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <button 
                          onClick={() => handleReview(sub.id, "APPROVED")}
                          style={{ flex: 1, padding: "0.8rem", background: "var(--color-emerald)", color: "#000", fontWeight: "bold", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", border: "none" }}
                        >
                          <Check size={18} /> Setujui
                        </button>
                        <button 
                          onClick={() => handleReview(sub.id, "REJECTED")}
                          style={{ flex: 1, padding: "0.8rem", background: "transparent", color: "var(--color-danger)", border: "1px solid var(--color-danger)", fontWeight: "bold", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}
                        >
                          <X size={18} /> Tolak
                        </button>
                      </div>
                    )}
                    
                    {sub.adminNotes && (
                      <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "4px", borderLeft: `3px solid ${getStatusColor(sub.status)}` }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Catatan Admin: <span style={{ color: "var(--color-ivory)" }}>{sub.adminNotes}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
    </main>
  );
}
