/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isManager` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRank" AS ENUM ('USER', 'ADMIN', 'MANAGER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
DROP COLUMN "isManager",
ADD COLUMN     "rank" "UserRank" NOT NULL DEFAULT 'USER';
