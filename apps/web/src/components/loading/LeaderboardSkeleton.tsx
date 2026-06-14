export default function LeaderboardSkeleton() {
  return (
    <div className="data-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {[...Array(3)].map((_, i) => (
        <article 
          key={i} 
          className="content-card" 
          style={{ 
            textAlign: 'center',
            opacity: 1 - (i * 0.1)
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '0.5rem',
              height: '48px'
            }}
          >
            <div 
              className="skeleton-pulse" 
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s ease-in-out infinite'
              }}
            />
          </div>
          <div 
            className="skeleton-pulse" 
            style={{ 
              height: '24px', 
              width: '60%',
              margin: '0.5rem auto',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-loading 1.5s ease-in-out infinite'
            }}
          />
          <div 
            className="skeleton-pulse" 
            style={{ 
              height: '18px', 
              width: '80%',
              margin: '0.5rem auto',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-loading 1.5s ease-in-out infinite',
              animationDelay: '0.1s'
            }}
          />
          <style jsx>{`
            @keyframes skeleton-loading {
              0% {
                background-position: 200% 0;
              }
              100% {
                background-position: -200% 0;
              }
            }
          `}</style>
        </article>
      ))}
    </div>
  );
}
