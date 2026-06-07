"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

/**
 * Review KYC — Admin Panel
 */

export default function KYCPage() {
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selected, setSelected] = useState<any | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadKYC = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/kyc/pending");
      const data = await res.json();
      if (res.ok) {
        setKycQueue(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKYC();
  }, []);

  const handleApprove = async () => {
    if (!selected) return;
    setIsProcessing(true);
    setError("");
    try {
      const res = await fetchWithAuth(`/v1/admin/kyc/${selected.id}/approve`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyetujui KYC");
      
      setSelected(null);
      loadKYC();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!showRejectForm) {
      setShowRejectForm(true);
      return;
    }
    
    setIsProcessing(true);
    setError("");
    try {
      const res = await fetchWithAuth(`/v1/admin/kyc/${selected.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes: rejectNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menolak KYC");
      
      setSelected(null);
      setShowRejectForm(false);
      setRejectNotes("");
      loadKYC();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Review KYC</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Verifikasi identitas user — {kycQueue.length} pengajuan menunggu
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
          {/* Queue List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {kycQueue.map((kyc) => (
              <div key={kyc.id} onClick={() => { setSelected(kyc); setShowRejectForm(false); setError(""); }}
                style={{
                  background: selected?.id === kyc.id ? "var(--color-gold-dim)" : "var(--color-surface)",
                  border: `1px solid ${selected?.id === kyc.id ? "var(--color-gold)" : "var(--color-border)"}`,
                  borderRadius: "10px", padding: "1rem 1.25rem", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{kyc.user?.username || "Unknown"}</span>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>PENDING</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{kyc.user?.email || "Unknown"}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {kyc.city}, {kyc.province} \u2014 {new Date(kyc.submittedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))}
            {kycQueue.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)", borderRadius: "12px" }}>
                Tidak ada pengajuan KYC yang pending.
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1.25rem" }}>
                Detail KYC — {selected.user?.username}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Nama Lengkap", value: selected.fullName },
                  { label: "NIK", value: selected.nationalId },
                  { label: "Email", value: selected.user?.email },
                  { label: "Kota", value: `${selected.city}, ${selected.province}` },
                ].map((field) => (
                  <div key={field.label}>
                    <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>{field.label}</p>
                    <p style={{ fontSize: "0.85rem", color: field.value?.includes("ENCRYPTED") ? "#f59e0b" : "var(--color-ivory)" }}>{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Document Placeholders */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Foto KTP", key: selected.idDocumentKey },
                  { label: "Foto Selfie", key: selected.selfieKey }
                ].map((doc) => (
                  <div key={doc.label} style={{
                    background: "var(--color-bg)", border: "1px dashed var(--color-border)",
                    borderRadius: "8px", height: "140px", display: "flex",
                    alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem",
                  }}>
                    <span style={{ fontSize: "2rem", opacity: 0.3 }}>{doc.label === "Foto KTP" ? "\u2610" : "\u263A"}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{doc.label}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>Key: {doc.key || "N/A"}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--color-danger)", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Alasan Penolakan</label>
                  <textarea value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} placeholder="Tulis alasan..." style={{
                    width: "100%", minHeight: "70px", background: "var(--color-bg)", border: "1px solid var(--color-border)",
                    borderRadius: "8px", padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.5rem", resize: "vertical",
                  }} />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={handleApprove} disabled={isProcessing} style={{
                  flex: 1, padding: "0.6rem", background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e",
                  color: "#22c55e", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
                  opacity: isProcessing ? 0.7 : 1
                }}>
                  Approve
                </button>
                <button onClick={handleReject} disabled={isProcessing} style={{
                  flex: 1, padding: "0.6rem", background: showRejectForm ? "#ef4444" : "rgba(239,68,68,0.15)",
                  border: "1px solid #ef4444", color: showRejectForm ? "#fff" : "#ef4444",
                  borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
                  opacity: isProcessing ? 0.7 : 1
                }}>
                  {showRejectForm ? "Konfirmasi Reject" : "Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
