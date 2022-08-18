/*
  Warnings:

  - The primary key for the `UserGoodLog` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "UserGoodLog" DROP CONSTRAINT "UserGoodLog_logId_fkey";

-- AlterTable
ALTER TABLE "UserGoodLog" DROP CONSTRAINT "UserGoodLog_pkey",
ADD COLUMN     "detailLogId" INTEGER,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "logId" DROP NOT NULL,
ADD CONSTRAINT "UserGoodLog_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "UserGoodLog" ADD CONSTRAINT "UserGoodLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoodLog" ADD CONSTRAINT "UserGoodLog_detailLogId_fkey" FOREIGN KEY ("detailLogId") REFERENCES "DetailLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
