"use client";

import { useEffect, useState } from "react";
import { useLiveAuction } from "../../../hooks/useLiveAuction";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { Clock, Plus, Minus, Gavel } from "lucide-react";

export default function StandardRoom({ 
  auction, 
  initialBids,
  currentUser 
}: { 
  auction: any;
  initialBids: any[];
  currentUser: { id: string; username: string; rank: string } | null;
}) {
  const {
    bids,
    currentPrice,
    setCurrentPrice,
    viewerCount,
    endTime,
    setEndTime,
    isEnded,
    winner,
    outbidMessage,
    clearOutbidMessage,
    placeBid,
    placePhantomBid
  } = useLiveAuction(auction.id, currentUser?.id, currentUser?.rank);

  const isDescending = auction.auctionType === "DESCENDING";
  const isSealed = auction.isSealed || auction.auctionType === "SEALED_CHEST";
  
  const minBid = isDescending ? currentPrice : currentPrice + auction.minimumIncrement;
  const [bidAmount, setBidAmount] = useState<number>(minBid);
  const [timeLeft, setTimeLeft] = useState("");
  const [isPhantom, setIsPhantom] = useState(false);

  useEffect(() => {
    setCurrentPrice(auction.currentPrice);
    setEndTime(auction.endTime);
  }, [auction, setCurrentPrice, setEndTime]);

  useEffect(() => {
    // Ensure bid amount is at least minBid when currentPrice changes
    if (bidAmount < minBid) {
      setBidAmount(minBid);
    }
  }, [currentPrice, auction.minimumIncrement, bidAmount, minBid, isDescending]);

  useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => {
      const ms = new Date(endTime).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft("Berakhir");
        clearInterval(interval);
      } else {
        const s = Math.floor((ms / 1000) % 60);
        const m = Math.floor((ms / 1000 / 60) % 60);
        const h = Math.floor((ms / 1000 / 60 / 60) % 24);
        const d = Math.floor(ms / (1000 * 60 * 60 * 24));
        setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Silakan login untuk melakukan bid.");
    if (isPhantom) {
      if (bidAmount < minBid) {
        alert("Batas maksimal Phantom Bid tidak valid.");
        return;
      }
      const res = await placePhantomBid(bidAmount);
      if (res && res.success) {
        alert("Phantom Bid berhasil diaktifkan!");
        setIsPhantom(false);
      } else if (res) {
        alert(res.error || "Gagal memasang Phantom Bid.");
      }
    } else {
      if (bidAmount < minBid) return alert("Bid harus lebih besar dari harga minimum!");
      placeBid(bidAmount, currentUser.username);
    }
  };

  const handleIncrease = () => setBidAmount(prev => prev + auction.minimumIncrement);
  const handleDecrease = () => setBidAmount(prev => Math.max(minBid, prev - auction.minimumIncrement));

  const displayBids = [...bids, ...initialBids].slice(0, 10);

  return (
    <main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem" }}>
      <PageHeading 
        eyebrow="Standard Auction" 
        title={auction.title} 
        description="The artifact rests silently, awaiting its true master." 
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
        
        {/* Kolom Kiri: Visual & Deskripsi */}
        <AnimatedSection delay={100}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="panel" style={{ padding: "1rem" }}>
              {auction.imageUrls?.[0] ? (
                <img src={auction.imageUrls[0]} alt={auction.title} style={{ width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "8px" }} />
              ) : (
                <div style={{ height: "400px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>No Image Available</span>
                </div>
              )}
            </div>

            <div className="panel" style={{ background: "rgba(0,0,0,0.6)" }}>
              {isSealed ? (
                <div style={{ padding: "2rem", textAlign: "center", background: "var(--color-bg)", borderRadius: "8px", border: "1px dashed var(--color-border)" }}>
                  <span style={{ fontSize: "3rem" }}>🧰</span>
                  <h3 style={{ color: "var(--color-gold)", margin: "1rem 0", fontFamily: "var(--font-cinzel)" }}>Mystery Chest</h3>
                  <p style={{ color: "var(--color-text-muted)" }}>Isi dari peti ini disegel secara magis. Hanya pemenang yang berhak mengetahui artefak di dalamnya.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ color: "var(--color-gold)", marginBottom: "1rem", fontFamily: "var(--font-cinzel)" }}>Item Details</h3>
                  <p style={{ color: "var(--color-ivory)", lineHeight: "1.8" }}>{auction.description}</p>
                  
                  <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                    <div>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", display: "block" }}>Starting Price</span>
                      <span style={{ color: "#fff", fontWeight: "bold" }}>{auction.startingPrice.toLocaleString("id-ID")} CC</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", display: "block" }}>Rarity</span>
                      <span style={{ color: "var(--color-emerald)", fontWeight: "bold" }}>{auction.rarity}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Kolom Kanan: Bid Interface */}
        <AnimatedSection delay={200}>
          <div className="panel" style={{ position: "sticky", top: "6rem" }}>
            
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Current Bid</h3>
              <p style={{ fontSize: "3.5rem", fontWeight: "bold", color: "var(--color-gold)", margin: "0.5rem 0", fontFamily: "var(--font-cinzel)" }}>
                {currentPrice.toLocaleString("id-ID")}
              </p>
              <span style={{ color: "var(--color-gold)", fontSize: "1.2rem" }}>Crown Coins</span>
              
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "0.5rem 1.5rem", borderRadius: "30px", marginTop: "1.5rem" }}>
                <Clock size={16} color="var(--color-emerald)" />
                <span style={{ color: "var(--color-ivory)", fontWeight: "bold", letterSpacing: "1px" }}>{timeLeft}</span>
              </div>
            </div>

            {outbidMessage && (
              <button
                type="button"
                onClick={clearOutbidMessage}
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  padding: "0.85rem 1rem",
                  background: "rgba(139, 26, 26, 0.22)",
                  border: "1px solid rgba(239, 68, 68, 0.55)",
                  borderRadius: "8px",
                  color: "#fecaca",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: 700,
                }}
              >
                Anda telah di-outbid. {outbidMessage}
              </button>
            )}

            {isEnded ? (
              <div style={{ padding: "2rem", textAlign: "center", background: "rgba(212,175,55,0.1)", border: "1px solid var(--color-gold)", borderRadius: "8px", color: "var(--color-gold)" }}>
                <h2 style={{ fontFamily: "var(--font-cinzel)" }}>Auction Closed</h2>
                <p>Pemenang: {winner?.winnerId || "Tidak ada pemenang"}</p>
                <p>Harga Akhir: {winner?.finalPrice?.toLocaleString("id-ID") || currentPrice.toLocaleString("id-ID")} CC</p>
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} style={{ marginTop: "2rem" }}>
                <style>{`
                  input[type="number"]::-webkit-inner-spin-button,
                  input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                  input[type="number"] {
                    -moz-appearance: textfield;
                  }
                `}</style>
                <div style={{ background: "rgba(0,0,0,0.4)", padding: "2rem 1.5rem", borderRadius: "12px", border: "1px solid var(--color-border)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem" }}>
                    <span style={{ color: "var(--color-gold)", fontSize: "0.95rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {isDescending ? "Buy Now Price" : (isPhantom ? "Set Max Shadow Limit" : "Set Your Bid")}
                    </span>
                    {!isDescending && <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Min. Jump: +{auction.minimumIncrement}</span>}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    {!isDescending && (
                      <button type="button" onClick={handleDecrease} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", width: "55px", height: "55px", borderRadius: "8px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Minus size={22} />
                      </button>
                    )}
                    
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={minBid}
                      step={isDescending ? 1 : auction.minimumIncrement}
                      disabled={isDescending}
                      style={{ flex: 1, height: "55px", textAlign: "center", fontSize: "1.8rem", fontFamily: "var(--font-cinzel)", fontWeight: "bold", background: "rgba(0,0,0,0.3)", border: "1px solid var(--color-gold)", color: "var(--color-gold)", borderRadius: "8px", outline: "none", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}
                    />

                    {!isDescending && (
                      <button type="button" onClick={handleIncrease} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", width: "55px", height: "55px", borderRadius: "8px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Plus size={22} />
                      </button>
                    )}
                  </div>

                  {!isDescending && (
                    <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", background: "rgba(201,168,76,0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px dashed rgba(201,168,76,0.3)" }}>
                      <input 
                        type="checkbox" 
                        id="phantom-bid" 
                        checked={isPhantom}
                        onChange={(e) => setIsPhantom(e.target.checked)}
                        style={{ width: "20px", height: "20px", accentColor: "var(--color-gold)", cursor: "pointer" }}
                      />
                      <label htmlFor="phantom-bid" style={{ color: "var(--color-gold)", fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>
                        Enable Shadow Pledge (Auto-Bid)
                      </label>
                    </div>
                  )}

                  <button type="submit" className="primary-action" disabled={!currentUser} style={{ width: "100%", padding: "1.25rem", fontSize: "1.1rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", background: isPhantom ? "linear-gradient(45deg, #111, #333)" : undefined, border: isPhantom ? "1px solid var(--color-gold)" : undefined, borderRadius: "8px" }}>
                    {isPhantom ? "Set Shadow Pledge" : "Place Bid"} <Gavel size={22} />
                  </button>
                  
                  {!currentUser && (
                    <p style={{ textAlign: "center", color: "var(--color-danger)", fontSize: "0.9rem", marginTop: "1rem", fontWeight: "bold", padding: "0.5rem", background: "rgba(220,38,38,0.1)", borderRadius: "4px" }}>
                      ⚠️ Anda harus login untuk memasang penawaran.
                    </p>
                  )}
                </div>
              </form>
            )}

            {!isSealed && (
              <div style={{ marginTop: "2rem" }}>
                <h4 style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Recent Activity</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.5rem" }}>
                  {displayBids.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "1rem", fontStyle: "italic" }}>Belum ada penawaran.</p>
                  ) : (
                    displayBids.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: "1rem", background: i === 0 ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.05)", padding: "1rem", borderRadius: "8px", borderLeft: "3px solid var(--color-gold)", transition: "background 0.25s ease" }}>
                        <div className={b.activeCoatFrame ? "profile-frame-container" : ""} data-effect={b.activeCoatFrame} style={{ width: "40px", height: "40px", flexShrink: 0, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--color-border)" }}>
                          <img src={b.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + b.username} alt={b.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span className={b.activeNameEffect ? "profile-name" : ""} data-effect={b.activeNameEffect} style={{ fontWeight: "bold", color: "var(--color-ivory)", fontSize: "0.95rem" }}>{b.username}</span>
                              <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "rgba(255,255,255,0.1)", borderRadius: "4px", color: "var(--color-gold)" }}>{b.rank}</span>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{new Date(b.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div style={{ color: "var(--color-gold)", fontWeight: "bold", fontSize: "1.1rem" }}>
                            Placed a bid: {b.amount.toLocaleString("id-ID")} CC
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </AnimatedSection>

      </div>
    </main>
  );
}
