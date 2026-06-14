/**
 * WalletBalance Component Usage Examples
 * 
 * This file demonstrates how to use the WalletBalance component
 * in different scenarios throughout the application.
 */

import WalletBalance, { triggerWalletUpdate } from './WalletBalance';

// ============================================================================
// Example 1: Basic Usage (Standalone Display)
// ============================================================================
export function BasicWalletBalanceExample() {
  return (
    <div>
      <h2>Your Wallet</h2>
      <WalletBalance />
    </div>
  );
}

// ============================================================================
// Example 2: Inline Display (Without Icon)
// ============================================================================
export function InlineWalletBalanceExample() {
  return (
    <p>
      Current balance: <WalletBalance inline showIcon={false} />
    </p>
  );
}

// ============================================================================
// Example 3: Custom Styling
// ============================================================================
export function CustomStyledWalletBalanceExample() {
  return (
    <WalletBalance 
      className="text-2xl font-bold text-emerald-500"
      showIcon={true}
    />
  );
}

// ============================================================================
// Example 4: Triggering Manual Updates After Transactions
// ============================================================================
export function TopUpSuccessExample() {
  const handleTopUpSuccess = async () => {
    // ... perform top-up logic ...
    
    // Trigger wallet balance update
    triggerWalletUpdate();
    
    // The WalletBalance component will automatically refresh
    console.log('Wallet balance will update within 2 seconds');
  };

  return (
    <div>
      <button onClick={handleTopUpSuccess}>
        Complete Top-Up
      </button>
      <WalletBalance />
    </div>
  );
}

// ============================================================================
// Example 5: Multiple Components (All Stay Synchronized)
// ============================================================================
export function MultipleBalanceDisplaysExample() {
  const handleTransaction = () => {
    // After any wallet transaction
    triggerWalletUpdate();
    
    // All WalletBalance components will refresh simultaneously
  };

  return (
    <div>
      {/* Header balance */}
      <header>
        <WalletBalance />
      </header>

      {/* Sidebar balance */}
      <aside>
        <WalletBalance inline />
      </aside>

      {/* Main content balance */}
      <main>
        <h1>Wallet Details</h1>
        <WalletBalance showIcon={false} />
        
        <button onClick={handleTransaction}>
          Make Purchase
        </button>
      </main>
    </div>
  );
}

// ============================================================================
// Example 6: Testing Balance Formatting
// ============================================================================
export function BalanceFormattingExamples() {
  // These are the expected outputs:
  const examples = [
    { input: 0, output: "0 CC" },
    { input: 1, output: "1 CC" },
    { input: 100, output: "100 CC" },
    { input: 1500, output: "1,500 CC" },
    { input: 10000, output: "10,000 CC" },
    { input: 999999, output: "999,999 CC" },
    { input: 1000000, output: "1,000,000 CC" },
  ];

  return (
    <div>
      <h3>Balance Formatting Examples</h3>
      <table>
        <thead>
          <tr>
            <th>Input</th>
            <th>Formatted Output</th>
          </tr>
        </thead>
        <tbody>
          {examples.map(({ input, output }) => (
            <tr key={input}>
              <td>{input}</td>
              <td>{output}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Example 7: Handling Offline Mode (Cached Balance)
// ============================================================================
export function OfflineModeExample() {
  return (
    <div>
      <h3>Offline Mode</h3>
      <p>
        When the API is unavailable, the component will:
      </p>
      <ul>
        <li>Display the last known cached balance from localStorage</li>
        <li>Show a warning indicator (⚠) next to the balance</li>
        <li>Automatically retry when connection is restored</li>
      </ul>
      
      {/* This will show cached balance with warning if API is down */}
      <WalletBalance />
      
      <p className="text-sm text-amber-500">
        💡 Tip: The warning indicator means you're viewing cached data
      </p>
    </div>
  );
}

// ============================================================================
// Example 8: Integration with Top-Up Flow
// ============================================================================
export function TopUpFlowIntegration() {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleTopUpApproval = async (topUpId: string) => {
    setIsProcessing(true);
    
    try {
      // Call API to approve top-up
      const response = await fetch(`/api/v1/admin/topups/${topUpId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Trigger wallet balance update
        triggerWalletUpdate();
        
        // Success message
        alert('Top-up approved! Balance will update shortly.');
      }
    } catch (error) {
      console.error('Failed to approve top-up:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <WalletBalance />
      <button 
        onClick={() => handleTopUpApproval('some-topup-id')}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Approve Top-Up'}
      </button>
    </div>
  );
}

// ============================================================================
// Example 9: Real-time Balance Monitoring
// ============================================================================
export function RealTimeBalanceMonitoring() {
  React.useEffect(() => {
    // Listen for balance updates
    const handleBalanceUpdate = () => {
      console.log('Balance updated at:', new Date().toISOString());
    };

    window.addEventListener('walletUpdated', handleBalanceUpdate);

    return () => {
      window.removeEventListener('walletUpdated', handleBalanceUpdate);
    };
  }, []);

  return (
    <div>
      <h3>Real-time Balance Monitoring</h3>
      <WalletBalance />
      <p className="text-sm text-gray-500">
        Balance updates automatically via polling (every 30s) and events
      </p>
    </div>
  );
}

// ============================================================================
// Example 10: Error Handling Demonstration
// ============================================================================
export function ErrorHandlingExample() {
  const [apiStatus, setApiStatus] = React.useState<'online' | 'offline'>('online');

  const simulateAPIFailure = () => {
    setApiStatus('offline');
    // The component will automatically fall back to cached balance
  };

  const simulateAPIRecovery = () => {
    setApiStatus('online');
    triggerWalletUpdate(); // Refresh with live data
  };

  return (
    <div>
      <h3>Error Handling</h3>
      <div>
        API Status: <strong>{apiStatus}</strong>
      </div>
      
      <WalletBalance />
      
      <div className="flex gap-2 mt-4">
        <button onClick={simulateAPIFailure}>
          Simulate API Failure
        </button>
        <button onClick={simulateAPIRecovery}>
          Simulate API Recovery
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        When API fails, you'll see:
        <br />• Cached balance displayed
        <br />• Warning indicator (⚠) shown
        <br />• Tooltip: "Using cached balance (offline)"
      </p>
    </div>
  );
}

import React from 'react';
