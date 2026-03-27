-- Rename studentId to recipientId on Package table
ALTER TABLE "Package" RENAME COLUMN "studentId" TO "recipientId";

-- Rename the index
DROP INDEX IF EXISTS "Package_studentId_idx";
CREATE INDEX "Package_recipientId_idx" ON "Package"("recipientId");
