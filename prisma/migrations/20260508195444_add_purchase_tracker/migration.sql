/*
  Warnings:

  - You are about to drop the column `senderId` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the `Sender` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('REQUESTED', 'PURCHASED', 'COMPLETED', 'RETURNED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Package" DROP CONSTRAINT "Package_senderId_fkey";

-- DropIndex
DROP INDEX "Package_senderId_idx";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "senderId",
ADD COLUMN     "vendorId" TEXT;

-- DropTable
DROP TABLE "Sender";

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'REQUESTED',
    "shippingPreference" TEXT,
    "purpose" TEXT NOT NULL,
    "workTag" TEXT NOT NULL,
    "cartLink" TEXT,
    "comment" TEXT,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "spendCategoryId" TEXT NOT NULL,
    "lineMemoOptionId" INTEGER,
    "purchasedById" TEXT,
    "creditCard" BOOLEAN,
    "purchaseDate" TIMESTAMP(3),
    "receipt" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'REQUESTED',
    "link" TEXT,
    "file" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibleToStudents" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpendCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineMemoOption" (
    "id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LineMemoOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE INDEX "Vendor_hidden_order_idx" ON "Vendor"("hidden", "order");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_purchasedById_idx" ON "Order"("purchasedById");

-- CreateIndex
CREATE INDEX "Order_professorId_idx" ON "Order"("professorId");

-- CreateIndex
CREATE INDEX "Order_spendCategoryId_idx" ON "Order"("spendCategoryId");

-- CreateIndex
CREATE INDEX "Order_requestDate_idx" ON "Order"("requestDate");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Item_orderId_idx" ON "Item"("orderId");

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SpendCategory_code_key" ON "SpendCategory"("code");

-- CreateIndex
CREATE INDEX "SpendCategory_code_idx" ON "SpendCategory"("code");

-- CreateIndex
CREATE INDEX "Professor_lastName_idx" ON "Professor"("lastName");

-- CreateIndex
CREATE INDEX "Package_vendorId_idx" ON "Package"("vendorId");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_spendCategoryId_fkey" FOREIGN KEY ("spendCategoryId") REFERENCES "SpendCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_lineMemoOptionId_fkey" FOREIGN KEY ("lineMemoOptionId") REFERENCES "LineMemoOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
