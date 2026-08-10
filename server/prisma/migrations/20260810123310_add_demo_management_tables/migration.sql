-- CreateEnum
CREATE TYPE "DemoQrStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DemoStickerStatus" AS ENUM ('ORDERED', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "DemoIvrStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DemoCouponType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "DemoNotificationStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT');

-- CreateTable
CREATE TABLE "DemoQrCode" (
    "id" TEXT NOT NULL,
    "vehicleNickname" TEXT NOT NULL,
    "status" "DemoQrStatus" NOT NULL DEFAULT 'ACTIVE',
    "scans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoQrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoStickerOrder" (
    "id" TEXT NOT NULL,
    "vehicleNickname" TEXT NOT NULL,
    "status" "DemoStickerStatus" NOT NULL DEFAULT 'ORDERED',
    "trackingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoStickerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoIvrNumber" (
    "id" TEXT NOT NULL,
    "virtualNumber" TEXT NOT NULL,
    "assignedTo" TEXT,
    "status" "DemoIvrStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoIvrNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceInPaise" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DemoCouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "usageLimit" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoNotificationCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "status" "DemoNotificationStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoNotificationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoCmsPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoCmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoFaq" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoAuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoCallLog" (
    "id" TEXT NOT NULL,
    "fromLabel" TEXT NOT NULL,
    "toLabel" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoSystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "smtpConfigured" BOOLEAN NOT NULL DEFAULT false,
    "smsGatewayConfigured" BOOLEAN NOT NULL DEFAULT false,
    "pushNotificationsConfigured" BOOLEAN NOT NULL DEFAULT true,
    "paymentGatewayConfigured" BOOLEAN NOT NULL DEFAULT true,
    "cloudIvrConfigured" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "appVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoCoupon_code_key" ON "DemoCoupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DemoCmsPage_slug_key" ON "DemoCmsPage"("slug");
