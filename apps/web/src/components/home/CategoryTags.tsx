"use client";

import { useRef, useEffect } from "react";
import { animate, stagger } from "animejs";

import { AUCTION_CATEGORIES } from "../../constants/categories";
export default function CategoryTags() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tags = section.querySelectorAll(".cat-tag");
    tags.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateX(-20px)";
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(tags, {
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 500,
            delay: stagger(30),
            easing: "easeOutSine"
          });
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: "0 2rem", maxWidth: "1600px", margin: "0 auto", marginBottom: "4rem" }}>
      {/* Container dengan Grid 3 Baris & Horizontal Scroll */}
      <div className="hide-scrollbar" style={{
        display: "grid",
        gridTemplateRows: "repeat(3, auto)", // 3 Baris ke bawah
        gridAutoFlow: "column", // Memanjang ke samping
        gap: "0.75rem",
        overflowX: "auto",
        paddingBottom: "1rem"
      }}>
        {AUCTION_CATEGORIES.map((cat, idx) => (
          <a
            key={idx}
            href={`/search?category=${encodeURIComponent(cat)}`}
            className="cat-tag"
            style={{
              padding: "0.5rem 1.25rem",
              background: "rgba(10, 12, 14, 0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50px", // Bentuk chip oval
              color: "var(--color-ivory)",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-emerald)";
              e.currentTarget.style.color = "#000";
              e.currentTarget.style.fontWeight = "bold";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(10, 12, 14, 0.6)";
              e.currentTarget.style.color = "var(--color-ivory)";
              e.currentTarget.style.fontWeight = "normal";
            }}
          >
            {cat}
          </a>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
