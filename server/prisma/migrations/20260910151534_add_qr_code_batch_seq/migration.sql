-- 1-indexed position of a QR code within its batch, used to format the
-- human-readable ID as sc-{batchName}-0001 (numbering restarts per batch).

-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN "batchSeq" INTEGER NOT NULL DEFAULT 1;

-- Back-fill existing rows: number each batch's codes 1..N in creation order.
WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "batchId" ORDER BY "createdAt", "id") AS rn
  FROM "QrCode"
)
UPDATE "QrCode"
SET "batchSeq" = numbered.rn
FROM numbered
WHERE "QrCode"."id" = numbered."id";
