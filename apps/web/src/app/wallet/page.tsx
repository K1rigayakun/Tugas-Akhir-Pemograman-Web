"use client";

import { useState, useEffect } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { getWalletBalanceAction, getWalletTransactionsAction, topUpAction } from "../actions/wallet";
import { getSessionUser } from "../actions/session";
import CrownCoinIcon from "../../components/CrownCoinIcon";
import WalletCard3D from "../../components/WalletCard3D";

export default function WalletPage() {
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number>(100); // Amount in CC
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<{ username: string; rank: string; activeWalletSkin?: string | null } | null>(null);

  useEffect(() => {
    getSessionUser().then(u => { 
      if (u) setUser({ username: u.username, rank: u.rank, activeWalletSkin: u.activeWalletSkin }); 
    });
  }, []);

  useEffect(() => {
    Promise.all([
      getWalletBalanceAction(),
      getWalletTransactionsAction()
    ]).then(([balanceRes, txRes]) => {
      if (balanceRes.success) setBalance(balanceRes.data);
      if (txRes.success) {
        const txData = txRes.data as any;
        setTransactions(Array.isArray(txData) ? txData : (txData?.items || txData?.transactions || []));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleTopUp() {
    setMessage("Memproses top up...");
    const res = await topUpAction(amount);
    if (res.success) {
      setMessage(`Berhasil membuat tagihan top up. (Simulasi: Top up akan otomatis masuk)`);
      // Simulate top up completion
      setTimeout(() => {
        getWalletBalanceAction().then(b => { if (b.success) setBalance(b.data); });
        getWalletTransactionsAction().then(t => { 
          if (t.success) {
            const txData = t.data as any;
            setTransactions(Array.isArray(txData) ? txData : (txData?.items || txData?.transactions || []));
          }
        });
        setMessage("");
      }, 2000);
    } else {
      setMessage(res.message || "Gagal top up.");
    }
  }

  if (loading) return <main className="page-wrap"><p>Loading...</p></main>;

  return (
    <main className="page-wrap">
      <PageHeading 
        eyebrow="The Aerarium" 
        title="Dompet Kerajaan" 
        description="Kelola Crown Coin (CC) Anda. Semua transaksi dicatat abadi dalam ledger." 
      />

      <AnimatedSection>
        {/* 3D Interactive Wallet Card */}
        <WalletCard3D balance={balance} username={user?.username || ""} rank={user?.rank || "CIVIS"} hasSkin={!!user?.activeWalletSkin} />

        {/* Top Up Section */}
        <div className="content-card" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', marginBottom: '1rem' }}>Top Up Crown Coin</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Kunjungi Imperial Treasury untuk membeli Crown Coins menggunakan berbagai metode pembayaran.
          </p>
          <a href="/topup" className="primary-action" style={{ display: 'inline-block', width: '100%', maxWidth: '300px', textDecoration: 'none' }}>
            Pergi ke Imperial Treasury
          </a>
        </div>

        {/* Transaction History */}
        <div className="content-card">
          <h2 style={{ fontFamily: 'var(--font-cinzel)', marginBottom: '1.5rem' }}>Riwayat Transaksi</h2>
          {transactions.length === 0 ? (
            <p>Belum ada riwayat transaksi.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--imperial-gold)', color: 'var(--imperial-gold)' }}>
                  <th style={{ padding: '1rem 0' }}>Tanggal</th>
                  <th style={{ padding: '1rem 0' }}>Tipe</th>
                  <th style={{ padding: '1rem 0' }}>Deskripsi</th>
                  <th style={{ padding: '1rem 0', textAlign: 'right' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '1rem 0', color: 'var(--silver-mist)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ padding: '1rem 0' }}>{tx.type}</td>
                    <td style={{ padding: '1rem 0' }}>{tx.description}</td>
                    <td style={{ 
                      padding: '1rem 0', 
                      textAlign: 'right',
                      color: tx.amount > 0 ? 'var(--emerald-deep)' : 'var(--crimson-seal)',
                      fontWeight: 'bold'
                    }}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('id-ID')} CC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AnimatedSection>
    </main>
  );
}
