"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2, Image, Newspaper, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

/**
 * Berita & Slider — Admin Panel
 * Kelola konten homepage slider (BANNER) dan berita/update (NEWS).
 */
export default function NewsSliderPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"BANNER" | "NEWS">("BANNER");
  const [showCreate, setShowCreate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ title: "", content: "", order: 0 });
  const [file, setFile] = useState<File | null>(null);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [bannerRes, newsRes] = await Promise.all([
        fetchWithAuth("/v1/admin/content?type=BANNER"),
        fetchWithAuth("/v1/admin/content?type=NEWS"),
      ]);
      const bannerData = await bannerRes.json();
      const newsData = await newsRes.json();
      if (bannerRes.ok) setBanners(Array.isArray(bannerData) ? bannerData : bannerData.data || []);
      if (newsRes.ok) setNews(Array.isArray(newsData) ? newsData : newsData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContent(); }, []);

  const handleCreate = async () => {
    if (!formData.title) return setError("Judul wajib diisi");
    setIsProcessing(true);
    setError("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const body = new FormData();
      body.append("title", formData.title);
      body.append("type", activeTab);
      body.append("content", formData.content);
      body.append("order", String(formData.order));
      if (file) body.append("file", file);

      const res = await fetchWithAuth("/v1/admin/content", {
        method: "POST",
        body,
      });

      if (res.ok) {
        setShowCreate(false);
        setFormData({ title: "", content: "", order: 0 });
        setFile(null);
        loadContent();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal membuat konten");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  };

  const items = activeTab === "BANNER" ? banners : news;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "0.6rem",
    color: "white",
    marginTop: "0.25rem",
    fontSize: "0.85rem",
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>
            Berita & Slider
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Kelola konten slider banner homepage dan berita/update platform.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            padding: "0.6rem 1.25rem",
            background: "var(--color-gold)",
            color: "#0a0a0f",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Plus size={16} /> Tambah {activeTab === "BANNER" ? "Banner" : "Berita"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {(["BANNER", "NEWS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowCreate(false); }}
            style={{
              padding: "0.5rem 1.25rem",
              background: activeTab === tab ? "var(--color-emerald)" : "var(--color-surface)",
              color: activeTab === tab ? "#fff" : "var(--color-text-muted)",
              border: `1px solid ${activeTab === tab ? "var(--color-emerald)" : "var(--color-border)"}`,
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {tab === "BANNER" ? <Image size={16} /> : <Newspaper size={16} />}
            {tab === "BANNER" ? `Slider (${banners.length})` : `Berita (${news.length})`}
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-gold)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1rem" }}>
            {activeTab === "BANNER" ? "Banner Baru" : "Berita Baru"}
          </h3>

          {error && (
            <div style={{ padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.85rem", borderRadius: "6px", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                {activeTab === "BANNER" ? "Headline Banner" : "Judul Berita"}
              </label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} placeholder={activeTab === "BANNER" ? "Flash Sale Minggu Ini!" : "Update Platform v2.0"} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Urutan Tampil</label>
              <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                {activeTab === "BANNER" ? "Deskripsi Singkat" : "Isi Berita"}
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                style={{ ...inputStyle, minHeight: activeTab === "NEWS" ? "120px" : "60px", resize: "vertical" }}
                placeholder={activeTab === "BANNER" ? "Keterangan pendek di bawah headline..." : "Tulis isi berita lengkap di sini..."}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                {activeTab === "BANNER" ? "Gambar Banner (1200x400 px)" : "Thumbnail Berita"}
              </label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={inputStyle} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{
            padding: "0.5rem 1.5rem",
            background: "var(--color-gold)",
            color: "#0a0a0f",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            opacity: isProcessing ? 0.7 : 1,
          }}>
            {isProcessing ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)", borderRadius: "12px" }}>
          Belum ada {activeTab === "BANNER" ? "banner slider" : "berita"}. Klik tombol di atas untuk menambahkan.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: activeTab === "BANNER" ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
          {items.map((item: any) => (
            <div key={item.id} style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: activeTab === "BANNER" ? "row" : "column",
            }}>
              {item.imageUrl && (
                <div style={{
                  width: activeTab === "BANNER" ? "280px" : "100%",
                  height: activeTab === "BANNER" ? "120px" : "180px",
                  background: "#111",
                  flexShrink: 0,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ padding: "1rem", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ivory)" }}>{item.title}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      background: item.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: item.isActive ? "#22c55e" : "#ef4444",
                    }}>
                      {item.isActive ? "AKTIF" : "NONAKTIF"}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>#{item.order}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {item.content?.substring(0, 200)}{item.content?.length > 200 ? "..." : ""}
                </p>
                <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                  Dibuat: {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
