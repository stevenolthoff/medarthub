-- CreateEnum
CREATE TYPE "ArtworkStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "artworks" ADD COLUMN     "status" "ArtworkStatus" NOT NULL DEFAULT 'DRAFT';
