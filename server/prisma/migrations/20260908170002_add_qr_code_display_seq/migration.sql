-- Sequential, human-readable QR identifier (e.g. SCANCONNECT000001), used only
-- for admin lookup — never in the scan URL. Added as nullable first so
-- existing rows can be back-filled before the sequence/default/unique
-- constraint are attached, since a plain autoincrement default would assign
-- every existing row the same starting value and violate uniqueness.

-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN "displaySeq" INTEGER;

-- Back-fill existing rows in creation order, oldest gets the lowest number.
WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn
  FROM "QrCode"
)
UPDATE "QrCode"
SET "displaySeq" = numbered.rn
FROM numbered
WHERE "QrCode"."id" = numbered."id";

-- Create the sequence starting after the highest back-filled value (or 1 if
-- the table was empty) so newly inserted rows continue the same numbering.
DO $$
DECLARE
  next_val INTEGER;
BEGIN
  SELECT COALESCE(MAX("displaySeq"), 0) + 1 INTO next_val FROM "QrCode";
  EXECUTE format('CREATE SEQUENCE "QrCode_displaySeq_seq" START WITH %s', next_val);
END $$;

ALTER TABLE "QrCode" ALTER COLUMN "displaySeq" SET DEFAULT nextval('"QrCode_displaySeq_seq"');
ALTER SEQUENCE "QrCode_displaySeq_seq" OWNED BY "QrCode"."displaySeq";

-- Now safe to enforce NOT NULL + UNIQUE.
ALTER TABLE "QrCode" ALTER COLUMN "displaySeq" SET NOT NULL;
CREATE UNIQUE INDEX "QrCode_displaySeq_key" ON "QrCode"("displaySeq");
