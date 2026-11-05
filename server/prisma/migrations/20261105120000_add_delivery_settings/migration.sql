-- CreateTable
CREATE TABLE "DeliverySetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "defaultMinDays" INTEGER NOT NULL DEFAULT 4,
    "defaultMaxDays" INTEGER NOT NULL DEFAULT 7,
    "rules" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySetting_pkey" PRIMARY KEY ("id")
);
