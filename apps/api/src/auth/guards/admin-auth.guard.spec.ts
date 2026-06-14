import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AdminAuthGuard } from "./admin-auth.guard";
import { JwtService } from "../../common/auth/jwt.service";

describe("AdminAuthGuard", () => {
  let guard: AdminAuthGuard;
  let jwtService: JwtService;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    // Mock JwtService
    jwtService = {
      verify: jest.fn(),
    } as any;

    guard = new AdminAuthGuard(jwtService);

    // Mock request object
    mockRequest = {
      headers: {},
      user: null,
    };

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  describe("canActivate", () => {
    it("should throw UnauthorizedException when Authorization header is missing", () => {
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        "Token tidak ditemukan. Silakan login sebagai admin.",
      );
    });

    it("should throw UnauthorizedException when Authorization header does not start with Bearer", () => {
      mockRequest.headers.authorization = "InvalidFormat token123";

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when JWT token is invalid", () => {
      mockRequest.headers.authorization = "Bearer invalid-token";
      (jwtService.verify as jest.Mock).mockReturnValue(null);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        "Token tidak valid atau sudah expired. Silakan login ulang.",
      );
    });

    it("should throw UnauthorizedException when token type is not access", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "refresh",
        sub: "user-123",
        email: "admin@example.com",
        adminRole: "SUPER_ADMIN",
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        "Token type tidak valid. Gunakan access token.",
      );
    });

    it("should throw UnauthorizedException when user has no adminRole", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-123",
        email: "user@example.com",
        role: "USER",
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        "Akses ditolak. Hanya admin yang dapat mengakses resource ini.",
      );
    });

    it("should throw UnauthorizedException when adminRole is invalid", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-123",
        email: "admin@example.com",
        adminRole: "INVALID_ROLE",
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it("should allow access for SUPER_ADMIN role", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-123",
        email: "admin@example.com",
        role: "USER",
        adminRole: "SUPER_ADMIN",
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "admin@example.com",
        role: "USER",
        adminRole: "SUPER_ADMIN",
      });
    });

    it("should allow access for AUCTION_MANAGER role", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-456",
        email: "manager@example.com",
        role: "USER",
        adminRole: "AUCTION_MANAGER",
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({
        id: "user-456",
        email: "manager@example.com",
        role: "USER",
        adminRole: "AUCTION_MANAGER",
      });
    });

    it("should allow access for KYC_OFFICER role", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-789",
        email: "kyc@example.com",
        role: "USER",
        adminRole: "KYC_OFFICER",
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user.adminRole).toBe("KYC_OFFICER");
    });

    it("should allow access for CONTENT_MANAGER role", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-101",
        email: "content@example.com",
        role: "USER",
        adminRole: "CONTENT_MANAGER",
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user.adminRole).toBe("CONTENT_MANAGER");
    });

    it("should allow access for SUPPORT_OFFICER role", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      (jwtService.verify as jest.Mock).mockReturnValue({
        type: "access",
        sub: "user-202",
        email: "support@example.com",
        role: "USER",
        adminRole: "SUPPORT_OFFICER",
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user.adminRole).toBe("SUPPORT_OFFICER");
    });

    it("should set user object in request for valid admin", () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      const payload = {
        type: "access",
        sub: "user-123",
        email: "admin@example.com",
        role: "USER",
        adminRole: "SUPER_ADMIN",
      };
      (jwtService.verify as jest.Mock).mockReturnValue(payload);

      guard.canActivate(mockExecutionContext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.id).toBe("user-123");
      expect(mockRequest.user.email).toBe("admin@example.com");
      expect(mockRequest.user.adminRole).toBe("SUPER_ADMIN");
    });
  });
});
