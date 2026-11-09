-- AlterTable
ALTER TABLE "EmergencyContact" ADD COLUMN "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "whatsappOptInAt" TIMESTAMP(3);
