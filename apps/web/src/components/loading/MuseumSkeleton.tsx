export default function MuseumSkeleton() {
  return (
    <div style={{ 
      background: 'linear-gradient(to top, rgba(13,59,46,0.3), transparent)', 
      border: '1px solid rgba(255,255,255,0.1)', 
      borderRadius: '12px', 
      padding: '3rem', 
      marginTop: '2rem' 
    }}>
      <div 
        className="skeleton-pulse" 
        style={{ 
          height: '48px', 
          width: '60%',
          margin: '0 auto 1rem auto',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s ease-in-out infinite'
        }}
      />
      <div 
        className="skeleton-pulse" 
        style={{ 
          height: '24px', 
          width: '40%',
          margin: '0 auto 1.5rem auto',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s ease-in-out infinite',
          animationDelay: '0.1s'
        }}
      />
      <div 
        className="skeleton-pulse" 
        style={{ 
          height: '48px', 
          width: '180px',
          margin: '0 auto',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s ease-in-out infinite',
          animationDelay: '0.2s'
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
    </div>
  );
}
