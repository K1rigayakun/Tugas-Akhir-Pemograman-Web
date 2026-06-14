import { create } from "zustand";

interface CosmeticsStore {
  activeWebCode: string | null;
  setActiveWebCode: (code: string | null) => void;
}

// Store sementara untuk menyimpan web code yang "di-equip" oleh pengguna
export const useCosmeticsStore = create<CosmeticsStore>((set) => ({
  activeWebCode: null,
  setActiveWebCode: (code) => set({ activeWebCode: code }),
}));
