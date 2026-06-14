"use client";

import { useState } from "react";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { API_URL } from "../../../lib/api";
import { Upload, FileText, Anchor } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VaultSubmissionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rarity: "EPIC",
    startingPrice: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.startingPrice || !image) {
      return alert("Mohon lengkapi semua data dan unggah gambar relik.");
    }

    setLoading(true);
    try {
      // 1. Upload Image
      const imgData = new FormData();
      imgData.append("file", image);
      
      const uploadRes = await fetch(`${API_URL}/upload/avatar`, { // Reusing upload logic for now
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        body: imgData
      });
      const uploadResult = await uploadRes.json();
      
      if (!uploadResult.url) {
        throw new Error("Gagal mengunggah gambar relik.");
      }

      // 2. Submit Item
      const submitRes = await fetch(`${API_URL}/vault/submission`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          rarity: formData.rarity,
          startingPrice: parseInt(formData.startingPrice),
          imageUrls: [uploadResult.url]
        })
      });

      if (!submitRes.ok) throw new Error("Gagal mengajukan relik");
      
      alert("Relik berhasil diajukan! Menunggu persetujuan admin (Praetorian).");
      router.push("/vault");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap">
      <PageHeading 
        eyebrow="Consignment" 
        title="Ajukan Relik ke Colosseum" 
        description="Punya artefak langka? Ajukan ke panel Praetorian (Admin) untuk dilelang secara publik." 
      />

      <AnimatedSection delay={100}>
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "rgba(0,0,0,0.4)", border: "1px solid var(--color-border)", padding: "2rem", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Nama Relik</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "#fff", padding: "0.8rem", borderRadius: "4px" }} 
                  placeholder="Contoh: Pedang Naga Hitam"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Rarity (Tingkat Kelangkaan)</label>
                <select 
                  value={formData.rarity}
                  onChange={e => setFormData({...formData, rarity: e.target.value})}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "#fff", padding: "0.8rem", borderRadius: "4px" }}
                >
                  <option value="COMMON">Common</option>
                  <option value="RARE">Rare</option>
                  <option value="EPIC">Epic</option>
                  <option value="LEGENDARY">Legendary</option>
                  <option value="MYTHIC">Mythic</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Deskripsi Sejarah Singkat</label>
              <textarea 
                rows={4}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "#fff", padding: "0.8rem", borderRadius: "4px" }} 
                placeholder="Ceritakan sejarah dan kutukan ringan di balik artefak ini..."
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Harga Awal (Crown Coins)</label>
              <input 
                type="number" 
                min="100"
                value={formData.startingPrice} 
                onChange={e => setFormData({...formData, startingPrice: e.target.value})}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-gold)", color: "var(--color-gold)", padding: "0.8rem", borderRadius: "4px", fontSize: "1.2rem", fontWeight: "bold" }} 
                placeholder="Contoh: 5000"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Gambar Bukti Relik</label>
              <div style={{ border: "2px dashed var(--color-border)", padding: "2rem", textAlign: "center", borderRadius: "8px", position: "relative" }}>
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview" style={{ maxHeight: "200px", borderRadius: "8px", marginBottom: "1rem" }} />
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Klik tombol di bawah untuk mengganti gambar</p>
                  </div>
                ) : (
                  <div style={{ color: "var(--color-text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <Upload size={32} />
                    <span>Unggah gambar JPG/PNG</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="primary-action"
              disabled={loading}
              style={{ marginTop: "1rem", padding: "1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading ? "Menyerahkan ke Praetorian..." : <><Anchor size={18} /> Ajukan Relik ke Colosseum</>}
            </button>
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
              Dengan mengajukan, Anda setuju bahwa Praetorian (Admin) berhak meninjau dan menetapkan nilai kelayakan barang ini.
            </p>

          </form>
        </div>
      </AnimatedSection>
    </main>
  );
}
