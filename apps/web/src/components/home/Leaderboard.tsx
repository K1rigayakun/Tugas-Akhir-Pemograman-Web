'use client';

import { Crown, Trophy, Medal } from 'lucide-react';
import { LeaderboardResponse } from '../../types/data-sync';
import { useDataSync } from '../../hooks/useDataSync';
import LeaderboardSkeleton from '../loading/LeaderboardSkeleton';
import LoadingIndicator from '../loading/LoadingIndicator';
import ErrorMessage from '../error/ErrorMessage';

interface LeaderboardProps {
  initialData?: LeaderboardResponse;
}

export default function Leaderboard({ initialData }: LeaderboardProps) {
  const { data, loading, error, refetch } = useDataSync<LeaderboardResponse>({
    endpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1'}/leaderboard`
  });

  const displayData = data || initialData;

  if (error && !displayData) {
    return <ErrorMessage message="Failed to load leaderboard. Please try again later." onRetry={refetch} />;
  }

  if (loading && !displayData) {
    return <LeaderboardSkeleton />;
  }

  const topThree = displayData?.data?.slice(0, 3) || [];
  const icons = [
    { Icon: Crown, color: 'var(--color-gold)', size: 48 },
    { Icon: Trophy, color: '#C0C0C0', size: 40 },
    { Icon: Medal, color: '#CD7F32', size: 36 }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {loading && displayData && <LoadingIndicator />}
      <div className="data-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {topThree.map((entry, index) => {
          const { Icon, color, size } = icons[index] || icons[2];
          return (
            <article 
              key={entry.userId} 
              className="content-card" 
              style={{ 
                textAlign: 'center', 
                borderColor: index === 0 ? 'var(--color-gold)' : undefined,
                opacity: 1 - (index * 0.1)
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                color, 
                marginBottom: '0.5rem' 
              }}>
                <Icon size={size} />
              </div>
              <h3 style={{ margin: '0.5rem 0' }}>{entry.username}</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {entry.points.toLocaleString()} CC Spent
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
