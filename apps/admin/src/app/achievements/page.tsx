"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2, Trophy, Zap, Target } from "lucide-react";

/**
 * Achievements — Admin Panel
 * Buat dan atur reward untuk pencapaian pengguna.
 * Form user-friendly dengan preset trigger dan condition builder visual.
 */

// Preset trigger yang tersedia di sistem
const TRIGGER_PRESETS = [
  { value: "WIN_AUCTION", label: "Menang Lelang", icon: "trophy", desc: "User memenangkan lelang" },
  { value: "PLACE_BID", label: "Memasang Bid", icon: "gavel", desc: "User memasang bid pada lelang" },
  { value: "TOTAL_BIDS", label: "Total Bid Kumulatif", icon: "bar-chart", desc: "Total bid yang pernah dipasang" },
  { value: "TOTAL_WINS", label: "Total Kemenangan", icon: "crown", desc: "Total lelang yang dimenangkan" },
  { value: "TOTAL_SPEND", label: "Total Pengeluaran", icon: "wallet", desc: "Total uang yang dikeluarkan" },
  { value: "RANK_UP", label: "Naik Rank", icon: "arrow-up", desc: "User naik ke rank tertentu" },
  { value: "CONSECUTIVE_WINS", label: "Win Streak", icon: "flame", desc: "Menang berturut-turut" },
  { value: "FIRST_PURCHASE", label: "Pembelian Pertama", icon: "shopping-bag", desc: "Melakukan pembelian pertama" },
  { value: "KYC_VERIFIED", label: "KYC Terverifikasi", icon: "shield-check", desc: "Menyelesaikan verifikasi KYC" },
  { value: "JOIN_EVENT", label: "Ikut Event", icon: "calendar", desc: "Berpartisipasi dalam event" },
  { value: "REFERRAL", label: "Referral Berhasil", icon: "users", desc: "Mereferensikan user baru" },
  { value: "DAILY_LOGIN", label: "Login Harian", icon: "log-in", desc: "Login berturut-turut beberapa hari" },
  { value: "CUSTOM", label: "Custom Trigger", icon: "code", desc: "Trigger manual / kustom" },
];

