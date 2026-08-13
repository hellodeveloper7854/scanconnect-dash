-- CreateEnum
CREATE TYPE "QrCodeStatus" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "QrCodeStatus" NOT NULL DEFAULT 'INACTIVE',
    "batchId" TEXT NOT NULL,
    "batchCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmergencyContactToQrCode" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmergencyContactToQrCode_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_code_key" ON "QrCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_vehicleId_key" ON "QrCode"("vehicleId");

-- CreateIndex
CREATE INDEX "QrCode_batchId_idx" ON "QrCode"("batchId");

-- CreateIndex
CREATE INDEX "QrCode_status_idx" ON "QrCode"("status");

-- CreateIndex
CREATE INDEX "_EmergencyContactToQrCode_B_index" ON "_EmergencyContactToQrCode"("B");

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmergencyContactToQrCode" ADD CONSTRAINT "_EmergencyContactToQrCode_A_fkey" FOREIGN KEY ("A") REFERENCES "EmergencyContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmergencyContactToQrCode" ADD CONSTRAINT "_EmergencyContactToQrCode_B_fkey" FOREIGN KEY ("B") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
