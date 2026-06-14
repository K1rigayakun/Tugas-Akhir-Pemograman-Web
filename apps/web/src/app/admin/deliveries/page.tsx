"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { fetchApi, fetchWithAuth } from "../../../lib/api";

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any[]>("/delivery/admin/all", []);
      setDeliveries(res || []);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch deliveries. You might not have admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, currentStatus: string, currentResi: string, currentCourier: string) => {
    const status = prompt("Update Status (PENDING, SHIPPED, DELIVERED):", currentStatus);
    if (!status) return;
    
    const courier = prompt("Courier Name:", currentCourier || "");
    const resi = prompt("Tracking Resi:", currentResi || "");

    try {
      await fetchWithAuth(`/delivery/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status.toUpperCase(), trackingResi: resi, courier })
      });
      alert("Updated successfully");
      fetchDeliveries();
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  return (
    <main className="page-wrap" style={{ minHeight: "100vh" }}>
      <PageHeading eyebrow="Admin Panel" title="Delivery Management" description="Kelola pengiriman barang lelang pemenang." />
      
      <AnimatedSection>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
          {loading ? <p>Loading...</p> : (
            <div className="panel" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-gold)" }}>
                    <th style={{ padding: "1rem" }}>Auction</th>
                    <th style={{ padding: "1rem" }}>Winner</th>
                    <th style={{ padding: "1rem" }}>Address</th>
                    <th style={{ padding: "1rem" }}>Status</th>
                    <th style={{ padding: "1rem" }}>Logistics</th>
                    <th style={{ padding: "1rem" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map(d => (
                    <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "1rem" }}>{d.auction.title}</td>
                      <td style={{ padding: "1rem" }}>{d.user.username}<br/><span style={{fontSize:"0.8rem", color:"gray"}}>{d.user.email}</span></td>
                      <td style={{ padding: "1rem", fontSize: "0.85rem" }}>
                        {d.recipient} ({d.phoneNumber})<br/>
                        {d.address}, {d.city}<br/>
                        {d.province} {d.postalCode}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ 
                          padding: "0.25rem 0.5rem", 
                          borderRadius: "4px", 
                          background: d.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.2)' : d.status === 'SHIPPED' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: d.status === 'DELIVERED' ? '#10b981' : d.status === 'SHIPPED' ? '#3b82f6' : '#f59e0b'
                        }}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.85rem" }}>
                        {d.courier || "-"}<br/>
                        <span style={{ color: "var(--color-info)" }}>{d.trackingResi || "-"}</span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <button onClick={() => handleUpdate(d.id, d.status, d.trackingResi, d.courier)} className="primary-action" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AnimatedSection>
    </main>
  );
}
