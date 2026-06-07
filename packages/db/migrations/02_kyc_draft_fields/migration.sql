-- Allow KYC wizard drafts and enforce one NIK per account with a stable hash.
ALTER TABLE "user_kyc"
  ADD COLUMN "nationalIdHash" TEXT,
  ALTER COLUMN "fullName" DROP NOT NULL,
  ALTER COLUMN "nationalId" DROP NOT NULL,
  ALTER COLUMN "dateOfBirth" DROP NOT NULL,
  ALTER COLUMN "phoneNumber" DROP NOT NULL,
  ALTER COLUMN "streetAddress" DROP NOT NULL,
  ALTER COLUMN "city" DROP NOT NULL,
  ALTER COLUMN "province" DROP NOT NULL,
  ALTER COLUMN "postalCode" DROP NOT NULL,
  ALTER COLUMN "idDocumentKey" DROP NOT NULL,
  ALTER COLUMN "selfieKey" DROP NOT NULL;

CREATE UNIQUE INDEX "user_kyc_nationalIdHash_key" ON "user_kyc"("nationalIdHash");
