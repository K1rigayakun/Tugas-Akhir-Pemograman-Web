'use client';

import { MuseumResponse } from '../../types/data-sync';
import { useDataSync } from '../../hooks/useDataSync';
import MuseumSkeleton from '../loading/MuseumSkeleton';
import LoadingIndicator from '../loading/LoadingIndicator';
import ErrorMessage from '../error/ErrorMessage';

interface MuseumProps {
  initialData?: MuseumResponse;
}

export default function Museum({ initialData }: MuseumProps) {
  const { data, loading, error, refetch } = useDataSync<MuseumResponse>({
    endpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1'}/museum/featured`
  });

  const displayData = data || initialData;
  const featuredItem = displayData?.data?.[0];

  if (error && !displayData) {
    return <ErrorMessage message="Failed to load museum items. Please try again later." onRetry={refetch} />;
  }

  if (loading && !displayData) {
    return <MuseumSkeleton />;
  }

  if (!featuredItem) {
    return (
      <div style={{ 
        background: 'linear-gradient(to top, rgba(13,59,46,0.3), transparent)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '12px', 
        padding: '3rem', 
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--silver-mist)' }}>No featured items available yet.</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {loading && displayData && <LoadingIndicator />}
      <div style={{ 
        background: 'linear-gradient(to top, rgba(13,59,46,0.3), transparent)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '12px', 
        padding: '3rem', 
        marginTop: '2rem' 
      }}>
        <h3 style={{ 
          fontFamily: 'var(--font-cinzel)', 
          fontSize: '2rem', 
          marginBottom: '0.5rem' 
        }}>
          {featuredItem.name}
        </h3>
        <p style={{ 
          color: 'var(--imperial-gold)', 
          marginBottom: '1.5rem' 
        }}>
          {featuredItem.description}
        </p>
        <a 
          href="/museum" 
          className="primary-action" 
          style={{ 
            display: 'inline-block', 
            textDecoration: 'none' 
          }}
        >
          Kunjungi Museum
        </a>
      </div>
    </div>
  );
}
