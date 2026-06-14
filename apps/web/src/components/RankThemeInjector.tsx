"use client";

import { useEffect } from "react";

const RANK_COLORS: Record<string, string> = {
  CIVIS: "#9ca3af",      // gray
  MERCHANT: "#10b981",   // emerald green
  KNIGHT: "#3b82f6",     // blue
  BARON: "#8b5cf6",      // purple
  VISCOUNT: "#ec4899",   // pink
  EARL: "#f43f5e",       // rose
  MARQUIS: "#f59e0b",    // amber
  DUKE: "#eab308",       // yellow
  SOVEREIGN: "#06b6d4",  // cyan
  EMPEROR: "#e11d48",    // ruby red
};

export default function RankThemeInjector({ rank }: { rank?: string }) {
  useEffect(() => {
    if (!rank) return;
    
    const color = RANK_COLORS[rank];
    if (color) {
      document.documentElement.style.setProperty("--color-rank-accent", color);
      
      // Convert hex to rgb for rgba glow
      let r = 0, g = 0, b = 0;
      if (color.length === 7) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }
      document.documentElement.style.setProperty("--color-rank-glow", `rgba(${r}, ${g}, ${b}, 0.3)`);
    } else {
      // Default to gold if rank is unknown
      document.documentElement.style.setProperty("--color-rank-accent", "#c9a84c");
      document.documentElement.style.setProperty("--color-rank-glow", "rgba(201, 168, 76, 0.3)");
    }
  }, [rank]);

  return null;
}
