"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: "", description: "", tier: "COMMON", trigger: "", conditionStr: "{}", expReward: 0 
  });

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/achievements");
      const data = await res.json();
      if (res.ok) setAchievements(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.description) return alert("Nama dan deskripsi wajib diisi");
    
    setIsProcessing(true);
    try {
      let conditionObj = {};
      try {
        conditionObj = JSON.parse(formData.conditionStr);
      } catch (e) {
        alert("Condition harus berupa valid JSON");
        setIsProcessing(false);
        return;
      }

      const res = await fetchWithAuth("/v1/admin/achievements", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tier: formData.tier,
          trigger: formData.trigger,
          condition: conditionObj,
          expReward: Number(formData.expReward)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setFormData({ name: "", description: "", tier: "COMMON", trigger: "", conditionStr: "{}", expReward: 0 });
        loadAchievements();
      } else {
        alert(data.message || "Gagal membuat achievement");
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
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Achievements</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Buat dan atur reward untuk pencapaian pengguna.
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
          + Buat Achievement
        </button>
      </div>

      {showCreate && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1rem" }}>Achievement Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tier</label>
              <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }}>
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Deskripsi</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Event Trigger</label>
              <input type="text" placeholder="misal: WIN_AUCTION" value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Reward EXP</label>
              <input type="number" value={formData.expReward} onChange={e => setFormData({...formData, expReward: Number(e.target.value)})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Condition (JSON)</label>
              <textarea value={formData.conditionStr} onChange={e => setFormData({...formData, conditionStr: e.target.value})} style={{ width: "100%", minHeight: "80px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem", fontFamily: "monospace" }} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? "Menyimpan..." : "Simpan Achievement"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {(achievements.data || achievements).map((a: any) => (
            <div key={a.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>{a.name}</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>{a.description}</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(255,255,255,0.1)" }}>{a.tier}</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "var(--color-gold-dim)", color: "var(--color-gold)" }}>+{a.expReward} EXP</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>Trigger: {a.trigger}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
