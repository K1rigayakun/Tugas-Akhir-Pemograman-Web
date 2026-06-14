"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { loginAction, setup2faAction, verify2faAction } from "../actions/auth";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [step, setStep] = useState<"login" | "2fa_setup" | "2fa_verify">("login");
  const [tempToken, setTempToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const result = await loginAction(formData);
      if (result.requires2fa) {
        setTempToken(result.tempToken);
        setMessage(result.message || "Silakan lanjutkan 2FA.");
        setError(false);
        if (result.requires2faSetup) {
          setQrCodeUrl(result.qrCodeUrl);
          setSecret(result.secret);
          setStep("2fa_setup");
        } else {
          setStep("2fa_verify");
        }
      } else if (result.success) {
        setMessage("Login berhasil.");
        setError(false);
        router.push("/auction");
      } else {
        setMessage(result.message || "Login gagal.");
        setError(true);
      }
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Terjadi kesalahan.");
      setError(true);
    }
  }

  async function submit2fa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = formData.get("code") as string;
    
    try {
      const action = step === "2fa_setup" ? setup2faAction : verify2faAction;
      const result = await action(tempToken, code);
      
      if (result.success) {
        setMessage("Verifikasi berhasil.");
        setError(false);
        router.push("/auction");
      } else {
        setMessage(result.message || "Verifikasi gagal.");
        setError(true);
      }
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Terjadi kesalahan.");
      setError(true);
    }
  }

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Gates of the Imperium" title="Return to Your Realm" description="Masuk untuk mengelola bid, wallet, achievement, dan notifikasi." />
      <AnimatedSection delay={200}>
        {step === "login" && (
          <form className="panel form-panel form-stack" onSubmit={submit}>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" minLength={8} required /></label>
            {message && <p className={`status-message ${error ? "error" : ""}`}>{message}</p>}
            <button className="primary-action">Login</button>
            <p>Belum punya akun? <Link className="text-link" href="/register">Daftar di sini</Link></p>
          </form>
        )}

        {step === "2fa_setup" && (
          <form className="panel form-panel form-stack" onSubmit={submit2fa}>
            <h2>Setup Double Verification</h2>
            <p>Scan QR Code ini menggunakan aplikasi Google Authenticator atau Authy.</p>
            {qrCodeUrl && (
              <div style={{ textAlign: "center", margin: "1rem 0", background: "white", padding: "1rem", borderRadius: "8px", display: "inline-block" }}>
                <Image src={qrCodeUrl} alt="QR Code 2FA" width={200} height={200} />
              </div>
            )}
            <p>Atau masukkan kunci ini secara manual: <strong>{secret}</strong></p>
            <label>Kode Authenticator (6 digit)<input name="code" type="text" inputMode="numeric" minLength={6} maxLength={6} required /></label>
            {message && <p className={`status-message ${error ? "error" : ""}`}>{message}</p>}
            <button className="primary-action">Verifikasi & Login</button>
          </form>
        )}

        {step === "2fa_verify" && (
          <form className="panel form-panel form-stack" onSubmit={submit2fa}>
            <h2>Double Verification</h2>
            <p>Masukkan kode 6 digit dari aplikasi Authenticator Anda.</p>
            <label>Kode Authenticator<input name="code" type="text" inputMode="numeric" minLength={6} maxLength={6} required autoFocus /></label>
            {message && <p className={`status-message ${error ? "error" : ""}`}>{message}</p>}
            <button className="primary-action">Verifikasi & Login</button>
          </form>
        )}
      </AnimatedSection>
    </main>
  );
}
