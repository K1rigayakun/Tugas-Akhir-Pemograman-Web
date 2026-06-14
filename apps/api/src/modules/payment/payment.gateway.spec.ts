import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGateway } from './payment.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';

/**
 * Integration tests for PaymentGateway
 * Task 14.3: Test Socket.IO connection and event handling
 * Validates Requirement 7.2: Real-time status updates within 5 seconds
 */
describe('PaymentGateway', () => {
  let gateway: PaymentGateway;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    // Mock Socket.IO server
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    // Mock Socket.IO client
    mockSocket = {
      id: 'test-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentGateway,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<PaymentGateway>(PaymentGateway);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Inject mock server
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockSocket as Socket);
      expect(logSpy).toHaveBeenCalledWith('Payment client connected: test-socket-id');
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockSocket as Socket);
      expect(logSpy).toHaveBeenCalledWith('Payment client disconnected: test-socket-id');
    });
  });

  describe('handleSubscribeUser', () => {
    it('should subscribe client to user-specific room (Requirement 7.2)', () => {
      const userId = 'user-123';
      const result = gateway.handleSubscribeUser(mockSocket as Socket, userId);

      expect(mockSocket.join).toHaveBeenCalledWith('user_user-123');
      expect(result).toEqual({ success: true, room: 'user_user-123' });
    });

    it('should log subscription', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleSubscribeUser(mockSocket as Socket, 'user-456');
      expect(logSpy).toHaveBeenCalledWith('Client test-socket-id subscribed to user_user-456');
    });
  });

  describe('handleUnsubscribeUser', () => {
    it('should unsubscribe client from user room', () => {
      const userId = 'user-789';
      const result = gateway.handleUnsubscribeUser(mockSocket as Socket, userId);

      expect(mockSocket.leave).toHaveBeenCalledWith('user_user-789');
      expect(result).toEqual({ success: true });
    });
  });

  describe('handlePaymentStatusChanged', () => {
    it('should emit payment status change to user room (Requirement 7.2)', () => {
      const payload = {
        topUpRequestId: 'payment-123',
        userId: 'user-abc',
        status: 'PAID',
        amount: 1000,
        fiatAmount: 150000,
        method: 'QRIS',
        provider: 'MIDTRANS',
        paidAt: new Date(),
      };

      gateway.handlePaymentStatusChanged(payload);

      expect(mockServer.to).toHaveBeenCalledWith('user_user-abc');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'payment:status:changed',
        expect.objectContaining({
          topUpRequestId: 'payment-123',
          status: 'PAID',
          amount: 1000,
          fiatAmount: 150000,
          method: 'QRIS',
          provider: 'MIDTRANS',
          timestamp: expect.any(String),
        })
      );
    });

    it('should log status change emission', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      const payload = {
        topUpRequestId: 'payment-456',
        userId: 'user-xyz',
        status: 'APPROVED',
      };

      gateway.handlePaymentStatusChanged(payload);

      expect(logSpy).toHaveBeenCalledWith(
        'Payment status changed: TopUpRequest=payment-456, User=user-xyz, Status=APPROVED'
      );
      expect(logSpy).toHaveBeenCalledWith('Emitted payment:status:changed to room user_user-xyz');
    });

    it('should handle status updates within 5 seconds (Requirement 7.2)', () => {
      const startTime = Date.now();

      const payload = {
        topUpRequestId: 'payment-timing-test',
        userId: 'user-timing',
        status: 'PAID',
      };

      gateway.handlePaymentStatusChanged(payload);

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Verify the emission happens within 5000ms (5 seconds)
      expect(elapsed).toBeLessThan(5000);
      expect(mockServer.emit).toHaveBeenCalled();
    });
  });

  describe('notifyUser', () => {
    it('should send direct notification to user', () => {
      const userId = 'user-direct';
      const payload = { message: 'Test notification' };

      gateway.notifyUser(userId, payload);

      expect(mockServer.to).toHaveBeenCalledWith('user_user-direct');
      expect(mockServer.emit).toHaveBeenCalledWith('payment:status:changed', payload);
    });
  });

  describe('Integration: Payment Status Flow', () => {
    it('should handle complete payment status update flow', () => {
      // Simulate client connecting and subscribing
      gateway.handleConnection(mockSocket as Socket);
      gateway.handleSubscribeUser(mockSocket as Socket, 'user-flow-test');

      // Simulate payment status change event
      const statusUpdate = {
        topUpRequestId: 'payment-flow',
        userId: 'user-flow-test',
        status: 'PAID',
        amount: 500,
        fiatAmount: 75000,
      };

      gateway.handlePaymentStatusChanged(statusUpdate);

      // Verify the message was emitted to correct room
      expect(mockSocket.join).toHaveBeenCalledWith('user_user-flow-test');
      expect(mockServer.to).toHaveBeenCalledWith('user_user-flow-test');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'payment:status:changed',
        expect.objectContaining({
          topUpRequestId: 'payment-flow',
          status: 'PAID',
          amount: 500,
        })
      );
    });
  });
});
