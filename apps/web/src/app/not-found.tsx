"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function NotFound() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.children;
    Array.from(children).forEach((child) => {
      (child as HTMLElement).style.opacity = "0";
      (child as HTMLElement).style.transform = "translateY(25px)";
    });

    animate(children, {
      opacity: [0, 1],
      translateY: [25, 0],
      duration: 800,
      delay: stagger(150, { start: 200 }),
      ease: "outCubic",
    });
  }, []);

  return (
    <main ref={ref} className="not-found-page">
      <p>404 - Uncharted Territory</p>
      <h1>The path you seek lies beyond the known kingdom.</h1>
      <Link href="/" className="primary-action">Return to the kingdom</Link>
    </main>
  );
}
