"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const loadTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/v1/admin/finance/transactions?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.data || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(pagination.page);
  }, [pagination.page]);

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Keuangan</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Laporan ledger transaksi, top up, dan refund platform.
        </p>
      </div>

      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", minHeight: "300px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Waktu", "ID Wallet", "Tipe", "Jumlah", "Keterangan", "Ref ID"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)", background: "rgba(0,0,0,0.2)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {new Date(tx.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600 }}>{tx.walletId.slice(0, 8)}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: tx.type === 'REFUND' ? '#ef4444' : 'var(--color-gold)' }}>{tx.type}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontFamily: "monospace", color: tx.amount < 0 ? '#ef4444' : '#22c55e' }}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount} CC
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem" }}>{tx.description}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{tx.referenceId || "-"}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Belum ada transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
