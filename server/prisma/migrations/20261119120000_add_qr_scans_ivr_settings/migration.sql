-- CreateTable
CREATE TABLE "QrScan" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "os" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IvrNumberSetting" (
    "phoneNumber" TEXT NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IvrNumberSetting_pkey" PRIMARY KEY ("phoneNumber")
);

-- CreateIndex
CREATE INDEX "QrScan_qrCodeId_idx" ON "QrScan"("qrCodeId");

-- CreateIndex
CREATE INDEX "QrScan_createdAt_idx" ON "QrScan"("createdAt");

-- AddForeignKey
ALTER TABLE "QrScan" ADD CONSTRAINT "QrScan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
