-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "emergencyContactId" TEXT,
ADD COLUMN     "vehicleId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_emergencyContactId_fkey" FOREIGN KEY ("emergencyContactId") REFERENCES "EmergencyContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
