/*
  Warnings:

  - You are about to drop the column `carrier` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `expectedArrivalDate` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `trackingNumber` on the `Package` table. All the data in the column will be lost.
  - Made the column `dateArrived` on table `Package` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Package_status_idx";

-- DropIndex
DROP INDEX "Package_trackingNumber_idx";

-- DropIndex
DROP INDEX "Package_trackingNumber_key";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "carrier",
DROP COLUMN "expectedArrivalDate",
DROP COLUMN "location",
DROP COLUMN "sender",
DROP COLUMN "status",
DROP COLUMN "trackingNumber",
ADD COLUMN     "carrierId" TEXT,
ADD COLUMN     "deliveredToOffice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderId" TEXT,
ALTER COLUMN "dateArrived" SET NOT NULL,
ALTER COLUMN "dateArrived" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "PackageStatus";

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Sender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_name_key" ON "Carrier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sender_name_key" ON "Sender"("name");

-- CreateIndex
CREATE INDEX "Package_carrierId_idx" ON "Package"("carrierId");

-- CreateIndex
CREATE INDEX "Package_senderId_idx" ON "Package"("senderId");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Sender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
