-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "application" TEXT,
ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "colorable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "colors" JSONB,
ADD COLUMN     "oldPrice" DOUBLE PRECISION,
ADD COLUMN     "packaging" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shortSpec" TEXT,
ADD COLUMN     "specs" JSONB,
ADD COLUMN     "surfaces" TEXT[],
ADD COLUMN     "type" TEXT;
