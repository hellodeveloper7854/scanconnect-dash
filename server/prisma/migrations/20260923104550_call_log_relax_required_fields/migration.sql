-- DropIndex
DROP INDEX "CallLog_providerCallId_key";

-- AlterTable
ALTER TABLE "CallLog" ALTER COLUMN "callerNumber" DROP NOT NULL,
ALTER COLUMN "destinationNumber" DROP NOT NULL,
ALTER COLUMN "providerCallId" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CallLog_providerCallId_idx" ON "CallLog"("providerCallId");
