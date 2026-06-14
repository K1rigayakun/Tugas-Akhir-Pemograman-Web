import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getPaymentAction } from '@/app/actions/payment';

/**
 * usePaymentSocket — Hook for Socket.IO payment status updates
 * Task 14.1: Connect to backend Socket.IO server and subscribe to payment.status.changed events
 * Task 14.2: Poll GET /api/payments/:id as fallback when WebSocket disconnected
 * Validates Requirement 7.2: Real-time status updates within 5 seconds
 */

interface PaymentStatusUpdate {
  topUpRequestId: string;
  status: string;
  amount?: number;
  fiatAmount?: number;
  method?: string;
  provider?: string;
  paidAt?: Date;
  timestamp: string;
}

interface UsePaymentSocketOptions {
  userId: string | null;
  paymentId?: string | null; // Payment ID to poll when WebSocket unavailable
  onStatusChange: (update: PaymentStatusUpdate) => void;
  enabled?: boolean;
}

// Final statuses that should stop polling
const FINAL_STATUSES = ['APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
const POLLING_INTERVAL = 10000; // 10 seconds

export function usePaymentSocket({ userId, paymentId, onStatusChange, enabled = true }: UsePaymentSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  // Poll payment status as fallback
  const pollPaymentStatus = useCallback(async () => {
    if (!paymentId) return;

    try {
      console.log(`[PaymentSocket] Polling payment status for ${paymentId}`);
      const result = await getPaymentAction(paymentId);

      if (result.success && result.data) {
        const payment = result.data;
        
        // Only trigger callback if status has changed
        if (payment.status !== lastStatusRef.current) {
          console.log(`[PaymentSocket] Status changed via polling: ${lastStatusRef.current} → ${payment.status}`);
          lastStatusRef.current = payment.status;
          
          onStatusChange({
            topUpRequestId: payment.id,
            status: payment.status,
            amount: payment.amount,
            fiatAmount: payment.fiatAmount,
            method: payment.method,
            provider: payment.provider,
            paidAt: payment.paidAt,
            timestamp: new Date().toISOString(),
          });
        }

        // Stop polling if final status reached
        if (FINAL_STATUSES.includes(payment.status)) {
          console.log(`[PaymentSocket] Final status reached: ${payment.status}. Stopping polling.`);
          stopPolling();
        }
      }
    } catch (error) {
      console.error('[PaymentSocket] Polling error:', error);
    }
  }, [paymentId, onStatusChange]);

  // Start polling
  const startPolling = useCallback(() => {
    // Don't start polling if WebSocket is connected or polling is already active
    if (isConnectedRef.current || pollingIntervalRef.current) return;
    if (!paymentId || !enabled) return;

    console.log(`[PaymentSocket] Starting polling for payment ${paymentId}`);
    
    // Poll immediately
    pollPaymentStatus();
    
    // Then poll every 10 seconds
    pollingIntervalRef.current = setInterval(pollPaymentStatus, POLLING_INTERVAL);
  }, [paymentId, enabled, pollPaymentStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[PaymentSocket] Stopping polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!userId || !enabled) return;
    if (socketRef.current?.connected) return;

    // Get WebSocket URL from environment or use default
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

    console.log(`[PaymentSocket] Connecting to ${wsUrl}/payments for user ${userId}`);

    // Create Socket.IO connection to payments namespace
    const socket = io(`${wsUrl}/payments`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log(`[PaymentSocket] Connected with ID: ${socket.id}`);
      isConnectedRef.current = true;

      // Stop polling when WebSocket connects
      stopPolling();

      // Subscribe to user-specific room for filtered updates (Requirement 7.2)
      socket.emit('subscribe:user', userId, (response: any) => {
        console.log(`[PaymentSocket] Subscribed to user ${userId}:`, response);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[PaymentSocket] Disconnected: ${reason}`);
      isConnectedRef.current = false;

      // Start polling as fallback when WebSocket disconnects
      startPolling();
    });

    socket.on('connect_error', (error) => {
      console.error('[PaymentSocket] Connection error:', error.message);
      
      // Start polling if connection fails
      if (!isConnectedRef.current) {
        startPolling();
      }
    });

    // Listen for payment status changes (Requirement 7.2)
    socket.on('payment:status:changed', (data: PaymentStatusUpdate) => {
      console.log('[PaymentSocket] Payment status changed:', data);
      lastStatusRef.current = data.status;
      onStatusChange(data);
    });

    socketRef.current = socket;
  }, [userId, enabled, onStatusChange, stopPolling, startPolling]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[PaymentSocket] Disconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
    stopPolling();
  }, [stopPolling]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle enabled flag changes
  useEffect(() => {
    if (!enabled) {
      disconnect();
    } else if (enabled && !socketRef.current?.connected && !pollingIntervalRef.current) {
      connect();
    }
  }, [enabled, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    isPolling: pollingIntervalRef.current !== null,
    socket: socketRef.current,
    reconnect: connect,
  };
}
