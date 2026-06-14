"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

/**
 * AnimatedSection — Wrapper yang memberikan scroll-triggered reveal animation
 * menggunakan IntersectionObserver + Anime.js v4.
 * 
 * Digunakan untuk membungkus konten agar fade-in saat terlihat di viewport.
 */
export default function AnimatedSection({
  children,
  className,
  style,
  direction = "up",
  staggerChildren = false,
  staggerSelector,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Arah masuk animasi */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Animasi stagger pada child langsung */
  staggerChildren?: boolean;
  /** CSS selector untuk child yang akan di-stagger */
  staggerSelector?: string;
  /** Delay tambahan sebelum animasi mulai (ms) */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tentukan transform axis berdasarkan direction
    const transformProp =
      direction === "left" || direction === "right" ? "translateX" : "translateY";
    const fromValue =
      direction === "up" ? 35 :
      direction === "down" ? -35 :
      direction === "left" ? -40 :
      direction === "right" ? 40 : 0;

    // Set initial hidden state
    el.style.opacity = "0";
    if (direction !== "none") {
      el.style.transform = `${transformProp}(${fromValue}px)`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate container
            animate(el, {
              opacity: [0, 1],
              ...(direction !== "none" && { [transformProp]: [fromValue, 0] }),
              duration: 700,
              delay,
              ease: "outCubic",
            });

            // Stagger children jika diminta
            if (staggerChildren || staggerSelector) {
              const children = staggerSelector
                ? el.querySelectorAll(staggerSelector)
                : el.children;

              if (children.length > 0) {
                // Set initial state untuk children
                Array.from(children).forEach((child) => {
                  (child as HTMLElement).style.opacity = "0";
                  (child as HTMLElement).style.transform = "translateY(16px)";
                });

                animate(children, {
                  opacity: [0, 1],
                  translateY: [16, 0],
                  duration: 450,
                  delay: stagger(80, { start: delay + 200 }),
                  ease: "outQuad",
                });
              }
            }

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, staggerChildren, staggerSelector]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
