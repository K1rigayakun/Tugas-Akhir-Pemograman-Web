"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "../../../../lib/api";
import { Loader2, Mic, MicOff, Video, VideoOff, Settings, AlertTriangle, Users } from "lucide-react";
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCClient } from "agora-rtc-sdk-ng";

export default function AdminLiveBroadcast() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAuction();
    return () => {
      leaveChannel();
    };
  }, [id]);

  const loadAuction = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/v1/admin/auctions`);
      const data = await res.json();
      if (res.ok) {
        const found = data.data.find((a: any) => a.id === id);
        if (found) setAuction(found);
        else setError("Lelang tidak ditemukan");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initAgora = async () => {
    try {
      // 1. Get Token from backend
      const tokenRes = await fetchWithAuth(`/v1/live-auction/${id}/token?role=host`);
      const tokenData = await tokenRes.json();
      
      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error || "Gagal mendapatkan token Agora");
      }

      // 2. Init Client
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      setAgoraClient(client);

      // Set client role to host
      await client.setClientRole("host");

      // 3. Join Channel
      await client.join(tokenData.appId, tokenData.channel, tokenData.token, tokenData.uid);
      setIsJoined(true);

      // 4. Create Local Tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // 5. Play Video
      if (videoContainerRef.current) {
        videoTrack.play(videoContainerRef.current);
      }

      // 6. Publish
      await client.publish([audioTrack, videoTrack]);
      
    } catch (err: any) {
      console.error(err);
      setError("Gagal memulai streaming: " + err.message);
      setIsJoined(false);
    }
  };

  const leaveChannel = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    if (agoraClient) {
      await agoraClient.leave();
    }
    setIsJoined(false);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
  };

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(micEnabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setMuted(cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    }
  };

  const startAuction = async () => {
    try {
      await fetchWithAuth(`/v1/live-auction/${id}/start`, { method: "POST" });
      alert("Lelang berhasil dimulai!");
      loadAuction(); // Refresh status
    } catch (err: any) {
      alert("Gagal memulai lelang: " + err.message);
    }
  };

  const endAuction = async () => {
    if (!confirm("Yakin ingin mengakhiri lelang ini?")) return;
    try {
      await fetchWithAuth(`/v1/live-auction/${id}/end`, { method: "POST" });
      alert("Lelang berhasil diakhiri!");
      leaveChannel();
      router.push("/auctions");
    } catch (err: any) {
      alert("Gagal mengakhiri lelang: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: "3rem", color: "var(--color-gold)" }}>Memuat data lelang...</div>;
  if (error) return <div style={{ padding: "3rem", color: "var(--color-danger)" }}>{error}</div>;

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "#ef4444" }}>
            <span style={{ animation: "pulse 1.5s infinite" }}>🔴 LIVE STUDIO</span>
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Mempersiapkan siaran langsung untuk: <span style={{ color: "var(--color-gold)", fontWeight: "bold" }}>{auction?.title}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {auction?.status === "UPCOMING" && (
            <button onClick={startAuction} style={{ padding: "0.6rem 1.25rem", background: "var(--color-success)", color: "#000", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
              Start Auction Bidding
            </button>
          )}
          {auction?.status === "ACTIVE" && (
            <button onClick={endAuction} style={{ padding: "0.6rem 1.25rem", background: "var(--color-danger)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
              End Auction & Broadcast
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        
        {/* Kolom Kiri: Video & Kontrol */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#000", position: "relative", height: "450px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isJoined ? (
              <div ref={videoContainerRef} style={{ width: "100%", height: "100%" }} />
            ) : (
              <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                <VideoOff size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                <p>Kamera belum aktif. Mulai streaming untuk terhubung ke Agora.</p>
                <button onClick={initAgora} style={{ marginTop: "1.5rem", padding: "0.6rem 2rem", background: "var(--color-gold)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                  Mulai Kamera & Mikrofon
                </button>
              </div>
            )}
            
            {isJoined && (
              <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(0,0,0,0.6)", padding: "0.4rem 0.8rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-ivory)", fontSize: "0.85rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite" }} />
                LIVE
              </div>
            )}
            {isJoined && (
              <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.6)", padding: "0.4rem 0.8rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-info)", fontSize: "0.85rem" }}>
                <Users size={14} /> {viewerCount} Viewers
              </div>
            )}
          </div>
          
          <div style={{ padding: "1rem", display: "flex", justifyContent: "center", gap: "1rem", background: "var(--color-bg)" }}>
            <button onClick={toggleMic} disabled={!isJoined} style={{ width: "48px", height: "48px", borderRadius: "50%", background: micEnabled ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.2)", border: `1px solid ${micEnabled ? 'var(--color-border)' : '#ef4444'}`, color: micEnabled ? "var(--color-ivory)" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: !isJoined ? 0.5 : 1 }}>
              {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={toggleCamera} disabled={!isJoined} style={{ width: "48px", height: "48px", borderRadius: "50%", background: cameraEnabled ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.2)", border: `1px solid ${cameraEnabled ? 'var(--color-border)' : '#ef4444'}`, color: cameraEnabled ? "var(--color-ivory)" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: !isJoined ? 0.5 : 1 }}>
              {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button disabled style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "not-allowed" }}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Teleprompter / Status */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--color-gold)", marginBottom: "1.5rem", fontSize: "1.2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
            Teleprompter & Info
          </h3>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Harga Saat Ini</p>
            <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", color: "var(--color-gold)", fontWeight: 700 }}>
              ♛ {auction?.currentPrice?.toLocaleString("id-ID") || 0}
            </p>
          </div>

          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "0.85rem", color: "var(--color-ivory)", marginBottom: "0.5rem" }}>Skrip Deskripsi Barang:</h4>
            <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>
              "{auction?.description || 'Baca deskripsi barang di sini untuk menarik perhatian para Sultan...'}"
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: "0.8rem", color: "var(--color-ivory)", lineHeight: 1.5 }}>
              Harap berinteraksi dengan bidder secara langsung. Ingatkan mereka jika waktu tersisa sedikit. Anti-snipe akan aktif otomatis.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
