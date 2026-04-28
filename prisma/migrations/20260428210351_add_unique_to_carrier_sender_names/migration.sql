/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Carrier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Sender` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Carrier_name_key" ON "Carrier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sender_name_key" ON "Sender"("name");
