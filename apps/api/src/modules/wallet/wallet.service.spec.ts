import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { WalletService, WalletTxType } from "./wallet.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("WalletService - createTransaction and calculateBalanceChange", () => {
  let service: WalletService;
  let prisma: PrismaService;

  const mockWalletId = "wallet-123";
  const mockTransaction = {
    id: "tx-123",
    walletId: mockWalletId,
    type: WalletTxType.TOP_UP,
    amount: 1000,
    description: "Test top-up",
    referenceId: "ref-123",
    idempotencyKey: "idem-123",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            walletTransaction: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            walletAccount: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("createTransaction", () => {
    it("should create a transaction and update balance atomically for TOP_UP", async () => {
      const txCallback = jest.fn(async (callback) => callback(prisma));
      (prisma.$transaction as jest.Mock).mockImplementation(txCallback);
      (prisma.walletTransaction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.walletTransaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.walletAccount.update as jest.Mock).mockResolvedValue({ balance: 1000 });

      const result = await service.createTransaction(
        mockWalletId,
        WalletTxType.TOP_UP,
        1000,
        "Test top-up",
        "idem-123",
        "ref-123"
      );

      expect(result).toEqual(mockTransaction);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.walletTransaction.findUnique).toHaveBeenCalledWith({
        where: { idempotencyKey: "idem-123" },
      });
      expect(prisma.walletTransaction.create).toHaveBeenCalledWith({
        data: {
          walletId: mockWalletId,
          type: WalletTxType.TOP_UP,
          amount: 1000,
          description: "Test top-up",
          referenceId: "ref-123",
          idempotencyKey: "idem-123",
        },
      });
      expect(prisma.walletAccount.update).toHaveBeenCalledWith({
        where: { id: mockWalletId },
        data: { balance: { increment: 1000 } },
      });
    });

    it("should handle idempotency - return existing transaction if already exists", async () => {
      const existingTx = { ...mockTransaction };
      const txCallback = jest.fn(async (callback) => callback(prisma));
      (prisma.$transaction as jest.Mock).mockImplementation(txCallback);
      (prisma.walletTransaction.findUnique as jest.Mock).mockResolvedValue(existingTx);

      const result = await service.createTransaction(
        mockWalletId,
        WalletTxType.TOP_UP,
        1000,
        "Test top-up",
        "idem-123"
      );

      expect(result).toEqual(existingTx);
      expect(prisma.walletTransaction.create).not.toHaveBeenCalled();
      expect(prisma.walletAccount.update).not.toHaveBeenCalled();
    });

    it("should throw error for negative amount", async () => {
      await expect(
        service.createTransaction(
          mockWalletId,
          WalletTxType.TOP_UP,
          -100,
          "Invalid",
          "idem-123"
        )
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw error for zero amount", async () => {
      await expect(
        service.createTransaction(
          mockWalletId,
          WalletTxType.TOP_UP,
          0,
          "Invalid",
          "idem-123"
        )
      ).rejects.toThrow(BadRequestException);
    });

    it("should create BID_DEDUCT transaction with negative balance change", async () => {
      const txCallback = jest.fn(async (callback) => callback(prisma));
      (prisma.$transaction as jest.Mock).mockImplementation(txCallback);
      (prisma.walletTransaction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.walletTransaction.create as jest.Mock).mockResolvedValue({
        ...mockTransaction,
        type: WalletTxType.BID_DEDUCT,
      });
      (prisma.walletAccount.update as jest.Mock).mockResolvedValue({ balance: 500 });

      await service.createTransaction(
        mockWalletId,
        WalletTxType.BID_DEDUCT,
        500,
        "Bid deduction",
        "idem-bid-123"
      );

      expect(prisma.walletAccount.update).toHaveBeenCalledWith({
        where: { id: mockWalletId },
        data: { balance: { increment: -500 } },
      });
    });
  });

  describe("calculateBalanceChange", () => {
    it("should return positive value for TOP_UP", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.TOP_UP, 1000);
      expect(result).toBe(1000);
    });

    it("should return positive value for CASHBACK", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.CASHBACK, 50);
      expect(result).toBe(50);
    });

    it("should return positive value for REFUND", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.REFUND, 200);
      expect(result).toBe(200);
    });

    it("should return positive value for BONUS", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.BONUS, 100);
      expect(result).toBe(100);
    });

    it("should return zero for BID_HOLD (only affects pendingHold)", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.BID_HOLD, 1000);
      expect(result).toBe(0);
    });

    it("should return zero for BID_RELEASE (only affects pendingHold)", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.BID_RELEASE, 500);
      expect(result).toBe(0);
    });

    it("should return negative value for BID_DEDUCT", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.BID_DEDUCT, 500);
      expect(result).toBe(-500);
    });

    it("should return negative value for SHOP_PURCHASE", () => {
      const result = (service as any).calculateBalanceChange(WalletTxType.SHOP_PURCHASE, 300);
      expect(result).toBe(-300);
    });

    it("should throw error for unknown transaction type", () => {
      expect(() => {
        (service as any).calculateBalanceChange("UNKNOWN_TYPE" as any, 100);
      }).toThrow(BadRequestException);
    });
  });
});
