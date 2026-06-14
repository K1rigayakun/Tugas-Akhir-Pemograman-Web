"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Eye } from "lucide-react";

type LiveAuctionItem = {
  id: string;
  title: string;
  auctioneer: string;
  viewers: number;
  imageUrl: string;
  avatarUrl: string;
  isLive: boolean;
};

import { useRouter } from "next/navigation";
import AuctionCard from "../auction/AuctionCard";

export default function EndingSoon({ auctions = [] }: { auctions?: any[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  // Filter 4 LIVE auctions, fallback to ACTIVE
  const displayAuctions = [...auctions]
    .sort((a, b) => {
      if (a.auctionType === "LIVE" && b.auctionType !== "LIVE") return -1;
      if (b.auctionType === "LIVE" && a.auctionType !== "LIVE") return 1;
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    })
    .slice(0, 4);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    heading.style.opacity = "0";
    heading.style.transform = "translateY(30px)";

    const cards = section.querySelectorAll(".live-card");
    cards.forEach((r) => {
      (r as HTMLElement).style.opacity = "0";
      (r as HTMLElement).style.transform = "translateY(40px)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(heading, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outCubic" });
            if (cards.length > 0) {
              animate(cards, { opacity: [0, 1], translateY: [40, 0], duration: 800, delay: stagger(150, { start: 200 }), ease: "outQuad" });
            }
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ position: "relative", zIndex: 10, padding: "5rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 ref={headingRef} style={{ fontFamily: "var(--font-subheading)", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "var(--color-gold)", letterSpacing: "0.1em" }}>
          Top Live Auctions
        </h2>
        <p style={{ color: "var(--color-ivory)", opacity: 0.6, fontSize: "1rem", marginTop: "0.5rem", letterSpacing: "0.05em" }}>
          Lelang paling panas dan diperebutkan saat ini. Jangan sampai terlewat.
        </p>
        <div style={{ width: "80px", height: "1px", background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)", margin: "1rem auto 0" }} />
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {displayAuctions.map((item) => (
          <AuctionCard key={item.id} auction={item} kycApproved={true} />
        ))}
      </div>
    </section>
  );
}