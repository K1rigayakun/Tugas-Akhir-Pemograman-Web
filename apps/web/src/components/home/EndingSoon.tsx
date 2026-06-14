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
    .slice(0, 4)
    .map((a) => ({
      id: a.id,
      title: a.title,
      auctioneer: "The Imperial Vault",
      viewers: 1000 + (a.id.charCodeAt(0) * 10) + (a.id.length * 15),
      imageUrl: a.imageUrls?.[0] || `https://loremflickr.com/640/360/${encodeURIComponent(a.category)}?lock=${a.id}`,
      avatarUrl: "https://via.placeholder.com/48/FFD700/000?text=IV",
      isLive: a.auctionType === "LIVE",
      type: a.auctionType
    }));

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
    <section ref={sectionRef} style={{ padding: "5rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
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
          <LiveCard key={item.id} item={item} router={router} />
        ))}
      </div>
    </section>
  );
}

function LiveCard({ item, router }: { item: any, router: any }) {
  return (
    <div 
      className="live-card"
      onClick={() => router.push(item.isLive ? `/auctions/${item.id}/live` : `/auction/${item.id}`)}
      style={{ 
        cursor: "pointer", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.75rem",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {/* Thumbnail Container */}
      <div style={{ 
        position: "relative", 
        width: "100%", 
        aspectRatio: "16 / 9", 
        borderRadius: "12px", 
        overflow: "hidden",
        backgroundColor: "#111"
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        
        {/* Live Badge */}
        {item.isLive && (
          <div style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(220, 38, 38, 0.9)", // Red
            color: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backdropFilter: "blur(4px)"
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", animation: "pulse 1.5s infinite" }} />
            LIVE
          </div>
        )}

        {/* Viewers Badge */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          backdropFilter: "blur(4px)"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Eye size={12} /> {item.viewers.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Meta Info */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.avatarUrl} alt={item.auctioneer} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
        </div>
        
        {/* Texts */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ 
            color: "var(--color-ivory)", 
            fontSize: "1rem", 
            fontWeight: 600, 
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {item.title}
          </h3>
          <p style={{ 
            color: "var(--color-text-muted)", 
            fontSize: "0.85rem", 
            marginTop: "0.25rem" 
          }}>
            {item.auctioneer}
          </p>
        </div>
      </div>
    </div>
  );
}