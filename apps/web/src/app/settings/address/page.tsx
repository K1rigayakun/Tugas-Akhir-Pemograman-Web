"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { fetchApi, fetchWithAuth } from "../../../lib/api";

export default function AddressSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    recipient: "",
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    fetchApi<{ address: any }>("/delivery/address", { address: null })
      .then((res) => {
        if (res?.address) {
          setForm({
            recipient: res.address.recipient || "",
            phoneNumber: res.address.phoneNumber || "",
            address: res.address.address || "",
            city: res.address.city || "",
            province: res.address.province || "",
            postalCode: res.address.postalCode || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithAuth("/delivery/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.address) {
        alert("Alamat berhasil disimpan!");
      } else {
        alert("Gagal menyimpan alamat.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-wrap" style={{ minHeight: "100vh" }}>
      <PageHeading eyebrow="Account Settings" title="Alamat Pengiriman" description="Atur alamat pengiriman untuk barang lelang fisik yang Anda menangkan." />
      
      <AnimatedSection>
        <div className="panel" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
          {loading ? (
            <p>Memuat alamat...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gold)" }}>Nama Penerima</label>
                <input required type="text" name="recipient" value={form.recipient} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gold)" }}>Nomor Telepon</label>
                <input required type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gold)" }}>Alamat Lengkap (Jalan, RT/RW, Patokan)</label>
                <textarea required name="address" value={form.address} onChange={handleChange} rows={3} className="form-input" style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gold)" }}>Kota / Kabupaten</label>
                  <input required type="text" name="city" value={form.city} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gold)" }}>Provinsi</label>
                  <input required type="text" name="province" value={form.province} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-gold)" }}>Kode Pos</label>
                <input required type="text" name="postalCode" value={form.postalCode} onChange={handleChange} className="form-input" style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
              </div>

              <button type="submit" disabled={saving} className="primary-action" style={{ padding: "1rem", marginTop: "1rem", fontSize: "1.1rem" }}>
                {saving ? "Menyimpan..." : "Simpan Alamat"}
              </button>
            </form>
          )}
        </div>
      </AnimatedSection>
    </main>
  );
}
