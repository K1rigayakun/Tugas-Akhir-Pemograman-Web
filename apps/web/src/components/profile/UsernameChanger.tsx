"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../lib/api";

interface UsernameChangerProps {
  currentUsername: string;
}

export default function UsernameChanger({ currentUsername }: UsernameChangerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
    setNewUsername("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/auth/me/change-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newUsername })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan.");
      }

      setSuccessMsg("Username berhasil diubah! Sesi akan diperbarui...");
      
      // Delay before reload to let user read the message
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
      <input 
        type="text" 
        value={currentUsername} 
        disabled 
        style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.8rem 1rem", borderRadius: "8px", color: "rgba(255,255,255,0.5)", cursor: "not-allowed" }}
      />
      <button 
        onClick={handleOpen}
        style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: 600, display: "flex", alignItems: "center", cursor: "pointer", transition: "all 0.2s" }}
        onMouseOver={(e) => e.currentTarget.style.background = "rgba(201,168,76,0.2)"}
        onMouseOut={(e) => e.currentTarget.style.background = "rgba(201,168,76,0.1)"}
      >
        Edit Name
      </button>

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: "linear-gradient(180deg, rgba(20,25,30,0.95) 0%, rgba(10,15,18,0.95) 100%)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "15px",
            padding: "2.5rem",
            width: "90%",
            maxWidth: "450px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            position: "relative"
          }}>
            <button 
              onClick={handleClose}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "1.5rem", cursor: "pointer" }}
            >
              &times;
            </button>

            <h2 style={{ fontFamily: "var(--font-cinzel, serif)", color: "#c9a84c", marginTop: 0, marginBottom: "1rem" }}>
              Change Username
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
              Mengubah username membutuhkan <strong>500 CC</strong>. Silakan masukkan nama baru yang kamu inginkan (3-20 karakter, hanya huruf, angka, dan underscore).
            </p>

            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New Username"
                autoFocus
                disabled={isLoading || !!successMsg}
                style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "8px", color: "#fff", marginBottom: "1rem", fontSize: "1rem" }}
              />

              {errorMsg && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem", background: "rgba(239,68,68,0.1)", padding: "0.8rem", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ color: "#10b981", fontSize: "0.85rem", marginBottom: "1rem", background: "rgba(16,185,129,0.1)", padding: "0.8rem", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
                  {successMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || !!successMsg}
                style={{ 
                  width: "100%", 
                  background: "linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #fde68a 100%)", 
                  color: "#000", 
                  border: "none", 
                  padding: "1rem", 
                  borderRadius: "8px", 
                  fontWeight: 700, 
                  fontSize: "1rem", 
                  cursor: (isLoading || !!successMsg) ? "not-allowed" : "pointer", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  opacity: (isLoading || !!successMsg) ? 0.7 : 1
                }}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Pay 500 CC & Change"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
