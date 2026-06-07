"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

export default function ContentPage() {
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({ title: "", type: "BANNER", content: "", order: 0 });
  const [file, setFile] = useState<File | null>(null);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/content");
      const data = await res.json();
      if (res.ok) setContentList(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreate = async () => {
    if (!formData.title) return alert("Judul wajib diisi");
    
    setIsProcessing(true);
    const body = new FormData();
    body.append("title", formData.title);
    body.append("type", formData.type);
    body.append("content", formData.content);
    body.append("order", String(formData.order));
    if (file) body.append("file", file);

    try {
      const token = localStorage.getItem("admin_token");
      const rawRes = await fetch("http://localhost:3001/api/v1/admin/content", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body
      });
      
      if (rawRes.ok) {
        setShowCreate(false);
        setFormData({ title: "", type: "BANNER", content: "", order: 0 });
        setFile(null);
        loadContent();
      } else {
        const error = await rawRes.json();
        alert(error.message || "Gagal membuat konten");
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
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Konten</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Kelola Banner Homepage, Berita, dan FAQ publik.
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
          + Tambah Konten
        </button>
      </div>

      {showCreate && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1rem" }}>Konten Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Judul / Headline</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tipe Konten</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }}>
                <option value="BANNER">Homepage Banner</option>
                <option value="NEWS">Berita / Update</option>
                <option value="FAQ">FAQ (Tanya Jawab)</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Isi Konten (Text / Markdown)</label>
              <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ width: "100%", minHeight: "80px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Urutan (Order)</label>
              <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>File Gambar (Opsional)</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "white", marginTop: "0.25rem" }} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? "Menyimpan..." : "Simpan Konten"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {contentList.map((c: any) => (
            <div key={c.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "flex-start" }}>
              {c.imageUrl && (
                <div style={{ width: "200px", height: "150px", background: "#111", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.imageUrl} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ padding: "1.25rem", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>{c.title}</h4>
                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(255,255,255,0.1)", display: "inline-block", marginBottom: "0.5rem" }}>{c.type}</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Order: {c.order}</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", whiteSpace: "pre-wrap" }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
