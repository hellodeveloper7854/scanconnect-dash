-- Live, checkout-facing coupons (Coupon), distinct from the unused
-- DemoCoupon demo model. Adds subtotal/discount/coupon fields to Order.

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "percentageValue" INTEGER,
    "fixedValueInPaise" INTEGER,
    "minOrderInPaise" INTEGER,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "subtotalInPaise" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "discountInPaise" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "couponId" TEXT,
  ADD COLUMN "couponCode" TEXT;

-- Back-fill subtotalInPaise for existing orders (no discount existed before this feature).
UPDATE "Order" SET "subtotalInPaise" = "totalInPaise" WHERE "subtotalInPaise" = 0;

-- CreateIndex
CREATE INDEX "Order_couponId_idx" ON "Order"("couponId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
