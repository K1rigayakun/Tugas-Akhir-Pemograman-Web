"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function EmperorAscension() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<{ username: string; message: string } | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3001";
    const socket = io(`${socketUrl}/notifications`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("global_announcement", (res: any) => {
      const { type, payload } = res.data || {};
      if (type === "EMPEROR_ASCENSION" || res.message === "EMPEROR_ASCENSION") {
        const announcementData = payload || res.data;
        setData({
          username: announcementData.username || "Unknown",
          message: announcementData.message || "A New Emperor Rises!"
        });
        setShow(true);
        setTimeout(() => setShow(false), 15000); // Tampilkan selama 15 detik
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!show || !data) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 1s ease-out"
    }}>
      <div style={{ textAlign: "center", maxWidth: "800px", padding: "2rem" }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "4rem",
          color: "var(--color-gold)",
          textShadow: "0 0 30px rgba(212,175,55,0.8), 0 0 10px rgba(212,175,55,0.5)",
          margin: "0 0 1rem 0",
          animation: "scaleUp 1s ease-out, glowPulse 2s infinite alternate"
        }}>
          ALL HAIL THE EMPEROR
        </h1>
        
        <div style={{ 
          margin: "2rem auto",
          width: "150px", height: "150px",
          borderRadius: "50%",
          background: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.username + "')",
          border: "4px solid var(--color-gold)",
          boxShadow: "0 0 40px var(--color-gold)",
          animation: "float 3s ease-in-out infinite"
        }} />

        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "2.5rem",
          color: "var(--color-ivory)",
          marginBottom: "1rem"
        }}>
          {data.username}
        </h2>

        <p style={{
          fontSize: "1.2rem",
          color: "var(--color-gold-dim)",
          lineHeight: 1.6,
          fontStyle: "italic"
        }}>
          {data.message}
        </p>

        <button 
          onClick={() => setShow(false)}
          style={{
            marginTop: "3rem",
            padding: "0.8rem 2.5rem",
            background: "transparent",
            border: "1px solid var(--color-gold)",
            color: "var(--color-gold)",
            borderRadius: "30px",
            cursor: "pointer",
            fontFamily: "'Cinzel', serif",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-gold)"; e.currentTarget.style.color = "#000"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-gold)"; }}
        >
          Tunduk
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          from { text-shadow: 0 0 20px rgba(212,175,55,0.5); }
          to { text-shadow: 0 0 40px rgba(212,175,55,1), 0 0 15px rgba(255,255,255,0.8); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}
