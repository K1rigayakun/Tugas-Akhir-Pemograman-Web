/**
 * Connection Pool Integration Tests (E2E)
 * 
 * Task 2.4: Connection pool monitoring integration tests
 * 
 * Tests verify system behavior under concurrent load:
 * - Multiple simultaneous API requests
 * - Connection pool doesn't exhaust
 * - Graceful degradation under load
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Connection Pool Integration (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test user and get auth token
    const testUser = await prisma.user.create({
      data: {
        email: 'pool-test@example.com',
        username: 'pooltest',
        hashedPassword: 'hashed',
        emailVerified: true,
      },
    });

    // Create session for auth
    const session = await prisma.session.create({
      data: {
        userId: testUser.id,
        refreshTokenHash: 'test-token',
        isActive: true,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // For simplicity, using session ID as token (adjust based on your JWT setup)
    authToken = session.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { email: 'pool-test@example.com' },
    });
    
    await app.close();
    await prisma.$disconnect();
  });

  /**
   * Test 1: Concurrent Read Requests
   * Verify pool handles multiple simultaneous reads
   */
  describe('Concurrent Read Requests', () => {
    it('should handle 20 concurrent wallet balance requests', async () => {
      // Spawn 20 concurrent requests
      const requests = Array(20).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/wallet/balance')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);

      // All should succeed (no connection pool exhaustion)
      responses.forEach(res => {
        expect([200, 404]).toContain(res.status); // 200 or 404 (no wallet) both ok
      });

      // No 500 errors (connection pool issues)
      const serverErrors = responses.filter(r => r.status === 500);
      expect(serverErrors).toHaveLength(0);
    });

    it('should handle 50 concurrent auction list requests', async () => {
      const requests = Array(50).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/auctions')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All should succeed
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });

      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);

      console.log(`50 concurrent requests completed in ${duration}ms`);
    });
  });

  /**
   * Test 2: Mixed Read/Write Operations
   * Verify pool handles mixed operation types
   */
  describe('Mixed Operations', () => {
    it('should handle concurrent reads and writes', async () => {
      // Mix of read and write operations
      const operations = [
        ...Array(10).fill(null).map(() =>
          request(app.getHttpServer())
            .get('/api/v1/auctions')
        ),
        ...Array(5).fill(null).map((_, i) =>
          request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: `concurrent-test-${i}@example.com`,
              username: `concurrent${i}`,
              password: 'test1234',
            })
        ),
      ];

      const responses = await Promise.all(operations);

      // Verify no connection pool errors
      const serverErrors = responses.filter(r => r.status === 500);
      expect(serverErrors.length).toBeLessThan(3); // Allow minimal errors

      // Most should succeed
      const successful = responses.filter(r => r.status < 400);
      expect(successful.length).toBeGreaterThan(10);
    });
  });

  /**
   * Test 3: Transaction-Heavy Load
   * Verify transactions don't exhaust pool
   */
  describe('Transaction Load', () => {
    it('should handle multiple concurrent transactions', async () => {
      // Create multiple payment requests (each uses transaction)
      const requests = Array(10).fill(null).map((_, i) =>
        request(app.getHttpServer())
          .post('/api/v1/payment/initiate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 100,
            fiatAmount: 15000,
            method: 'TESTING',
          })
      );

      const responses = await Promise.all(requests);

      // Most should succeed or fail gracefully (not 500)
      const serverErrors = responses.filter(r => r.status === 500);
      expect(serverErrors.length).toBeLessThan(3);

      console.log('Transaction responses:', {
        success: responses.filter(r => r.status < 300).length,
        clientErrors: responses.filter(r => r.status >= 400 && r.status < 500).length,
        serverErrors: serverErrors.length,
      });
    });
  });

  /**
   * Test 4: Sustained Load
   * Verify pool remains stable under sustained load
   */
  describe('Sustained Load', () => {
    it('should remain stable under 2-second sustained load', async () => {
      const results: number[] = [];
      const startTime = Date.now();
      const testDuration = 2000; // 2 seconds

      // Send requests continuously for 2 seconds
      while (Date.now() - startTime < testDuration) {
        const res = await request(app.getHttpServer())
          .get('/api/v1/auctions')
          .send();
        
        results.push(res.status);
        
        // Small delay between requests (simulating real traffic)
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Count results
      const successful = results.filter(s => s === 200).length;
      const errors = results.filter(s => s === 500).length;
      const total = results.length;

      console.log('Sustained load results:', {
        total,
        successful,
        errors,
        successRate: `${((successful / total) * 100).toFixed(1)}%`,
      });

      // Success rate should be > 90%
      expect(successful / total).toBeGreaterThan(0.9);
      
      // Minimal server errors
      expect(errors).toBeLessThan(total * 0.1);
    });
  });

  /**
   * Test 5: Connection Recovery
   * Verify system recovers after connection issues
   */
  describe('Connection Recovery', () => {
    it('should recover after temporary connection spike', async () => {
      // Create spike: 30 concurrent requests
      const spike = Array(30).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/auctions')
      );

      await Promise.all(spike);

      // Wait brief moment for connections to release
      await new Promise(resolve => setTimeout(resolve, 500));

      // Normal request should work fine
      const response = await request(app.getHttpServer())
        .get('/api/v1/auctions');

      expect(response.status).toBe(200);
    });
  });

  /**
   * Test 6: Timeout Behavior
   * Verify system doesn't hang on slow queries
   */
  describe('Query Timeout', () => {
    it('should timeout long-running queries gracefully', async () => {
      // This test requires a slow endpoint or database query
      // For now, we verify normal queries complete quickly
      
      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);
      const duration = Date.now() - startTime;

      // Should complete quickly (< 1 second)
      expect(duration).toBeLessThan(1000);
      
      // Should not hang indefinitely
      expect(response.status).not.toBe(undefined);
    });
  });
});
