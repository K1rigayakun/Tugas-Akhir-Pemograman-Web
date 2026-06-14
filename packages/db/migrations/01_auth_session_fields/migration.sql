-- Auth verification and refresh-token rotation fields.
ALTER TABLE "users"
  ADD COLUMN "otpHash" TEXT,
  ADD COLUMN "otpExpiresAt" TIMESTAMP(3);

ALTER TABLE "sessions"
  ADD COLUMN "refreshTokenHash" TEXT,
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "userAgent" TEXT;
