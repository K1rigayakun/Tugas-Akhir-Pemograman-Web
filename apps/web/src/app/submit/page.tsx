"use client";

import { useState, useEffect } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { submitVaultOfferingAction, fetchVaultOfferingsAction } from "../actions/vault";
import { checkKycAction } from "../actions/auth";

export default function SubmitPage() {
  const [isKycApproved, setIsKycApproved] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Antik");
  const [condition, setCondition] = useState("GOOD");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      checkKycAction(),
      fetchVaultOfferingsAction()
    ]).then(([kycStatus, fetchedSubmissions]) => {
      setIsKycApproved(kycStatus === "APPROVED");
      if (fetchedSubmissions) {
        setSubmissions(fetchedSubmissions);
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isKycApproved) return setMessage("Anda harus terverifikasi KYC untuk mengajukan barang.");
    
    setMessage("Mengirim pengajuan...");
    const res = await submitVaultOfferingAction({
      itemName, description, category, condition, estimatedValue: parseInt(estimatedValue, 10), imageUrls: []
    });
    
    if (res.success) {
      setMessage("Pengajuan berhasil! Admin akan segera meninjau barang Anda.");
      setItemName("");
      setDescription("");
      setEstimatedValue("");
      // Refresh list
      fetchVaultOfferingsAction().then(data => setSubmissions(data || []));
    } else {
      setMessage(res.error || "Gagal mengirim pengajuan.");
    }
  }

  if (loading) return <main className="page-wrap"><p>Loading...</p></main>;

  return (
    <main className="page-wrap">
      <PageHeading 
        eyebrow="The Vault Offering" 
        title="Ajukan Harta Karun Anda" 
        description="Serahkan barang langka Anda ke platform untuk dilelang secara profesional." 
      />
      
      <AnimatedSection className="content-card" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
        {message && <p className="status-message" style={{ marginBottom: "1rem" }}>{message}</p>}
        
        {!isKycApproved ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ color: "var(--crimson-seal)" }}>Akses Terkunci</h2>
            <p>Hanya "Citizen of the Imperium" yang telah terverifikasi yang dapat mengajukan barang.</p>
            <a href="/kyc" className="primary-action" style={{ display: "inline-block", marginTop: "1rem" }}>Verifikasi Identitas (KYC)</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="form-group">
              <label>Nama Barang</label>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="Contoh: Rolex Submariner 1980" />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Antik">Antik</option>
                <option value="Jam Tangan">Jam Tangan Mewah</option>
                <option value="Seni">Karya Seni</option>
                <option value="Perhiasan">Perhiasan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kondisi Barang</label>
              <select value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="MINT">Mint (Sempurna)</option>
                <option value="GOOD">Good (Baik/Sedikit Aus)</option>
                <option value="FAIR">Fair (Cukup/Perlu Restorasi)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Estimasi Nilai (IDR)</label>
              <input type="number" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} required min="100000" />
            </div>
            <div className="form-group">
              <label>Deskripsi & Sejarah Barang</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Ceritakan asal-usul dan keunikan barang ini..." />
            </div>
            <button type="submit" className="primary-action">Ajukan ke Praetorian Guard</button>
          </form>
        )}
      </AnimatedSection>

      {submissions.length > 0 && (
        <AnimatedSection delay={200} style={{ marginTop: "3rem" }}>
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontFamily: "var(--font-cinzel)" }}>Riwayat Pengajuan Anda</h2>
          <div className="data-grid">
            {submissions.map((sub: any) => (
              <article key={sub.id} className="content-card">
                <h3>{sub.itemName}</h3>
                <p><strong>Status:</strong> <span style={{ color: sub.status === 'PENDING' ? 'var(--amber-glow)' : sub.status === 'ACCEPTED' ? 'var(--emerald-deep)' : 'var(--crimson-seal)' }}>{sub.status}</span></p>
                <p><strong>Estimasi:</strong> Rp {sub.estimatedValue.toLocaleString('id-ID')}</p>
                <p><strong>Tanggal:</strong> {new Date(sub.createdAt).toLocaleDateString('id-ID')}</p>
              </article>
            ))}
          </div>
        </AnimatedSection>
      )}
    </main>
  );
}
