// apps/web/src/store/useThemeStore.ts

import { create } from "zustand";

export type BaseTheme = "carbon-hexagon" | "royal-velvet" | "abyssal-blue";
export type EffectLayer = "none" | "emerald-particles" | "snowfall" | "embers";

interface ThemeStore {
  baseTheme: BaseTheme;
  effectLayer: EffectLayer;
  setBaseTheme: (theme: BaseTheme) => void;
  setEffectLayer: (effect: EffectLayer) => void;
  // Memungkinkan event menimpa tema sementara
  setThemeOverride: (theme: BaseTheme, effect: EffectLayer) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  baseTheme: "carbon-hexagon",
  effectLayer: "emerald-particles", // Default
  
  setBaseTheme: (baseTheme) => set({ baseTheme }),
  setEffectLayer: (effectLayer) => set({ effectLayer }),
  
  setThemeOverride: (baseTheme, effectLayer) => set({ baseTheme, effectLayer }),
}));
