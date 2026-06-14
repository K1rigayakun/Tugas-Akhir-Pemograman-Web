"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2, ShoppingCart, Trophy, Medal, Calendar } from "lucide-react";

/**
 * Cosmetics & Rewards — Admin Panel
 * Upload dan atur tingkat kelangkaan item kosmetik pengguna.
 * Setiap obtain method punya pengaturan lanjutan sendiri.
 */

const RANK_LIST = ["CIVIS", "MERCHANT", "KNIGHT", "BARON", "EARL", "MARQUIS", "DUKE", "EMPEROR"];

export default function CosmeticsPage() {
  const [cosmetics, setCosmetics] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "FRAME",
    rarity: "COMMON",
    obtainMethod: "SHOP",
    webCode: "",
    // Pengaturan lanjutan
    shopPrice: 0,
    requiredRank: "CIVIS",
    linkedAchievementId: "",
    linkedEventName: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cosRes, achRes] = await Promise.all([
        fetchWithAuth("/v1/admin/cosmetics"),
        fetchWithAuth("/v1/admin/achievements"),
      ]);
      const cosData = await cosRes.json();
      const achData = await achRes.json();
      if (cosRes.ok) setCosmetics(Array.isArray(cosData) ? cosData : cosData.data || []);
      if (achRes.ok) setAchievements(Array.isArray(achData) ? achData : achData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!formData.name) return alert("Nama wajib diisi");
    if (formData.type === "WEB_CODE" && !formData.webCode) return alert("Web Code (CSS/JS) wajib diisi");
    if (formData.type !== "WEB_CODE" && !file) return alert("File gambar/video wajib diisi");
    if (formData.obtainMethod === "SHOP" && formData.shopPrice <= 0) return alert("Harga shop harus lebih dari 0");

    setIsProcessing(true);
    const body = new FormData();
    body.append("name", formData.name);
    body.append("type", formData.type);
    body.append("rarity", formData.rarity);
    body.append("obtainMethod", formData.obtainMethod);
    if (formData.description) body.append("description", formData.description);

    // Pengaturan lanjutan per obtain method
    if (formData.obtainMethod === "SHOP") {
      body.append("shopPrice", String(formData.shopPrice));
    } else if (formData.obtainMethod === "RANK") {
      body.append("requiredRank", formData.requiredRank);
    } else if (formData.obtainMethod === "ACHIEVEMENT") {
      body.append("linkedAchievementId", formData.linkedAchievementId);
    } else if (formData.obtainMethod === "EVENT") {
      body.append("linkedEventName", formData.linkedEventName);
    }

    if (formData.type === "WEB_CODE") {
      body.append("webCode", formData.webCode);
    } else if (file) {
      body.append("file", file);
    }

    try {
      const res = await fetchWithAuth("/v1/admin/cosmetics", { method: "POST", body });
      if (res.ok) {
        setShowCreate(false);
        setFormData({ name: "", description: "", type: "FRAME", rarity: "COMMON", obtainMethod: "SHOP", webCode: "", shopPrice: 0, requiredRank: "CIVIS", linkedAchievementId: "", linkedEventName: "" });
        setFile(null);
        loadData();
      } else {
        const error = await res.json();
        alert(error.message || "Gagal membuat cosmetic");
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

  const obtainMethodLabel: Record<string, string> = {
    SHOP: "Beli di Shop", ACHIEVEMENT: "Reward Achievement", RANK: "Hadiah Rank", EVENT: "Event Khusus",
  };

  const rarityColors: Record<string, string> = {
    COMMON: "#9ca3af", UNCOMMON: "#22c55e", RARE: "#3b82f6", EPIC: "#8b5cf6", LEGENDARY: "#f59e0b", MYTHIC: "#ef4444",
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Cosmetics & Rewards</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Upload dan atur tingkat kelangkaan item kosmetik pengguna.
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
          + Upload Cosmetic
        </button>
      </div>

      {showCreate && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1rem" }}>Kosmetik Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            
            {/* Nama */}
            <div>
              <label style={labelStyle}>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="Golden Crown Frame" />
            </div>

            {/* Deskripsi */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi Cara Peroleh / Keterangan</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} placeholder="Deskripsikan bagaimana cara mendapatkan item ini..." />
            </div>

            {/* Tipe */}
            <div>
              <label style={labelStyle}>Tipe</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                <option value="FRAME">Frame Avatar</option>
                <option value="BANNER">Banner Profil</option>
                <option value="NAME_EFFECT">Efek Nama</option>
                <option value="WALLET_SKIN">Skin Dompet</option>
                <option value="WEB_CODE">Web Code (CSS/JS)</option>
              </select>
            </div>

            {/* Rarity */}
            <div>
              <label style={labelStyle}>Rarity</label>
              <select value={formData.rarity} onChange={e => setFormData({ ...formData, rarity: e.target.value })} style={inputStyle}>
                {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Sumber / Obtain Method */}
            <div>
              <label style={labelStyle}>Sumber (Obtain Method)</label>
              <select value={formData.obtainMethod} onChange={e => setFormData({ ...formData, obtainMethod: e.target.value })} style={inputStyle}>
                <option value="SHOP">Shop (Beli)</option>
                <option value="ACHIEVEMENT">Achievement (Reward)</option>
                <option value="RANK">Rank Reward</option>
                <option value="EVENT">Event Khusus</option>
              </select>
            </div>

            {/* ══════ Pengaturan Lanjutan per Obtain Method ══════ */}
            
            {/* SHOP → Harga */}
            {formData.obtainMethod === "SHOP" && (
              <div style={{ gridColumn: "1 / -1", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-emerald)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pengaturan Shop
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Harga (Crown Coin CC)</label>
                    <input type="number" min="1" value={formData.shopPrice} onChange={e => setFormData({ ...formData, shopPrice: Number(e.target.value) })} style={inputStyle} placeholder="500" />
                  </div>
                  <div>
                    <label style={labelStyle}>Rank Minimum Pembeli</label>
                    <select value={formData.requiredRank} onChange={e => setFormData({ ...formData, requiredRank: e.target.value })} style={inputStyle}>
                      <option value="">-- Semua Rank --</option>
                      {RANK_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gridColumn: "1 / -1" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      Item akan tersedia di halaman Market dengan harga yang ditentukan. Hanya bisa dibeli oleh Rank yang sesuai atau lebih tinggi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RANK → Rank Minimum */}
            {formData.obtainMethod === "RANK" && (
              <div style={{ gridColumn: "1 / -1", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pengaturan Rank Reward
                </div>
                <div>
                  <label style={labelStyle}>Diberikan Saat Mencapai Rank</label>
                  <select value={formData.requiredRank} onChange={e => setFormData({ ...formData, requiredRank: e.target.value })} style={inputStyle}>
                    {RANK_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                    Item otomatis diberikan saat user naik ke rank ini.
                  </p>
                </div>
              </div>
            )}

            {/* ACHIEVEMENT → Pilih Achievement */}
            {formData.obtainMethod === "ACHIEVEMENT" && (
              <div style={{ gridColumn: "1 / -1", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8b5cf6", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pengaturan Achievement Reward
                </div>
                <div>
                  <label style={labelStyle}>Pilih Achievement</label>
                  {achievements.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "#ef4444", marginTop: "0.25rem" }}>
                      Belum ada achievement. Buat achievement terlebih dahulu di menu Achievements.
                    </p>
                  ) : (
                    <select value={formData.linkedAchievementId} onChange={e => setFormData({ ...formData, linkedAchievementId: e.target.value })} style={inputStyle}>
                      <option value="">-- Pilih Achievement --</option>
                      {achievements.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.tier})</option>
                      ))}
                    </select>
                  )}
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                    Item diberikan sebagai reward saat user membuka achievement ini.
                  </p>
                </div>
              </div>
            )}

            {/* EVENT → Nama Event */}
            {formData.obtainMethod === "EVENT" && (
              <div style={{ gridColumn: "1 / -1", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#3b82f6", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pengaturan Event
                </div>
                <div>
                  <label style={labelStyle}>Nama Event Terkait</label>
                  <input type="text" value={formData.linkedEventName} onChange={e => setFormData({ ...formData, linkedEventName: e.target.value })} style={inputStyle} placeholder="Winter Court 2026" />
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                    Item eksklusif yang hanya bisa didapat selama event berlangsung.
                  </p>
                </div>
              </div>
            )}

            {/* Deskripsi */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi (Opsional)</label>
              <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputStyle} placeholder="Deskripsi singkat tentang item ini..." />
            </div>

            {/* Web Code atau File */}
            {formData.type === "WEB_CODE" ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Custom Web Code (CSS / Scripts)</label>
                <textarea rows={6} placeholder="/* Masukkan CSS custom atau JS script di sini */" value={formData.webCode} onChange={e => setFormData({ ...formData, webCode: e.target.value })} style={{ ...inputStyle, fontFamily: "monospace", minHeight: "120px" }} />
              </div>
            ) : (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>File Media (PNG/GIF/MP4/WEBM) atau ZIP Script (.zip)</label>
                <input type="file" accept="image/*,video/mp4,video/webm,.zip" onChange={e => setFile(e.target.files?.[0] || null)} style={inputStyle} />
                {file && (
                  <div style={{ marginTop: "1rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--color-border)", width: "fit-content" }}>
                    {file.type.startsWith("video/") ? (
                      <video src={URL.createObjectURL(file)} autoPlay loop muted style={{ maxWidth: "100%", maxHeight: "200px", display: "block" }} />
                    ) : (
                      <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? "Mengupload..." : "Simpan Kosmetik"}
          </button>
        </div>
      )}

      {/* Item Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {cosmetics.map((c: any) => (
            <div key={c.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "140px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--color-border)", overflow: "hidden" }}>
                {c.type === "WEB_CODE" ? (
                  <div style={{ padding: "1rem", width: "100%", height: "100%", overflow: "hidden" }}>
                    <pre style={{ fontSize: "0.5rem", color: "var(--color-emerald)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "pre-wrap" }}>
                      {c.webCode || "/* Custom Web Code */"}
                    </pre>
                  </div>
                ) : c.imageUrl?.endsWith(".mp4") || c.imageUrl?.endsWith(".webm") ? (
                  <video src={c.imageUrl} autoPlay loop muted playsInline style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={c.imageUrl} alt={c.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                )}
              </div>
              <div style={{ padding: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>{c.name}</h4>
                {c.description && <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>{c.description}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(255,255,255,0.1)" }}>{c.type}</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: `${rarityColors[c.rarity] || "#9ca3af"}22`, color: rarityColors[c.rarity] || "#9ca3af", fontWeight: 600 }}>{c.rarity}</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    {obtainMethodLabel[c.obtainMethod] || c.obtainMethod}
                  </span>
                </div>
                {/* Detail per obtain method */}
                <div style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.3)", padding: "0.5rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ color: "var(--color-ivory)", fontWeight: "bold", marginBottom: "0.25rem" }}>Cara Mendapatkan:</div>
                  {c.obtainMethod === "SHOP" && c.shopPrice && <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-emerald)" }}><ShoppingCart size={14}/> <b>{c.shopPrice.toLocaleString()} CC</b> (Shop)</span>}
                  {c.obtainMethod === "RANK" && c.requiredRank && <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-gold)" }}><Medal size={14}/> <b>{c.requiredRank}</b> (Minimum Rank)</span>}
                  {c.obtainMethod === "ACHIEVEMENT" && c.linkedAchievementId && <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#8b5cf6" }}><Trophy size={14}/> <b>ID: {c.linkedAchievementId}</b> (Achievement)</span>}
                  {c.obtainMethod === "EVENT" && c.linkedEventName && <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#3b82f6" }}><Calendar size={14}/> <b>{c.linkedEventName}</b> (Event Eksklusif)</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
