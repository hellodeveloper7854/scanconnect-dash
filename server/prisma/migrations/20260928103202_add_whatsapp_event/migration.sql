-- CreateTable
CREATE TABLE "WhatsAppEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "gupshupMessageId" TEXT,
    "phoneNumber" TEXT,
    "status" TEXT,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsAppEvent_eventType_idx" ON "WhatsAppEvent"("eventType");

-- CreateIndex
CREATE INDEX "WhatsAppEvent_gupshupMessageId_idx" ON "WhatsAppEvent"("gupshupMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppEvent_phoneNumber_idx" ON "WhatsAppEvent"("phoneNumber");

-- CreateIndex
CREATE INDEX "WhatsAppEvent_createdAt_idx" ON "WhatsAppEvent"("createdAt");
