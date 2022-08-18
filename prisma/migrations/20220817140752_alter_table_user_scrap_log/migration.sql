/*
  Warnings:

  - The primary key for the `UserScrapLog` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "UserScrapLog" DROP CONSTRAINT "UserScrapLog_logId_fkey";

-- AlterTable
ALTER TABLE "UserScrapLog" DROP CONSTRAINT "UserScrapLog_pkey",
ADD COLUMN     "detailLogId" INTEGER,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "logId" DROP NOT NULL,
ADD CONSTRAINT "UserScrapLog_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "UserScrapLog" ADD CONSTRAINT "UserScrapLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScrapLog" ADD CONSTRAINT "UserScrapLog_detailLogId_fkey" FOREIGN KEY ("detailLogId") REFERENCES "DetailLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
