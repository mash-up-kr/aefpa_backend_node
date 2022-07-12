/*
  Warnings:

  - You are about to alter the column `kick` on the `Log` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(20)`.
  - You are about to alter the column `title` on the `Log` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "kick" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(20);
