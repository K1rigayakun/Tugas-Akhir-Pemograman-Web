"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { postApi } from "../../lib/api";
import { verifyEmailAction } from "../actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"register" | "verify">("register");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get("email"));
    try {
      const result = await postApi<{ message: string; devOtp?: string }>("/auth/register", {
        email: value,
        password: form.get("password"),
        confirmPassword: form.get("confirmPassword"),
      });
      setEmail(value);
      setStage("verify");
      setMessage(result.devOtp ? `${result.message} Development OTP: ${result.devOtp}` : result.message);
      setError(false);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Registrasi gagal.");
      setError(true);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const result = await verifyEmailAction(email, formData);
      if (result.success) {
        router.push("/kyc");
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
      <PageHeading eyebrow="The Oath of Entry" title={stage === "register" ? "Join the Emerald Kingdom" : "Verify Your Seal"} description="Buat akun, verifikasi email, lalu lengkapi identitas sebelum mengikuti lelang." />
      <AnimatedSection delay={200}>
        <form className="panel form-panel form-stack" onSubmit={stage === "register" ? register : verify}>
          {stage === "register" ? <>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" minLength={8} required /></label>
            <label>Konfirmasi password<input name="confirmPassword" type="password" minLength={8} required /></label>
          </> : <label>Kode OTP 6 digit<input name="otp" inputMode="numeric" minLength={6} maxLength={6} required /></label>}
          {message && <p className={`status-message ${error ? "error" : ""}`}>{message}</p>}
          <button className="primary-action">{stage === "register" ? "Create account" : "Verify email"}</button>
        </form>
      </AnimatedSection>
    </main>
  );
}
