"use client";

import { FormEvent, useState } from "react";
import PageHeading from "../../components/PageHeading";
import { API_URL, postApi } from "../../lib/api";

export default function KycPage() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const token = () => typeof window === "undefined" ? "" : localStorage.getItem("accessToken") || "";

  async function submitJson(event: FormEvent<HTMLFormElement>, path: string, next: number) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await postApi(path, values, token());
      setStep(next);
      setMessage("Langkah tersimpan.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Langkah gagal disimpan.");
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/kyc/step-3`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: new FormData(event.currentTarget),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Upload gagal.");
      setStep(4);
      setMessage("Dokumen tersimpan.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Upload gagal.");
    }
  }

  async function finish() {
    try {
      await postApi("/kyc/submit", { agreedToTerms: true, agreedToPrivacy: true, confirmedAge: true }, token());
      setStep(5);
      setMessage("KYC berhasil diajukan dan sedang menunggu review.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Submit gagal.");
    }
  }

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Seal of Identity" title="Identity Verification" description="Lengkapi empat langkah KYC untuk membuka bid, top up, dan Royal Market." />
      <div className="step-track">{[1, 2, 3, 4].map((value) => <span key={value} className={step >= value ? "active" : ""}>{value}</span>)}</div>
      {message && <p className="status-message form-panel">{message}</p>}
      {step === 1 && <form className="panel form-panel form-stack" onSubmit={(event) => submitJson(event, "/kyc/step-1", 2)}>
        <label>Nama lengkap<input name="fullName" required /></label>
        <label>NIK 16 digit<input name="nationalId" inputMode="numeric" minLength={16} maxLength={16} required /></label>
        <label>Tanggal lahir<input name="dateOfBirth" type="date" required /></label>
        <label>Nomor telepon<input name="phoneNumber" required /></label>
        <button className="primary-action">Continue</button>
      </form>}
      {step === 2 && <form className="panel form-panel form-stack" onSubmit={(event) => submitJson(event, "/kyc/step-2", 3)}>
        <label>Alamat<textarea name="streetAddress" required /></label>
        <label>Kota<input name="city" required /></label>
        <label>Provinsi<input name="province" required /></label>
        <label>Kode pos<input name="postalCode" minLength={5} maxLength={5} required /></label>
        <button className="primary-action">Continue</button>
      </form>}
      {step === 3 && <form className="panel form-panel form-stack" onSubmit={upload}>
        <label>Foto KTP<input name="idDocument" type="file" accept=".jpg,.jpeg,.png,.pdf" required /></label>
        <label>Selfie dengan KTP<input name="selfieWithDocument" type="file" accept=".jpg,.jpeg,.png" required /></label>
        <button className="primary-action">Upload documents</button>
      </form>}
      {step === 4 && <section className="panel form-panel form-stack"><h2>Royal Declaration</h2><p>Saya menyetujui syarat layanan, kebijakan privasi, dan mengonfirmasi usia minimal 18 tahun.</p><button className="primary-action" onClick={finish}>Submit KYC</button></section>}
      {step === 5 && <section className="panel form-panel"><h2>Submission received</h2><p>Tim KYC akan melakukan review manual. Status akan dikirim melalui notifikasi.</p></section>}
    </main>
  );
}
