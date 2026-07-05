-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "promoCode" TEXT;
