"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeading from "../../components/PageHeading";
import { postApi } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await postApi<{ accessToken: string; refreshToken: string }>("/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
      });
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      setMessage("Login berhasil.");
      setError(false);
      router.push("/auction");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Login gagal.");
      setError(true);
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Gates of the Imperium" title="Return to Your Realm" description="Masuk untuk mengelola bid, wallet, achievement, dan notifikasi." />
      <form className="panel form-panel form-stack" onSubmit={submit}>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={8} required /></label>
        {message && <p className={`status-message ${error ? "error" : ""}`}>{message}</p>}
        <button className="primary-action">Login</button>
        <p>Belum punya akun? <Link className="text-link" href="/register">Daftar di sini</Link></p>
      </form>
    </main>
  );
}
