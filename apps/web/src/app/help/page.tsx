"use client";

import { useMemo, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";

const faqs = [
  ["Registrasi & KYC", "Mengapa KYC wajib?", "KYC melindungi peserta lelang, memastikan satu identitas untuk satu akun, dan wajib sebelum bid atau top up."],
  ["Sistem Lelang", "Bagaimana cara memasang bid?", "Buka detail lelang aktif, masukkan nominal di atas harga saat ini dan minimum increment, lalu konfirmasi."],
  ["Wallet & Top Up", "Apa itu Crown Coin?", "Crown Coin adalah saldo internal yang dipakai untuk bid dan pembelian cosmetic."],
  ["Rank & Achievement", "Bagaimana cara naik rank?", "Kumpulkan EXP dari bid, kemenangan, quest, dan achievement. Rank tinggi membuka lelang eksklusif."],
  ["Cosmetic & Shop", "Apakah cosmetic memengaruhi hasil lelang?", "Tidak. Cosmetic hanya mengubah tampilan profil, nama, banner, dan wallet."],
  ["Keamanan", "Apa yang harus dilakukan jika ada login asing?", "Segera logout semua sesi, ubah password, lalu hubungi support."],
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const filtered = useMemo(() => faqs.filter((faq) => faq.join(" ").toLowerCase().includes(search.toLowerCase())), [search]);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Royal Archive" title="Help & Frequently Asked Questions" description="Panduan singkat untuk mulai menawar, menjaga akun, dan memahami sistem kerajaan." />
      <AnimatedSection delay={100}>
        <input className="search-input faq-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari pertanyaan..." />
      </AnimatedSection>
      <AnimatedSection staggerChildren staggerSelector=".faq-item" delay={200}>
        <section className="faq-list">
          {filtered.map((faq, index) => (
            <article key={faq[1]} className="panel faq-item">
              <button onClick={() => setOpen(open === index ? null : index)}><span>{faq[0]}</span>{faq[1]}<b>{open === index ? "\u2212" : "+"}</b></button>
              {open === index && <p>{faq[2]}</p>}
            </article>
          ))}
        </section>
      </AnimatedSection>
      <AnimatedSection delay={350}>
        <a className="primary-action support-link" href="mailto:support@emeraldkingdom.com">Contact support</a>
      </AnimatedSection>
    </main>
  );
}
