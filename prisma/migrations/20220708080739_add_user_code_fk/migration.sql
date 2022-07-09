/*
  Warnings:

  - Added the required column `userId` to the `UserCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCode" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserCode" ADD CONSTRAINT "UserCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
