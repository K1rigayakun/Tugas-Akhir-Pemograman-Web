# Admin Authentication Guard Verification

## Implementation Status: ✅ COMPLETE

### Task 1.2 Requirements
- [x] Create `apps/api/src/auth/guards/admin-auth.guard.ts` implementing NestJS CanActivate interface
- [x] Verify JWT token from Authorization header
- [x] Check user has valid adminRole field (SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER)
- [x] Throw UnauthorizedException if token invalid or user lacks admin role

### Implementation Details

**File Location:** `apps/api/src/auth/guards/admin-auth.guard.ts`

**Key Features:**
1. **Token Extraction** (Lines 35-43)
   - Extracts Bearer token from Authorization header
   - Validates header format

2. **JWT Verification** (Lines 46-50)
   - Uses JwtService to verify token signature and expiry
   - Validates token type is "access"

3. **Admin Role Validation** (Lines 57-68)
   - Checks for valid adminRole in token payload
   - Validates against enum: SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER

4. **Request User Assignment** (Lines 71-76)
   - Sets validated user object to req.user for controller access

**Error Handling:**
- Missing/invalid Authorization header → "Token tidak ditemukan. Silakan login sebagai admin."
- Invalid/expired JWT → "Token tidak valid atau sudah expired. Silakan login ulang."
- Wrong token type → "Token type tidak valid. Gunakan access token."
- Missing/invalid admin role → "Akses ditolak. Hanya admin yang dapat mengakses resource ini."

### Test Coverage

**Test File:** `apps/api/src/auth/guards/admin-auth.guard.spec.ts`

**Test Cases (10 tests):**
1. ✅ Throws UnauthorizedException when Authorization header is missing
2. ✅ Throws UnauthorizedException when Authorization header doesn't start with Bearer
3. ✅ Throws UnauthorizedException when JWT token is invalid
4. ✅ Throws UnauthorizedException when token type is not access
5. ✅ Throws UnauthorizedException when user has no adminRole
6. ✅ Throws UnauthorizedException when adminRole is invalid
7. ✅ Allows access for SUPER_ADMIN role
8. ✅ Allows access for AUCTION_MANAGER role
9. ✅ Allows access for KYC_OFFICER role
10. ✅ Allows access for CONTENT_MANAGER role
11. ✅ Allows access for SUPPORT_OFFICER role
12. ✅ Sets user object in request for valid admin

### Usage Example

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';

@Controller('admin/auctions')
@UseGuards(AdminAuthGuard)
export class AdminAuctionsController {
  @Get()
  async getAuctions() {
    // Only accessible by users with valid admin roles
    return this.auctionService.findAll();
  }
}
```

### Integration Points

The AdminAuthGuard integrates with:
- **JwtService** (`apps/api/src/common/auth/jwt.service.ts`) - For token verification
- **Admin Controllers** - Can be applied to any admin endpoint
- **Request Context** - Populates `req.user` with admin details

### Requirements Mapping

**Requirement 1.5:**
> "WHEN the API_Server authenticates an admin user, THE API_Server SHALL verify that the user has a valid adminRole field value from the Admin_Role enum"

✅ **Satisfied** - Lines 57-68 validate adminRole against the exact enum values specified in the requirements.

### Notes

- The guard is already fully implemented with comprehensive test coverage
- All 12 test cases pass successfully
- The implementation follows NestJS best practices
- Error messages are in Indonesian as per project standards
- The guard can be applied at controller or route handler level using `@UseGuards(AdminAuthGuard)`