// Condition operator untuk builder visual
const CONDITION_OPERATORS = [
  { value: "gte", label: "Lebih dari atau sama dengan (>=)" },
  { value: "gt", label: "Lebih dari (>)" },
  { value: "eq", label: "Sama dengan (=)" },
  { value: "lte", label: "Kurang dari atau sama dengan (<=)" },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tier: "COMMON",
    trigger: "WIN_AUCTION",
    customTrigger: "",
    expReward: 100,
    titleReward: "",
    cosmeticReward: "",
    // Condition builder
    conditionField: "count",
    conditionOperator: "gte",
    conditionValue: 1,
    conditionRank: "",
  });

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/achievements");
      const data = await res.json();
      if (res.ok) setAchievements(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAchievements(); }, []);

  // Build condition JSON dari visual builder
  const buildCondition = () => {
    const trigger = formData.trigger === "CUSTOM" ? formData.customTrigger : formData.trigger;

    if (trigger === "RANK_UP") {
      return { targetRank: formData.conditionRank || "KNIGHT" };
    }
    if (trigger === "FIRST_PURCHASE" || trigger === "KYC_VERIFIED") {
      return {}; // Tidak perlu condition, cukup trigger saja
    }

    return {
      [formData.conditionField]: {
        [formData.conditionOperator]: formData.conditionValue,
      },
    };
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.description) return alert("Nama dan deskripsi wajib diisi");

    const trigger = formData.trigger === "CUSTOM" ? formData.customTrigger : formData.trigger;
    if (!trigger) return alert("Trigger wajib dipilih");

    setIsProcessing(true);
    try {
      const condition = buildCondition();
      const res = await fetchWithAuth("/v1/admin/achievements", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tier: formData.tier,
          trigger,
          condition,
          expReward: Number(formData.expReward),
          titleReward: formData.titleReward || null,
          cosmeticReward: formData.cosmeticReward || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setFormData({
          name: "", description: "", tier: "COMMON", trigger: "WIN_AUCTION", customTrigger: "",
          expReward: 100, titleReward: "", cosmeticReward: "",
          conditionField: "count", conditionOperator: "gte", conditionValue: 1, conditionRank: "",
        });
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

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)",
    borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem", fontSize: "0.85rem",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em",
  };

  const tierColors: Record<string, string> = {
    COMMON: "#9ca3af", RARE: "#3b82f6", EPIC: "#8b5cf6", LEGENDARY: "#f59e0b", MYTHIC: "#ef4444",
  };

  const selectedTrigger = TRIGGER_PRESETS.find(t => t.value === formData.trigger);
  const needsCountCondition = !["RANK_UP", "FIRST_PURCHASE", "KYC_VERIFIED"].includes(formData.trigger);

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

            {/* Nama */}
            <div>
              <label style={labelStyle}>Nama Achievement</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="First Blood" />
            </div>

            {/* Tier */}
            <div>
              <label style={labelStyle}>Tier</label>
              <select value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })} style={inputStyle}>
                {["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Deskripsi */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi</label>
              <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputStyle} placeholder="Menangkan lelang pertama kamu!" />
            </div>

            {/* ══════ Trigger Selection ══════ */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Cara Memperoleh (Trigger)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
                {TRIGGER_PRESETS.map(trigger => (
                  <label
                    key={trigger.value}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.6rem",
                      padding: "0.6rem 0.75rem", borderRadius: "8px", cursor: "pointer",
                      background: formData.trigger === trigger.value ? "rgba(16,185,129,0.08)" : "var(--color-bg)",
                      border: `1px solid ${formData.trigger === trigger.value ? "rgba(16,185,129,0.3)" : "var(--color-border)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio" name="trigger"
                      value={trigger.value}
                      checked={formData.trigger === trigger.value}
                      onChange={() => setFormData({ ...formData, trigger: trigger.value })}
                      style={{ accentColor: "var(--color-emerald)", flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ivory)" }}>{trigger.label}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{trigger.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom trigger input */}
            {formData.trigger === "CUSTOM" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Nama Trigger Kustom</label>
                <input type="text" value={formData.customTrigger} onChange={e => setFormData({ ...formData, customTrigger: e.target.value })} style={inputStyle} placeholder="CUSTOM_EVENT_NAME" />
              </div>
            )}

            {/* ══════ Condition Builder ══════ */}
            {formData.trigger !== "CUSTOM" && (
              <div style={{ gridColumn: "1 / -1", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Target size={16} color="#3b82f6" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Syarat Pencapaian
                  </span>
                </div>

                {formData.trigger === "RANK_UP" ? (
                  <div>
                    <label style={labelStyle}>Rank Target</label>
                    <select value={formData.conditionRank} onChange={e => setFormData({ ...formData, conditionRank: e.target.value })} style={inputStyle}>
                      <option value="">-- Pilih Rank --</option>
                      {["MERCHANT", "KNIGHT", "BARON", "EARL", "MARQUIS", "DUKE", "EMPEROR"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                      Achievement terbuka saat user mencapai rank ini.
                    </p>
                  </div>
                ) : ["FIRST_PURCHASE", "KYC_VERIFIED"].includes(formData.trigger) ? (
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    Achievement ini otomatis terbuka saat trigger terjadi (tidak perlu syarat tambahan).
                  </p>
                ) : needsCountCondition ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={labelStyle}>Parameter</label>
                      <select value={formData.conditionField} onChange={e => setFormData({ ...formData, conditionField: e.target.value })} style={inputStyle}>
                        <option value="count">Jumlah (Count)</option>
                        <option value="amount">Nominal (Amount)</option>
                        <option value="streak">Berturut-turut (Streak)</option>
                        <option value="days">Hari (Days)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Operator</label>
                      <select value={formData.conditionOperator} onChange={e => setFormData({ ...formData, conditionOperator: e.target.value })} style={inputStyle}>
                        {CONDITION_OPERATORS.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Nilai</label>
                      <input type="number" min="1" value={formData.conditionValue} onChange={e => setFormData({ ...formData, conditionValue: Number(e.target.value) })} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ background: "var(--color-bg)", borderRadius: "6px", padding: "0.6rem 0.75rem", fontSize: "0.8rem", color: "var(--color-ivory)" }}>
                        Ringkasan: <strong style={{ color: "var(--color-emerald)" }}>
                          {selectedTrigger?.label} — {formData.conditionField} {formData.conditionOperator === "gte" ? ">=" : formData.conditionOperator === "gt" ? ">" : formData.conditionOperator === "eq" ? "=" : "<="} {formData.conditionValue}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ══════ Rewards ══════ */}
            <div style={{ gridColumn: "1 / -1", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Zap size={16} color="#f59e0b" />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Rewards
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>EXP Reward</label>
                  <input type="number" min="0" value={formData.expReward} onChange={e => setFormData({ ...formData, expReward: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Title Reward (Opsional)</label>
                  <input type="text" value={formData.titleReward} onChange={e => setFormData({ ...formData, titleReward: e.target.value })} style={inputStyle} placeholder="The Conqueror" />
                </div>
                <div>
                  <label style={labelStyle}>Cosmetic Reward (Opsional)</label>
                  <input type="text" value={formData.cosmeticReward} onChange={e => setFormData({ ...formData, cosmeticReward: e.target.value })} style={inputStyle} placeholder="ID Cosmetic" />
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleCreate} disabled={isProcessing} style={{
            padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none",
            borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1,
          }}>
            {isProcessing ? "Menyimpan..." : "Simpan Achievement"}
          </button>
        </div>
      )}

      {/* Achievement List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : achievements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)", borderRadius: "12px" }}>
          Belum ada achievement. Klik tombol di atas untuk membuat.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {achievements.map((a: any) => (
            <div key={a.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                  <Trophy size={20} color={tierColors[a.tier] || "#9ca3af"} />
                  <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>{a.name}</h4>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem", marginLeft: "2.25rem" }}>{a.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginLeft: "2.25rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 600, background: `${tierColors[a.tier] || "#9ca3af"}22`, color: tierColors[a.tier] || "#9ca3af" }}>{a.tier}</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "var(--color-gold-dim)", color: "var(--color-gold)" }}>+{a.expReward} EXP</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                    {TRIGGER_PRESETS.find(t => t.value === a.trigger)?.label || a.trigger}
                  </span>
                  {a.titleReward && <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }}>Title: {a.titleReward}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
