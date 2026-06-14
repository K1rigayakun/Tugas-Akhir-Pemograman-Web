"use client";

import { useEffect, useRef } from "react";
import { useThemeStore } from "../store/useThemeStore";

/* ──────────────────────────────────────────────────────────────
   Layered Theme Engine: BackgroundCanvas
   ────────────────────────────────────────────────────────────── */

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const baseTheme = useThemeStore((s) => s.baseTheme);
  const effectLayer = useThemeStore((s) => s.effectLayer);

  const themeRef = useRef(baseTheme);
  const effectRef = useRef(effectLayer);

  useEffect(() => {
    themeRef.current = baseTheme;
    effectRef.current = effectLayer;
  }, [baseTheme, effectLayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let frameCount = 0;

    // --- State untuk Base Theme (Hexagon) ---
    let hexagons: any[] = [];
    let glowPoints: any[] = [];
    
    // --- State untuk Effect Layer ---
    let particles: any[] = [];

    // Helper functions (Hexagon)
    function computeVertices(cx: number, cy: number, size: number) {
      const verts: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        verts.push({ x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) });
      }
      return verts;
    }

    const buildGrid = () => {
      hexagons = [];
      const size = 30;
      const gap = 1.5;
      const w = size * 2 + gap;
      const h = Math.sqrt(3) * size + gap;
      const cols = Math.ceil(canvas.width / w) + 2;
      const rows = Math.ceil(canvas.height / h) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * w + (row % 2 === 0 ? 0 : w / 2);
          const cy = row * h;
          hexagons.push({ x: cx, y: cy, brightness: 0, target: 0, vertices: computeVertices(cx, cy, size) });
        }
      }
    };

    const spawnParticle = (type: string) => {
      if (particles.length >= 80) return;
      particles.push({
        x: Math.random() * canvas.width,
        y: type === "embers" ? canvas.height + 10 : -10,
        size: Math.random() * (type === "snowfall" ? 3 : 2) + 0.5,
        speedY: (Math.random() * 1.5 + 0.5) * (type === "embers" ? -1 : 1),
        speedX: (Math.random() - 0.5) * (type === "snowfall" ? 1 : 0.5),
        opacity: Math.random() * 0.5 + 0.2,
      });
    };

    const spawnGlow = () => {
      if (glowPoints.length >= 5) return;
      glowPoints.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        radius: 0, max: 300 + Math.random() * 100, intensity: 0.8 + Math.random() * 0.2,
        phase: "expand", timer: 0, expandSpeed: 2 + Math.random(),
        holdDuration: 40 + Math.random() * 30, fadeSpeed: 0.015,
      });
    };

    // --- Draw Functions ---
    const drawBaseTheme = () => {
      const theme = themeRef.current;
      
      if (theme === "royal-velvet") {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#190a05"); grad.addColorStop(1, "#3c0000");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      if (theme === "abyssal-blue") {
        const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
        grad.addColorStop(0, "#0f2027"); grad.addColorStop(1, "#03060a");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Default: carbon-hexagon
      ctx.fillStyle = "#0a0c0e"; ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (frameCount % 180 === 0) spawnGlow();

      // Update Glows
      for (let i = glowPoints.length - 1; i >= 0; i--) {
        const gp = glowPoints[i]; gp.timer++;
        if (gp.phase === "expand") { gp.radius += gp.expandSpeed; if (gp.radius >= gp.max) gp.phase = "hold"; }
        else if (gp.phase === "hold") { if (gp.timer >= gp.holdDuration) gp.phase = "fade"; }
        else if (gp.phase === "fade") { gp.intensity -= gp.fadeSpeed; if (gp.intensity <= 0) glowPoints.splice(i, 1); }
      }

      for (const hex of hexagons) {
        let maxBright = 0;
        for (const gp of glowPoints) {
          const dist = Math.sqrt((hex.x - gp.x)**2 + (hex.y - gp.y)**2);
          if (dist < gp.radius) maxBright = Math.max(maxBright, (1 - dist / gp.radius)**2 * gp.intensity);
        }
        hex.target = maxBright;
        hex.brightness += (hex.target - hex.brightness) * 0.05;
        if (Math.abs(hex.brightness) < 0.005) hex.brightness = 0;

        ctx.beginPath();
        ctx.moveTo(hex.vertices[0].x, hex.vertices[0].y);
        for (let i = 1; i < 6; i++) ctx.lineTo(hex.vertices[i].x, hex.vertices[i].y);
        ctx.closePath();

        ctx.fillStyle = "#111416"; ctx.fill();
        if (hex.brightness > 0.01) {
          ctx.strokeStyle = `rgba(16,185,129,${hex.brightness})`;
          ctx.lineWidth = 1.5 + (hex.brightness * 1.5); ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(30, 35, 40, 0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
    };

    const drawEffectLayer = () => {
      const effect = effectRef.current;
      if (effect === "none") return;

      if (frameCount % (effect === "snowfall" ? 5 : 10) === 0) spawnParticle(effect);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.speedY; p.x += p.speedX;
        
        if (effect === "snowfall") p.x += Math.sin(frameCount * 0.02 + p.y) * 0.5; // Sway

        if (p.y > canvas.height + 10 || p.y < -20) particles.splice(i, 1);
        else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          if (effect === "snowfall") {
            ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          } else if (effect === "embers") {
            ctx.fillStyle = `rgba(255,100,50,${p.opacity})`;
            ctx.shadowColor = "rgba(255,100,50,1)"; ctx.shadowBlur = 10;
          } else {
            ctx.fillStyle = `rgba(16,185,129,${p.opacity})`;
            ctx.shadowColor = "rgba(16,185,129,1)"; ctx.shadowBlur = 8;
          }
          ctx.fill(); ctx.shadowBlur = 0;
        }
      }
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frameCount++;
      drawBaseTheme();
      drawEffectLayer();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px"; canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      buildGrid(); glowPoints = []; particles = [];
    };

    resize(); animate();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas id="emerald-bg-canvas" ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}