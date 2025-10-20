/*
  Warnings:

  - A unique constraint covering the columns `[coverImageId]` on the table `artworks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "artworks" ADD COLUMN     "coverImageId" TEXT;

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "originalArtworkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "images_key_key" ON "images"("key");

-- CreateIndex
CREATE UNIQUE INDEX "images_originalArtworkId_key" ON "images"("originalArtworkId");

-- CreateIndex
CREATE UNIQUE INDEX "artworks_coverImageId_key" ON "artworks"("coverImageId");

-- AddForeignKey
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
