/*
  Warnings:

  - A unique constraint covering the columns `[userEmail]` on the table `TwoFA` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TwoFA_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "TwoFA_userEmail_key" ON "TwoFA"("userEmail");
