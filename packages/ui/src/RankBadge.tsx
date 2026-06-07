import React from 'react';

type Rank = 'CIVIS' | 'MERCHANT' | 'KNIGHT' | 'BARON' | 'VISCOUNT' | 'EARL' | 'MARQUIS' | 'DUKE' | 'SOVEREIGN' | 'EMPEROR';

const rankColors: Record<Rank, string> = {
  CIVIS:     '#4A7C6A',
  MERCHANT:  '#5A8F7A',
  KNIGHT:    '#CD7F32',
  BARON:     '#CD7F32',
  VISCOUNT:  '#C0C0C0',
  EARL:      '#C9A84C',
  MARQUIS:   '#C9A84C',
  DUKE:      '#E8A020',
  SOVEREIGN: '#E5E4E2',
  EMPEROR:   '#FFD700',
};

export function RankBadge({ rank }: { rank: Rank }) {
  const color = rankColors[rank];
  return (
    <span style={{ color, borderColor: color }} className="text-xs border px-3 py-0.5 rounded-full font-semibold tracking-widest uppercase">
      {rank}
    </span>
  );
}