"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2, Plus, Tag, Package } from "lucide-react";

/**
 * Kelola Kategori Lelang — Admin Panel
 * Menampilkan semua kategori yang digunakan pada lelang dan memungkinkan pengelolaan.
 */

interface CategoryInfo {
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Fetch all auctions and extract unique categories with counts
      const res = await fetchWithAuth("/v1/admin/auctions?page=1");
      const data = await res.json();
      if (res.ok) {
        const auctions = data.data || [];
        const catMap: Record<string, number> = {};
        auctions.forEach((auction: any) => {
          const cat = auction.category || "Tanpa Kategori";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const sorted = Object.entries(catMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setCategories(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

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

  // Predefined category suggestions (common auction categories)
  const suggestedCategories = [
    "Lukisan & Seni Rupa",
    "Koin & Perangko",
    "Memorabilia & Vintage",
    "Artefak Sejarah",
    "Buku Langka & Manuskrip",
    "Cincin & Gelang",
    "Kalung & Liontin",
    "Jam Tangan Mewah",
    "Permata & Batu Mulia",
    "Mobil Klasik",
    "Mobil Sport & Supercar",
    "Motor Custom",
    "Sepeda Premium",
    "Smartphone & Tablet",
    "Laptop & PC Gaming",
    "Kamera & Lensa",
    "Konsol Game & Retro Gaming",
    "Audio High-End",
    "Tas Branded",
    "Sepatu Limited Edition",
    "Pakaian Designer",
    "Parfum Langka",
    "Jersey Bertandatangan",
    "Perlengkapan Golf Premium",
    "Alat Fitness Premium",
    "Properti Mewah",
    "NFT & Digital Art",
    "Wine & Spirits Langka",
    "Action Figure Langka",
    "LEGO Collector Edition",
    "Model Kit & Diecast",
    "Trading Card",
    "Gitar Vintage",
    "Piano & Keyboard",
    "Instrumen Klasik",
    "Perabot Antik",
    "Alat Tulis Premium",
    "Tanaman Hias Langka",
  ];

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>
            Kelola Kategori
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Kategori yang digunakan pada lelang saat ini. Kategori otomatis tercipta saat lelang dibuat.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "1.25rem",
          textAlign: "center",
        }}>
          <Tag size={24} color="var(--color-gold)" style={{ marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-ivory)" }}>{categories.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Kategori</div>
        </div>
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "1.25rem",
          textAlign: "center",
        }}>
          <Package size={24} color="var(--color-emerald)" style={{ marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-ivory)" }}>
            {categories.reduce((sum, c) => sum + c.count, 0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Lelang</div>
        </div>
      </div>

      {/* Suggested Categories */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Saran Kategori
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {suggestedCategories.map(cat => {
            const exists = categories.some(c => c.name.toLowerCase() === cat.toLowerCase());
            return (
              <span key={cat} style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 500,
                background: exists ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                color: exists ? "#22c55e" : "var(--color-text-muted)",
                border: `1px solid ${exists ? "rgba(34,197,94,0.3)" : "var(--color-border)"}`,
              }}>
                {cat} {exists && "✓"}
              </span>
            );
          })}
        </div>
      </div>

      {/* Category List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : categories.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--color-text-muted)",
          border: "1px dashed var(--color-border)",
          borderRadius: "12px",
        }}>
          Belum ada kategori. Kategori akan otomatis muncul saat lelang baru dibuat.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
          {categories.map((cat) => (
            <div key={cat.name} style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              transition: "border-color 0.2s",
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Tag size={20} color="var(--color-emerald)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ivory)" }}>{cat.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                  {cat.count} lelang
                </div>
              </div>
              <div style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: "var(--color-gold-dim)",
                color: "var(--color-gold)",
              }}>
                {cat.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
