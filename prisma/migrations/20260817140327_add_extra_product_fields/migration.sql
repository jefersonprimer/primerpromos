-- DropIndex
DROP INDEX "products_created_at_idx";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "coupon" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "store_url" TEXT,
ALTER COLUMN "cash_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "installment_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
