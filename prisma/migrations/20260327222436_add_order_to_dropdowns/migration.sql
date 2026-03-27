-- AlterTable
ALTER TABLE "Carrier" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sender" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- RenameForeignKey
ALTER TABLE "Package" RENAME CONSTRAINT "Package_studentId_fkey" TO "Package_recipientId_fkey";
