-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_UPDATE';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "courierName" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingId" TEXT;
