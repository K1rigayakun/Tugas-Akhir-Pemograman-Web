"use client";

import Link from "next/link";
import { useEffect } from "react";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { useThemeStore, BaseTheme, EffectLayer } from "../../../store/useThemeStore";

export default function EventDetailClient({ event }: { event: any }) {
  const { setThemeOverride } = useThemeStore();

  // Memaksa override tema jika event sedang dibuka
  useEffect(() => {
    if (event.isActive) {
      let effect: EffectLayer = "none";
      if (event.id === "winter-court") effect = "snowfall";
      else if (event.id === "abyssal-tides") effect = "emerald-particles";
      
      let base: BaseTheme = "carbon-hexagon";
      if (event.id === "winter-court") base = "abyssal-blue";

      setThemeOverride(base, effect);
    }
  }, [event.isActive, event.id, setThemeOverride]);

  return (
    <main className="page-wrap">
      <PageHeading eyebrow={event.isActive ? "Active Festival" : "Festival Archive"} title={event.name} description={event.theme} />
      
      <AnimatedSection staggerChildren staggerSelector=".content-card" delay={200}>
        <section className="data-grid">
          <article className="content-card">
            <h2>Season Window</h2>
            <p>{new Date(event.startTime).toLocaleString("id-ID")} hingga {new Date(event.endTime).toLocaleString("id-ID")}</p>
          </article>
          <article className="content-card">
            <h2>Visual Theme Override</h2>
            <p className="metric" style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              {event.id === "winter-court" ? "Snowfall & Abyssal Blue" : "Default Emerald Engine"}
            </p>
            <p style={{ opacity: 0.6, fontSize: "0.85rem", marginTop: "0.5rem" }}>Tema khusus ini akan otomatis aktif di seluruh platform selama festival berjalan.</p>
          </article>
          <article className="content-card">
            <h2>Exclusive Accessories</h2>
            <p>Beragam frame, banner, dan efek nama eksklusif hanya bisa didapatkan selama periode festival ini.</p>
          </article>
        </section>
      </AnimatedSection>
      
      <AnimatedSection delay={400}>
        <h2 className="section-title">Cosmetics & Rewards Showcase</h2>
        <section className="panel ranking-table" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "2rem" }}>
           <div style={{ background: "var(--color-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--color-border)", textAlign: "center" }}>
             <h3 style={{ color: "var(--color-ivory)", marginBottom: "0.5rem" }}>Frostbite Frame</h3>
             <p style={{ color: "var(--color-emerald)", fontSize: "0.85rem" }}>Rarity: Epic</p>
           </div>
           <div style={{ background: "var(--color-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--color-border)", textAlign: "center" }}>
             <h3 style={{ color: "var(--color-ivory)", marginBottom: "0.5rem" }}>Winter's Grasp Title</h3>
             <p style={{ color: "var(--color-gold)", fontSize: "0.85rem" }}>Rarity: Legendary</p>
           </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={500}>
        <Link href="/events" className="text-link">Kembali ke kalender event</Link>
      </AnimatedSection>
    </main>
  );
}
