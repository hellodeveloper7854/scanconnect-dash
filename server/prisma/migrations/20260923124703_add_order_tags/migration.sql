-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "tagsPerUnit" JSONB;

-- CreateTable
CREATE TABLE "OrderTag" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "qrToken" TEXT NOT NULL,
    "vehicleId" TEXT,
    "emergencyContactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderTag_qrToken_key" ON "OrderTag"("qrToken");

-- CreateIndex
CREATE INDEX "OrderTag_orderId_idx" ON "OrderTag"("orderId");

-- CreateIndex
CREATE INDEX "OrderTag_orderItemId_idx" ON "OrderTag"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderTag_vehicleId_idx" ON "OrderTag"("vehicleId");

-- AddForeignKey
ALTER TABLE "OrderTag" ADD CONSTRAINT "OrderTag_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTag" ADD CONSTRAINT "OrderTag_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTag" ADD CONSTRAINT "OrderTag_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTag" ADD CONSTRAINT "OrderTag_emergencyContactId_fkey" FOREIGN KEY ("emergencyContactId") REFERENCES "EmergencyContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
