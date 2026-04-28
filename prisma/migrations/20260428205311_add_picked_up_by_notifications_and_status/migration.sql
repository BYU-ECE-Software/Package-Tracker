/*
  Warnings:

  - You are about to drop the column `isActive` on the `Carrier` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Sender` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Carrier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sender` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'SECRETARY', 'ADMIN');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE', 'PICKED_UP', 'DELIVERED', 'LOST', 'RETURNED', 'DAMAGED', 'HELD');

-- DropForeignKey
ALTER TABLE "Package" DROP CONSTRAINT "Package_recipientId_fkey";

-- DropIndex
DROP INDEX "Carrier_name_key";

-- DropIndex
DROP INDEX "Sender_name_key";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Carrier" DROP COLUMN "isActive",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "pickedUpByUserId" TEXT,
ADD COLUMN     "status" "PackageStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "dateArrived" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Sender" DROP COLUMN "isActive",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_readAt_idx" ON "Notification"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_packageId_idx" ON "Notification"("packageId");

-- CreateIndex
CREATE INDEX "Carrier_hidden_order_idx" ON "Carrier"("hidden", "order");

-- CreateIndex
CREATE INDEX "Package_datePickedUp_idx" ON "Package"("datePickedUp");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "Package"("status");

-- CreateIndex
CREATE INDEX "Sender_hidden_order_idx" ON "Sender"("hidden", "order");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_pickedUpByUserId_fkey" FOREIGN KEY ("pickedUpByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
