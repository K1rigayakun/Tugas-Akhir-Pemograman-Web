"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Palette, Sparkles, Loader2, Upload, Check } from "lucide-react";

/**
 * Website Customization Engine — Admin Panel
 * Mengatur tema visual website secara persisten ke database.
 */
export default function ThemeSettingsPage() {
  const [baseTheme, setBaseTheme] = useState("carbon-hexagon");
  const [effectLayer, setEffectLayer] = useState("emerald-particles");
  const [customEffectUrl, setCustomEffectUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load tema dari API saat mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetchWithAuth("/v1/admin/settings/theme");
        if (res.ok) {
          const data = await res.json();
          setBaseTheme(data.baseTheme || "carbon-hexagon");
          setEffectLayer(data.effectLayer || "emerald-particles");
          setCustomEffectUrl(data.customEffectUrl || "");
        }
      } catch (err) {
        console.error("Gagal memuat tema:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSaved(false);
    try {
      const body = new FormData();
      body.append("baseTheme", baseTheme);
      body.append("effectLayer", effectLayer);
      if (customEffectUrl) body.append("customEffectUrl", customEffectUrl);
      if (file) body.append("file", file);

      const res = await fetchWithAuth("/v1/admin/settings/theme", {
        method: "PUT",
        body,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menyimpan tema");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "1.5rem",
  };

  const radioLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    padding: "0.6rem 0.75rem",
    borderRadius: "8px",
    transition: "background 0.15s",
  };

  if (isLoading) {
    return (
      <main style={{ padding: "2.5rem", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
      </main>
    );
  }

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>
          Website Customization Engine
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Atur lapisan visual dan tema utama untuk keseluruhan website. Tema ini bisa ditimpa (override) oleh Event yang sedang aktif.
        </p>
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Base Layer */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <Palette size={20} color="var(--color-gold)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ivory)" }}>Base Background Layer</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[
              { value: "carbon-hexagon", label: "Carbon Hexagon (Default)", desc: "Grid heksagon gelap premium" },
              { value: "royal-velvet", label: "Royal Velvet (Merah Gelap)", desc: "Nuansa merah kerajaan mewah" },
              { value: "abyssal-blue", label: "Abyssal Blue (Biru Laut Dalam)", desc: "Biru gelap kedalaman laut" },
              { value: "obsidian-night", label: "Obsidian Night (Hitam Solid)", desc: "Hitam murni minimalis" },
            ].map(opt => (
              <label
                key={opt.value}
                style={{
                  ...radioLabelStyle,
                  background: baseTheme === opt.value ? "rgba(16, 185, 129, 0.08)" : "transparent",
                  border: `1px solid ${baseTheme === opt.value ? "rgba(16, 185, 129, 0.2)" : "transparent"}`,
                }}
              >
                <input
                  type="radio"
                  name="base"
                  value={opt.value}
                  checked={baseTheme === opt.value}
                  onChange={() => setBaseTheme(opt.value)}
                  style={{ accentColor: "var(--color-emerald)" }}
                />
                <div>
                  <div style={{ color: "var(--color-ivory)", fontSize: "0.9rem", fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Effect Layer */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <Sparkles size={20} color="var(--color-emerald)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-ivory)" }}>Dynamic Effect Layer</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[
              { value: "none", label: "Tidak ada efek", desc: "Tanpa animasi background" },
              { value: "emerald-particles", label: "Emerald Particles (Default)", desc: "Partikel hijau emerald melayang" },
              { value: "snowfall", label: "Snowfall (Salju Musim Dingin)", desc: "Efek butiran salju jatuh" },
              { value: "embers", label: "Embers (Bara Api Terbang)", desc: "Percikan api melayang ke atas" },
              { value: "starfield", label: "Starfield (Bintang Malam)", desc: "Bintang berkelip di langit gelap" },
              { value: "custom", label: "Custom Effect (Upload File)", desc: "Upload file JS/CSS custom" },
            ].map(opt => (
              <label
                key={opt.value}
                style={{
                  ...radioLabelStyle,
                  background: effectLayer === opt.value ? "rgba(16, 185, 129, 0.08)" : "transparent",
                  border: `1px solid ${effectLayer === opt.value ? "rgba(16, 185, 129, 0.2)" : "transparent"}`,
                }}
              >
                <input
                  type="radio"
                  name="effect"
                  value={opt.value}
                  checked={effectLayer === opt.value}
                  onChange={() => setEffectLayer(opt.value)}
                  style={{ accentColor: "var(--color-emerald)" }}
                />
                <div>
                  <div style={{ color: "var(--color-ivory)", fontSize: "0.9rem", fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Custom effect URL input */}
          {effectLayer === "custom" && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--color-bg)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
                Upload File Effect (JS/CSS) atau masukkan URL
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                  type="file"
                  accept=".js,.css"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "0.85rem",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "center" }}>ATAU</span>
                <input
                  type="url"
                  value={customEffectUrl}
                  onChange={e => setCustomEffectUrl(e.target.value)}
                  placeholder="https://cdn.example.com/effects/custom.js"
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem" }}>
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#22c55e", fontSize: "0.85rem", fontWeight: 500 }}>
            <Check size={16} /> Tema berhasil disimpan
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "0.75rem 2rem",
            background: "var(--color-emerald)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontFamily: "var(--font-subheading)",
            fontWeight: 700,
            cursor: isSaving ? "not-allowed" : "pointer",
            boxShadow: "0 0 20px rgba(16,185,129,0.3)",
            opacity: isSaving ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Menyimpan...
            </>
          ) : "Terapkan Tema Global"}
        </button>
      </div>
    </main>
  );
}
