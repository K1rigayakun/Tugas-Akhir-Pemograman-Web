export default function LoadingIndicator() {
  return (
    <div 
      style={{ 
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(13,59,46,0.9)',
        borderRadius: '8px',
        border: '1px solid rgba(201,168,76,0.3)',
        animation: 'fadeIn 0.3s ease-in-out',
        zIndex: 10
      }}
    >
      <div 
        className="spinner"
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(201,168,76,0.3)',
          borderTop: '2px solid var(--imperial-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <span style={{ 
        fontSize: '14px', 
        color: 'var(--imperial-gold)',
        fontWeight: 500
      }}>
        Updating...
      </span>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
