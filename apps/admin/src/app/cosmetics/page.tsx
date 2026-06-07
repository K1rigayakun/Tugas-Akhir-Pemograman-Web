"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

export default function CosmeticsPage() {
  const [cosmetics, setCosmetics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", type: "FRAME", rarity: "COMMON", obtainMethod: "SHOP" });
  const [file, setFile] = useState<File | null>(null);

  const loadCosmetics = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/cosmetics");
      const data = await res.json();
      if (res.ok) setCosmetics(data.data || data); // handle if data is raw array
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCosmetics();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !file) return alert("Nama dan file gambar wajib diisi");
    
    setIsProcessing(true);
    const body = new FormData();
    body.append("name", formData.name);
    body.append("type", formData.type);
    body.append("rarity", formData.rarity);
    body.append("obtainMethod", formData.obtainMethod);
    body.append("file", file);

    try {
      const res = await fetchWithAuth("/v1/admin/cosmetics", {
        method: "POST",
        body,
      });
      
      if (res.ok) {
        setShowCreate(false);
        setFormData({ name: "", type: "FRAME", rarity: "COMMON", obtainMethod: "SHOP" });
        setFile(null);
        loadCosmetics();
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
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tipe</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }}>
                <option value="FRAME">Frame Avatar</option>
                <option value="BANNER">Banner Profil</option>
                <option value="NAME_EFFECT">Efek Nama</option>
                <option value="WALLET_SKIN">Skin Dompet</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Rarity</label>
              <select value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }}>
                <option value="COMMON">Common</option>
                <option value="UNCOMMON">Uncommon</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
                <option value="MYTHIC">Mythic</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Sumber (Obtain Method)</label>
              <select value={formData.obtainMethod} onChange={e => setFormData({...formData, obtainMethod: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }}>
                <option value="SHOP">Shop</option>
                <option value="ACHIEVEMENT">Achievement</option>
                <option value="RANK">Rank Reward</option>
                <option value="EVENT">Event</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>File Gambar (PNG/GIF)</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? "Mengupload..." : "Simpan Kosmetik"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {cosmetics.map((c: any) => (
            <div key={c.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "140px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--color-border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt={c.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ padding: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>{c.name}</h4>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(255,255,255,0.1)" }}>{c.type}</span>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "var(--color-gold-dim)", color: "var(--color-gold)" }}>{c.rarity}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Source: {c.obtainMethod}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
