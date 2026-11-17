-- CreateTable
CREATE TABLE "CmsPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "metaDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "ctaLabel" TEXT,
    "linkUrl" TEXT,
    "imageUrl" TEXT,
    "placement" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");

-- CreateIndex
CREATE INDEX "Banner_placement_active_idx" ON "Banner"("placement", "active");

-- CreateIndex
CREATE INDEX "Faq_sortOrder_idx" ON "Faq"("sortOrder");

-- Seed: the website's built-in FAQs, so the FAQ page looks the same on day one and is editable.
INSERT INTO "Faq" ("id", "category", "question", "answer", "sortOrder", "published", "updatedAt") VALUES
 (gen_random_uuid()::text, 'Vehicle documents', 'How do I transfer a car RC to a new owner in India?', 'Both buyer and seller apply through the RTO with Form 29 & 30, NOC (if interstate), PUC, insurance and ID proof. The RTO updates ownership in the VAHAN database. Allow 2–4 weeks depending on the state.', 10, true, CURRENT_TIMESTAMP),
 (gen_random_uuid()::text, 'Vehicle documents', 'What is PUC and how often do I need it?', 'A Pollution Under Control (PUC) certificate confirms your vehicle meets emission norms. Petrol/CNG vehicles typically renew every 6 months, and diesel every 6–12 months depending on the state.', 20, true, CURRENT_TIMESTAMP),
 (gen_random_uuid()::text, 'Vehicle documents', 'Is FASTag mandatory on highways?', 'Yes. FASTag is mandatory for all four-wheelers on national and state highways in India. Vehicles without a valid FASTag are charged double the toll fee at plazas.', 30, true, CURRENT_TIMESTAMP),
 (gen_random_uuid()::text, 'Scan Connect Tag', 'How does a Scan Connect Tag protect my privacy?', 'When someone scans your tag, they can call or WhatsApp you through a masked number. Your real phone number is never shown to the person scanning, and theirs is never shown to you.', 40, true, CURRENT_TIMESTAMP),
 (gen_random_uuid()::text, 'Scan Connect Tag', 'What happens if my Scan Connect Tag is lost or damaged?', 'You can report a lost or damaged tag from your Profile page and order a replacement. Your existing QR activation and contact settings carry over to the new tag.', 50, true, CURRENT_TIMESTAMP);

-- Seed: the built-in website pages, listed in the admin as "built-in" until content is published for them.
INSERT INTO "CmsPage" ("id", "slug", "title", "content", "published", "isSystem", "updatedAt") VALUES
 (gen_random_uuid()::text, 'terms', 'Terms & Conditions', '', false, true, CURRENT_TIMESTAMP),
 (gen_random_uuid()::text, 'shipping-policy', 'Shipping Policy', '', false, true, CURRENT_TIMESTAMP),
 (gen_random_uuid()::text, 'refund-returns', 'Refund & Returns', '', false, true, CURRENT_TIMESTAMP);
