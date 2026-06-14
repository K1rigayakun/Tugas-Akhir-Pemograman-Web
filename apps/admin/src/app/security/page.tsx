"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2, ShieldAlert } from "lucide-react";

export default function SecurityPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({ ipAddress: "", reason: "", isBlocked: true });

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/security/rules");
      const data = await res.json();
      if (res.ok) setRules(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleCreate = async () => {
    if (!formData.ipAddress) return alert("IP Address wajib diisi");
    
    setIsProcessing(true);
    try {
      const res = await fetchWithAuth("/v1/admin/security/rules", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setFormData({ ipAddress: "", reason: "", isBlocked: true });
        loadRules();
      } else {
        alert(data.message || "Gagal membuat rule");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldAlert size={24} color="var(--color-danger)" />
            Keamanan Lanjutan
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Konfigurasi perlindungan platform dan IP Whitelist/Blacklist. (Khusus Super Admin)
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-danger)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
          + Tambah IP Rule
        </button>
      </div>

      {showCreate && (
        <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-danger)", marginBottom: "1rem" }}>Rule Akses Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>IP Address / CIDR</label>
              <input type="text" placeholder="misal: 192.168.1.1 atau 10.0.0.0/24" value={formData.ipAddress} onChange={e => setFormData({...formData, ipAddress: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tipe Rule</label>
              <select value={formData.isBlocked ? "BLOCK" : "ALLOW"} onChange={e => setFormData({...formData, isBlocked: e.target.value === "BLOCK"})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }}>
                <option value="BLOCK">Blacklist (Block)</option>
                <option value="ALLOW">Whitelist (Allow)</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Alasan (Reason)</label>
              <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{ padding: "0.5rem 1.5rem", background: "var(--color-danger)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? "Menyimpan..." : "Simpan Rule"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-danger)" size={32} />
        </div>
      ) : (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["IP Address", "Status", "Alasan", "Dibuat Pada"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)", background: "rgba(0,0,0,0.2)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontFamily: "monospace", color: "var(--color-ivory)" }}>{r.ipAddress}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700, background: r.isBlocked ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)", color: r.isBlocked ? "#ef4444" : "#22c55e" }}>
                      {r.isBlocked ? "BLOCKED" : "ALLOWED"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{r.reason || "-"}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{new Date(r.createdAt).toLocaleString("id-ID")}</td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Belum ada security rule.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
