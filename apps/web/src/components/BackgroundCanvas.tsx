"use client";

import { useEffect, useRef } from "react";
import { useBackgroundStore } from "../store/useBackgroundStore";

type Hex = {
  x: number;
  y: number;
  size: number;
  brightness: number;
  targetBrightness: number;
  groupId: number;
};

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useBackgroundStore((s) => s.mode);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let hexagons: Hex[] = [];
    let animId = 0;

    // ── Bangun grid hexagon ───────────────────────────────────
    const buildGrid = () => {
      hexagons = [];
      const size = 36;
      const gap  = 3;
      const w    = size * 2 + gap;
      const h    = Math.sqrt(3) * size + gap;
      const cols = Math.ceil(canvas.width  / w) + 2;
      const rows = Math.ceil(canvas.height / h) + 2;

      let groupCounter = 0;
      const groupMap: Record<string, number> = {};

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Kelompok berdasarkan blok 2 baris x 3 kolom (~6 hex per kelompok)
          const groupRow = Math.floor(row / 2);
          const groupCol = Math.floor(col / 3);
          const key = `${groupRow}-${groupCol}`;
          if (!(key in groupMap)) {
            groupMap[key] = groupCounter++;
          }

          const offsetX = row % 2 === 0 ? 0 : w / 2;
          hexagons.push({
            x: col * w + offsetX,
            y: row * h,
            size,
            brightness: 0,
            targetBrightness: 0,
            groupId: groupMap[key],
          });
        }
      }
    };

    // ── Gambar satu hexagon ───────────────────────────────────
    const drawHex = (hex: Hex) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = hex.x + hex.size * Math.cos(angle);
        const py = hex.y + hex.size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Isi hexagon — hitam pekat
      ctx.fillStyle = "rgba(6, 8, 6, 0.97)";
      ctx.fill();

      if (hex.brightness > 0.01) {
        const m = modeRef.current;
        let r = 20, g = 210, b = 90; // hijau emerald default
        if (m === "live")    { r = 232; g = 160; b = 32; }
        if (m === "emperor") { r = 255; g = 215; b = 0;  }
        if (m === "event")   { r = 76;  g = 175; b = 80; }

        // Glow tipis di celah
        ctx.strokeStyle = `rgba(${r},${g},${b},${hex.brightness * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow lebar cahaya bocor
        ctx.strokeStyle = `rgba(${r},${g},${b},${hex.brightness * 0.22})`;
        ctx.lineWidth = 6;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(20, 40, 28, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // ── Wave system ───────────────────────────────────────────
    let waveIndex   = 0;
    let waveTimer   = 0;
    let isWaveOn    = true;  // true = menyala, false = mati
    let pauseTimer  = 0;
    const WAVE_INTERVAL = 6; // frame antar kelompok (lebih kecil = lebih cepat)

    const animate = () => {
      animId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background hitam
      ctx.fillStyle = "#060806";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hitung total kelompok
      const maxGroup = hexagons.reduce(
        (max, h) => Math.max(max, h.groupId + 1), 0
      );

      waveTimer++;

      if (pauseTimer > 0) {
        // Jeda — tunggu sebelum mulai wave berikutnya
        pauseTimer--;
      } else if (waveTimer >= WAVE_INTERVAL) {
        waveTimer = 0;

        if (waveIndex < maxGroup) {
          // Nyalakan / matikan kelompok ke-waveIndex
          const target = isWaveOn ? 0.85 : 0;
          hexagons
            .filter((h) => h.groupId === waveIndex)
            .forEach((h) => { h.targetBrightness = target; });
          waveIndex++;
        } else {
          // Semua kelompok sudah diproses — balik arah
          waveIndex = 0;
          isWaveOn  = !isWaveOn;
          // Jeda lebih panjang saat semua sudah mati (sebelum mulai nyala lagi)
          pauseTimer = isWaveOn ? 40 : 120;
        }
      }

      // Update brightness tiap hexagon (fade smooth)
      for (const hex of hexagons) {
        const speed = hex.targetBrightness > hex.brightness ? 0.1 : 0.04;
        hex.brightness += (hex.targetBrightness - hex.brightness) * speed;
        drawHex(hex);
      }
    };

    // ── Resize handler ────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reset wave saat resize
      waveIndex  = 0;
      waveTimer  = 0;
      isWaveOn   = true;
      pauseTimer = 0;
      buildGrid();
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}