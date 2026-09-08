-- CreateTable
CREATE TABLE "MaskedCallRequest" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "targetKind" TEXT NOT NULL,
    "targetIndex" INTEGER,
    "callerPhone" TEXT NOT NULL,
    "virtualNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaskedCallRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaskedCallRequest_qrCodeId_idx" ON "MaskedCallRequest"("qrCodeId");

-- AddForeignKey
ALTER TABLE "MaskedCallRequest" ADD CONSTRAINT "MaskedCallRequest_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
