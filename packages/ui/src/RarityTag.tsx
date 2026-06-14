import React from 'react';

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'TRANSCENDENT';

const rarityMap: Record<Rarity, { label: string; color: string }> = {
  COMMON:       { label: 'Common',       color: 'var(--color-rarity-common)' },
  UNCOMMON:     { label: 'Uncommon',     color: 'var(--color-rarity-uncommon)' },
  RARE:         { label: 'Rare',         color: 'var(--color-rarity-rare)' },
  EPIC:         { label: 'Epic',         color: 'var(--color-rarity-epic)' },
  LEGENDARY:    { label: 'Legendary',    color: 'var(--color-rarity-legendary)' },
  TRANSCENDENT: { label: 'Transcendent', color: 'var(--color-rarity-transcendent)' },
};

export function RarityTag({ rarity }: { rarity: Rarity }) {
  const { label, color } = rarityMap[rarity];
  return (
    <span className="rarity-border text-xs px-2 py-0.5 rounded" style={{ '--rarity-color': color, color } as React.CSSProperties}>
      {label}
    </span>
  );
}