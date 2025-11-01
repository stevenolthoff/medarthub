/*
  Warnings:

  - A unique constraint covering the columns `[profilePicImageId]` on the table `artists` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "artists" ADD COLUMN     "profilePicImageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "artists_profilePicImageId_key" ON "artists"("profilePicImageId");

-- AddForeignKey
ALTER TABLE "artists" ADD CONSTRAINT "artists_profilePicImageId_fkey" FOREIGN KEY ("profilePicImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

