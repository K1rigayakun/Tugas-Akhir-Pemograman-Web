"use client";

import { useState } from "react";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/v1/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.accessToken);
        router.push("/");
      } else {
        setError(data.message || "Kredensial tidak valid.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2.5rem",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, var(--color-emerald), #6ee7b7)"
        }} />

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "rgba(34, 197, 94, 0.1)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--color-emerald)"
          }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-ivory)", marginBottom: "0.5rem" }}>
            Praetorian Console
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Otorisasi Super Admin diperlukan
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--color-danger)",
            padding: "0.75rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email Administratif
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="theemperor@emerald.com"
                required
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem 0.875rem 2.75rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-ivory)",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-emerald)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Kata Sandi
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem 0.875rem 2.75rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-ivory)",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-emerald)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.875rem",
              background: "var(--color-emerald)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              transition: "opacity 0.2s",
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => { if(!isLoading) e.currentTarget.style.opacity = "0.9" }}
            onMouseLeave={(e) => { if(!isLoading) e.currentTarget.style.opacity = "1" }}
          >
            {isLoading ? "Otentikasi..." : (
              <>
                Akses Console <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
