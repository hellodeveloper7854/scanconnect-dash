-- Soft-delete marker for QR codes: deleting from QR Code Management now sets
-- this instead of removing the row, so it can be recovered from a trash view.

-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "QrCode_deletedAt_idx" ON "QrCode"("deletedAt");
