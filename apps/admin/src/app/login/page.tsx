"use client";

import { useState } from "react";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminAuthService } from "../../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"login" | "2fa_setup" | "2fa_verify">("login");
  const [tempToken, setTempToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await AdminAuthService.login(email, password);

      // Login berhasil — cek apakah butuh 2FA
      if ("requires2fa" in data && data.requires2fa) {
        setTempToken(data.tempToken || "");
        if (data.requires2faSetup) {
          setQrCodeUrl(data.qrCodeUrl || "");
          setSecret(data.secret || "");
          setStep("2fa_setup");
        } else {
          setStep("2fa_verify");
        }
        return;
      }

      // Login langsung berhasil (tanpa 2FA)
      if ("accessToken" in data && data.accessToken) {
        router.push("/");
        return;
      }

      setError("Respon login tidak valid.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = step === "2fa_setup"
        ? await AdminAuthService.setup2FA(tempToken, code)
        : await AdminAuthService.verify2FA(tempToken, code);

      if ("accessToken" in data && data.accessToken) {
        router.push("/");
        return;
      }

      setError("Respon verifikasi tidak valid.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem 1rem 0.875rem 2.75rem",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    color: "var(--color-ivory)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const buttonStyle: React.CSSProperties = {
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
    opacity: isLoading ? 0.7 : 1,
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
            {step === "login" ? "Praetorian Console" : "Double Verification"}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            {step === "login"
              ? "Otorisasi Super Admin diperlukan"
              : step === "2fa_setup"
              ? "Setup Authenticator untuk mengamankan akun"
              : "Masukkan kode dari Authenticator App"}
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

        {step === "login" && (
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
                  placeholder="admin@emeraldkingdom.id"
                  required
                  style={inputStyle}
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
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-emerald)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={buttonStyle}
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
        )}

        {step === "2fa_setup" && (
          <form onSubmit={handle2fa} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {qrCodeUrl && (
              <div style={{ textAlign: "center", margin: "0 auto", background: "white", padding: "1rem", borderRadius: "8px", display: "inline-block" }}>
                <img src={qrCodeUrl} alt="QR Code 2FA" width={180} height={180} />
              </div>
            )}
            {secret && (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", textAlign: "center", wordBreak: "break-all" }}>
                Kunci manual: <strong style={{ color: "var(--color-emerald)" }}>{secret}</strong>
              </p>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Kode Authenticator (6 digit)
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  minLength={6}
                  maxLength={6}
                  required
                  autoFocus
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-emerald)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? "Memverifikasi..." : "Verifikasi & Login"}
            </button>
          </form>
        )}

        {step === "2fa_verify" && (
          <form onSubmit={handle2fa} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Kode Authenticator (6 digit)
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  minLength={6}
                  maxLength={6}
                  required
                  autoFocus
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-emerald)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? "Memverifikasi..." : "Verifikasi & Login"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
