-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'SECRETARY', 'ADMIN');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('AWAITING_ARRIVAL', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP', 'RETURNED_TO_SENDER', 'LOST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "netId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "sender" TEXT,
    "status" "PackageStatus" NOT NULL DEFAULT 'AWAITING_ARRIVAL',
    "expectedArrivalDate" TIMESTAMP(3),
    "dateArrived" TIMESTAMP(3),
    "datePickedUp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "checkedInById" TEXT,
    "checkedOutById" TEXT,
    "notes" TEXT,
    "location" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_netId_key" ON "User"("netId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_netId_idx" ON "User"("netId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Package_trackingNumber_key" ON "Package"("trackingNumber");

-- CreateIndex
CREATE INDEX "Package_studentId_idx" ON "Package"("studentId");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "Package"("status");

-- CreateIndex
CREATE INDEX "Package_trackingNumber_idx" ON "Package"("trackingNumber");

-- CreateIndex
CREATE INDEX "Package_dateArrived_idx" ON "Package"("dateArrived");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
