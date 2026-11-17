-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "imageId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteImage" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteContent_page_idx" ON "SiteContent"("page");

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_page_key_key" ON "SiteContent"("page", "key");

-- AddForeignKey
ALTER TABLE "SiteContent" ADD CONSTRAINT "SiteContent_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "SiteImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
