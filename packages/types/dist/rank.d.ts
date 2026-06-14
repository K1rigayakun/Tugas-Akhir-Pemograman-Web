import { Rank } from "./enums";
/** EXP yang dibutuhkan untuk mencapai setiap rank */
export declare const RANK_EXP_THRESHOLDS: Record<Rank, number>;
/** Gelar per rank — {username} diganti saat render */
export declare const RANK_TITLES: Record<Rank, string>;
/** CSS variable yang berubah otomatis sesuai rank */
export declare const RANK_THEME: Record<Rank, {
    accent: string;
    glow: string;
}>;
/** Urutan rank dari rendah ke tinggi */
export declare const RANK_ORDER: Rank[];
/** Cek apakah rank A >= rank B */
export declare const isRankAtLeast: (current: Rank, required: Rank) => boolean;
//# sourceMappingURL=rank.d.ts.map