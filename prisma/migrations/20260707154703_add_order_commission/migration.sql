-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "commission" DOUBLE PRECISION DEFAULT 0;
