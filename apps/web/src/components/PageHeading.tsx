"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * PageHeading — Heading utama setiap halaman dengan reveal animation.
 * Animasi: eyebrow → title → description, berurutan dari atas.
 */
export default function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.children;
    Array.from(children).forEach((child) => {
      (child as HTMLElement).style.opacity = "0";
      (child as HTMLElement).style.transform = "translateY(20px)";
    });

    animate(children, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: stagger(120, { start: 100 }),
      ease: "outCubic",
    });
  }, []);

  return (
    <section ref={ref} className="page-heading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{description}</span>
      {/* Garis dekoratif di bawah heading */}
      <div
        style={{
          width: "80px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
          marginTop: "1.25rem",
        }}
      />
    </section>
  );
}
