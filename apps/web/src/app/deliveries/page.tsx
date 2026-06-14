"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { fetchApi } from "../../lib/api";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function MyDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any[]>("/delivery/my-deliveries", [])
      .then((res) => {
        setDeliveries(res || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock color="var(--color-gold)" size={24} />;
      case "SHIPPED": return <Truck color="var(--color-info)" size={24} />;
      case "DELIVERED": return <CheckCircle color="var(--color-emerald)" size={24} />;
      default: return <Package size={24} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Menunggu Pengiriman";
      case "SHIPPED": return "Sedang Dikirim";
      case "DELIVERED": return "Telah Diterima";
      default: return status;
    }
  };

  return (
    <main className="page-wrap" style={{ minHeight: "100vh" }}>
      <PageHeading eyebrow="Logistics" title="Lacak Pengiriman" description="Pantau status pengiriman barang lelang yang telah Anda menangkan." />
      
      <AnimatedSection staggerChildren staggerSelector=".delivery-card">
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Memuat data pengiriman...</p>
          ) : deliveries.length === 0 ? (
            <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
              <Package size={48} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ color: "var(--color-ivory)", marginBottom: "0.5rem" }}>Belum Ada Pengiriman</h3>
              <p style={{ color: "var(--color-text-muted)" }}>Anda belum memiliki barang lelang fisik yang dimenangkan.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="panel delivery-card" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", position: "relative" }}>
                  <div style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "rgba(0,0,0,0.5)" }}>
                    <img src={delivery.auction.imageUrls[0]} alt={delivery.auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.2rem", margin: 0, color: "var(--color-ivory)" }}>{delivery.auction.title}</h3>
                        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                          Harga Akhir: <span style={{ color: "var(--color-gold)" }}>{delivery.auction.finalPrice.toLocaleString("id-ID")} CC</span>
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", borderRadius: "20px" }}>
                        {getStatusIcon(delivery.status)}
                        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{getStatusText(delivery.status)}</span>
                      </div>
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--color-ivory)", fontSize: "0.9rem" }}>Informasi Pengiriman</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        <div>
                          <strong>Penerima:</strong><br />
                          {delivery.recipient} ({delivery.phoneNumber})<br />
                          {delivery.address}, {delivery.city}, {delivery.province} {delivery.postalCode}
                        </div>
                        <div>
                          <strong>Status Logistik:</strong><br />
                          Kurir: <span style={{ color: "white" }}>{delivery.courier || "-"}</span><br />
                          No. Resi: <span style={{ color: "var(--color-info)", fontWeight: "bold", letterSpacing: "1px" }}>{delivery.trackingResi || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
    </main>
  );
}
