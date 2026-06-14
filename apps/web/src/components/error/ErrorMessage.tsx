interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div 
      style={{
        textAlign: 'center',
        padding: '2rem',
        border: '1px solid rgba(255,100,100,0.3)',
        borderRadius: '8px',
        background: 'rgba(139,0,0,0.1)'
      }}
    >
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '1rem' 
      }}>
        ⚠️
      </div>
      <p style={{ 
        color: 'var(--color-text)',
        marginBottom: '1rem',
        fontSize: '16px'
      }}>
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="primary-action"
          style={{
            marginTop: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
