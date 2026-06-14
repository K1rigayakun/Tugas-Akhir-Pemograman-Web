// apps/web/src/store/useBackgroundStore.ts

import { create } from "zustand";

// Mode background yang tersedia
// "default" → normal
// "live"    → partikel lebih cepat, sisi layar berdenyut amber
// "event"   → warna bergeser ke tema event
// "emperor" → bintang emas bergerak
export type BackgroundMode = "default" | "live" | "event" | "emperor";

interface BackgroundStore {
  mode: BackgroundMode;
  setMode: (mode: BackgroundMode) => void;
}

export const useBackgroundStore = create<BackgroundStore>((set) => ({
  mode: "default",
  setMode: (mode) => set({ mode }),
}));