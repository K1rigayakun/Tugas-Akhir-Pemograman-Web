"use client";

import { useEffect, useState, useRef } from "react";
import { useLiveAuction } from "../../../hooks/useLiveAuction";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { Clock, MessageSquare, Send, Gavel, Eye, AlertTriangle } from "lucide-react";
import AgoraRTC, { IAgoraRTCClient, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import { fetchWithAuth } from "../../../lib/api";

export default function LiveRoom({ 
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
    placeBid
  } = useLiveAuction(auction.id, currentUser?.id, currentUser?.rank);

  const [bidAmount, setBidAmount] = useState(auction.currentPrice + auction.minimumIncrement);
  const [timeLeft, setTimeLeft] = useState("");
  const [timerExtended, setTimerExtended] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (auction.status === "ACTIVE" && currentUser && !isJoined) {
      initAgora();
    }
    return () => {
      leaveAgora();
    };
  }, [auction.status, currentUser]);

  const initAgora = async () => {
    try {
      const res = await fetchWithAuth(`/v1/live-auction/${auction.id}/token?role=audience`);
      const tokenData = await res.json();
      if (!res.ok || tokenData.error) return;

      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      setAgoraClient(client);

      await client.setClientRole("audience");

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && videoContainerRef.current) {
          user.videoTrack?.play(videoContainerRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      await client.join(tokenData.appId, tokenData.channel, tokenData.token, tokenData.uid);
      setIsJoined(true);
    } catch (err) {
      console.error("Agora error:", err);
    }
  };

  const leaveAgora = async () => {
    if (agoraClient) {
      await agoraClient.leave();
      setIsJoined(false);
    }
  };

  useEffect(() => {
    setCurrentPrice(auction.currentPrice);
    setEndTime(auction.endTime);
  }, [auction, setCurrentPrice, setEndTime]);

  useEffect(() => {
    if (!endTime) return;
    if (new Date(endTime).getTime() > new Date(auction.endTime).getTime()) {
      setTimerExtended(true);
      setTimeout(() => setTimerExtended(false), 5000);
    }
    
    const interval = setInterval(() => {
      const ms = new Date(endTime).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft("Berakhir");
        clearInterval(interval);
      } else {
        const s = Math.floor((ms / 1000) % 60);
        const m = Math.floor((ms / 1000 / 60) % 60);
        const h = Math.floor((ms / 1000 / 60 / 60) % 24);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, auction.endTime]);

  // Scroll to bottom of chat when new bid arrives
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [bids]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Silakan login untuk melakukan bid.");
    if (bidAmount < currentPrice + auction.minimumIncrement) {
      return alert("Bid harus lebih besar dari harga minimum!");
    }
    placeBid(bidAmount, currentUser.username);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    // In a real app, send chat via socket. For now, alert or mock.
    alert("Fitur chat live akan mengarah ke socket. Message: " + chatMessage);
    setChatMessage("");
  };

  const displayBids = [...bids, ...initialBids].reverse(); // oldest top, newest bottom for chat style

  return (
    <main style={{ minHeight: "100vh", background: "#050505", paddingTop: "80px" }}>
      {/* Live Header Bar */}
      <div style={{ background: "linear-gradient(90deg, #450a0a, #000)", padding: "1rem 2rem", borderBottom: "2px solid var(--color-gold)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ background: "var(--color-danger)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", marginRight: "1rem", animation: "pulse 1.5s infinite" }}>LIVE NOW</span>
          <span style={{ color: "var(--color-ivory)", fontSize: "1.1rem", fontFamily: "var(--font-cinzel)", fontWeight: "bold" }}>The Imperial Auction Event</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-emerald)" }}>
            <Eye size={18} /> {viewerCount} Watching
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold)", fontWeight: "bold", background: "rgba(212,175,55,0.1)", padding: "0.5rem 1rem", borderRadius: "20px" }}>
            <Clock size={18} /> {timeLeft}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "70% 30%", height: "calc(100vh - 140px)" }}>
        
        {/* KOLOM KIRI (70%): Video & Deskripsi (Scroll) */}
        <div style={{ padding: "2rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Video Player Placeholder / Agora Feed */}
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", borderRadius: "12px", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
            {agoraClient && isJoined ? (
              <div ref={videoContainerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
            ) : (
              <>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "url('https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=1200&q=80') center/cover", opacity: 0.7 }}></div>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  {/* Host Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <img 
                      src="https://picsum.photos/100/100?random=host" 
                      alt="Auctioneer" 
                      style={{ width: "50px", height: "50px", borderRadius: "50%", border: "2px solid var(--color-emerald)", objectFit: "cover" }} 
                    />
                    <div>
                      <div style={{ color: "var(--color-ivory)", fontWeight: "bold" }}>Official Auctioneer</div>
                      <div style={{ color: "var(--color-emerald)", fontSize: "0.8rem" }}>Emerald Kingdom Host</div>
                    </div>
                  </div>
                  <div style={{ display: "inline-block", background: "rgba(0,0,0,0.6)", padding: "1rem 2rem", borderRadius: "30px", backdropFilter: "blur(5px)", border: "1px solid var(--color-gold)" }}>
                    <span style={{ color: "var(--color-ivory)", fontFamily: "var(--font-cinzel)", fontSize: "1.5rem" }}>Live Presenter Feed</span>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      {auction.status === "ACTIVE" ? "Menghubungkan ke siaran..." : "(Siaran belum dimulai)"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Old Scroll UI for Item Description */}
          <div style={{ 
            background: "#fdfbf7", 
            backgroundImage: "radial-gradient(#e6e1d1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            padding: "3rem", 
            borderRadius: "4px", 
            color: "#2c2214",
            boxShadow: "inset 0 0 50px rgba(139, 115, 85, 0.5), 0 10px 20px rgba(0,0,0,0.5)",
            border: "1px solid #d4c4a8",
            position: "relative"
          }}>
            {/* Scroll Decoration (Torn edges / burns could be CSS pseudo-elements) */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "10px", background: "linear-gradient(to right, #d4c4a8, #8b7355, #d4c4a8)" }}></div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "10px", background: "linear-gradient(to right, #d4c4a8, #8b7355, #d4c4a8)" }}></div>

            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
              {auction.imageUrls?.[0] && (
                <img src={auction.imageUrls[0]} alt={auction.title} style={{ width: "200px", height: "200px", objectFit: "cover", border: "5px solid #4a3b2c", boxShadow: "5px 5px 15px rgba(0,0,0,0.3)" }} />
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: "2.5rem", color: "#4a3b2c", margin: "0 0 1rem 0", borderBottom: "2px solid #8b7355", paddingBottom: "0.5rem" }}>
                  {auction.title}
                </h2>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", fontFamily: "var(--font-lato)", fontWeight: "bold" }}>
                  <div>
                    <span style={{ display: "block", color: "#8b7355", fontSize: "0.85rem", textTransform: "uppercase" }}>Starting Bid</span>
                    <span style={{ fontSize: "1.5rem", color: "#2c2214" }}>{auction.startingPrice.toLocaleString("id-ID")} CC</span>
                  </div>
                  <div>
                    <span style={{ display: "block", color: "#8b7355", fontSize: "0.85rem", textTransform: "uppercase" }}>Rarity</span>
                    <span style={{ fontSize: "1.2rem", color: "#2c2214" }}>{auction.rarity}</span>
                  </div>
                </div>
                <p style={{ fontFamily: "var(--font-lato)", lineHeight: "1.8", fontSize: "1.1rem", color: "#3a2d1d" }}>
                  {auction.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (30%): Chat & Bid */}
        <div style={{ background: "#0a0f12", borderLeft: "1px solid var(--color-border)", display: "flex", flexDirection: "column", height: "100%" }}>
          
          {/* Header Harga Tertinggi */}
          <div style={{ padding: "1.5rem", textAlign: "center", borderBottom: "1px solid var(--color-border)", background: "linear-gradient(180deg, rgba(201,168,76,0.1) 0%, transparent 100%)" }}>
            <h3 style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Current Highest Bid</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--color-gold)", margin: "0.5rem 0", fontFamily: "var(--font-cinzel)", textShadow: "0 0 15px rgba(212,175,55,0.3)" }}>
              {currentPrice.toLocaleString("id-ID")} CC
            </div>
            {timerExtended && (
              <div style={{ color: "var(--color-gold)", animation: "pulse 1s infinite", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                <AlertTriangle size={14} /> Time Extended (Anti-Sniping)
              </div>
            )}

            {outbidMessage && (
              <button
                type="button"
                onClick={clearOutbidMessage}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  padding: "0.75rem",
                  background: "rgba(139, 26, 26, 0.28)",
                  border: "1px solid rgba(239, 68, 68, 0.55)",
                  borderRadius: "6px",
                  color: "#fecaca",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Anda telah di-outbid. {outbidMessage}
              </button>
            )}
            
            {isEnded && (
              <div style={{ marginTop: "1rem", padding: "0.5rem", background: "var(--color-danger)", color: "#fff", borderRadius: "4px", fontWeight: "bold" }}>
                AUCTION CLOSED. WINNER: {winner?.winnerId || "-"}
              </div>
            )}
          </div>

          {/* Live Feed (Chat + Bid History) */}
          <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "0.2rem 0.8rem", borderRadius: "10px", color: "var(--color-text-muted)" }}>
                Room Opened
              </span>
            </div>

            {displayBids.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", background: i === displayBids.length - 1 ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.05)", padding: "0.8rem 1rem", borderRadius: "8px", borderLeft: "3px solid var(--color-gold)", transition: "background 0.25s ease" }}>
                {/* Avatar with optional frame */}
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
            ))}
          </div>

          {/* Footer Input Area */}
          {!isEnded && (
            <div style={{ padding: "1.5rem", borderTop: "1px solid var(--color-border)", background: "rgba(0,0,0,0.5)" }}>
              
              {/* Tab Bid */}
              <div style={{ marginBottom: "1rem" }}>
                <form onSubmit={handleBidSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontWeight: "bold" }}>CC</span>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={currentPrice + auction.minimumIncrement}
                      step={auction.minimumIncrement}
                      style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", background: "#000", border: "1px solid var(--color-gold)", color: "var(--color-gold)", borderRadius: "8px", fontSize: "1.2rem", fontWeight: "bold" }}
                    />
                  </div>
                  <button type="submit" disabled={!currentUser} style={{ background: "linear-gradient(45deg, #b45309, #d97706)", border: "none", color: "#fff", padding: "0 1.5rem", borderRadius: "8px", fontWeight: "bold", cursor: currentUser ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    Bid <Gavel size={18} style={{ marginLeft: "0.5rem" }} />
                  </button>
                </form>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem", textAlign: "right" }}>
                  Minimum Increment: +{auction.minimumIncrement.toLocaleString("id-ID")} CC
                </div>
              </div>

              {/* Tab Chat */}
              <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Kirim pesan di live chat..."
                  style={{ flex: 1, padding: "0.8rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "20px", fontSize: "0.9rem" }}
                />
                <button type="submit" style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0 0.5rem" }}>
                  <Send size={20} />
                </button>
              </form>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}
