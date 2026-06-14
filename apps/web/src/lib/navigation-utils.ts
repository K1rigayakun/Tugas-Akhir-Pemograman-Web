/**
 * Navigation Utilities
 * Shared utilities for navigation components
 */

/**
 * Rank color mapping
 * Maps user ranks to their corresponding color hex values
 */
export const rankColors: Record<string, string> = {
  CIVIS: "#9ca3af",     // Gray
  KNIGHT: "#22c55e",    // Green
  BARON: "#3b82f6",     // Blue
  EARL: "#8b5cf6",      // Purple
  MARQUIS: "#f59e0b",   // Amber
  DUKE: "#ef4444",      // Red
  EMPEROR: "#ffd700",   // Gold
};

/**
 * Format currency value with proper separators and decimals
 * @param amount - The amount to format
 * @param currency - Currency code (default: IDR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get rank color with fallback
 * @param rank - User rank
 * @returns Hex color string
 */
export function getRankColor(rank: string): string {
  return rankColors[rank] || rankColors.CIVIS;
}
