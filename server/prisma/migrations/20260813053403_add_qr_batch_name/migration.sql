/*
  Warnings:

  - Added the required column `batchName` to the `QrCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN     "batchName" TEXT;

-- Backfill existing rows (pre-dating named batches) with a placeholder name
UPDATE "QrCode" SET "batchName" = 'Unnamed batch' WHERE "batchName" IS NULL;

ALTER TABLE "QrCode" ALTER COLUMN "batchName" SET NOT NULL;

-- CreateIndex
CREATE INDEX "QrCode_batchName_idx" ON "QrCode"("batchName");
