-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "maskedCallRequestId" TEXT,
    "callerNumber" TEXT NOT NULL,
    "destinationNumber" TEXT NOT NULL,
    "providerCallId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CallLog_providerCallId_key" ON "CallLog"("providerCallId");

-- CreateIndex
CREATE INDEX "CallLog_maskedCallRequestId_idx" ON "CallLog"("maskedCallRequestId");

-- CreateIndex
CREATE INDEX "CallLog_callerNumber_idx" ON "CallLog"("callerNumber");

-- CreateIndex
CREATE INDEX "CallLog_createdAt_idx" ON "CallLog"("createdAt");

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_maskedCallRequestId_fkey" FOREIGN KEY ("maskedCallRequestId") REFERENCES "MaskedCallRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
