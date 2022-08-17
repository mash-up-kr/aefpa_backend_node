-- DropForeignKey
ALTER TABLE "UserGoodLog" DROP CONSTRAINT "UserGoodLog_detailLogId_fkey";

-- DropForeignKey
ALTER TABLE "UserGoodLog" DROP CONSTRAINT "UserGoodLog_logId_fkey";

-- DropForeignKey
ALTER TABLE "UserScrapLog" DROP CONSTRAINT "UserScrapLog_detailLogId_fkey";

-- DropForeignKey
ALTER TABLE "UserScrapLog" DROP CONSTRAINT "UserScrapLog_logId_fkey";

-- AddForeignKey
ALTER TABLE "UserScrapLog" ADD CONSTRAINT "UserScrapLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScrapLog" ADD CONSTRAINT "UserScrapLog_detailLogId_fkey" FOREIGN KEY ("detailLogId") REFERENCES "DetailLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoodLog" ADD CONSTRAINT "UserGoodLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoodLog" ADD CONSTRAINT "UserGoodLog_detailLogId_fkey" FOREIGN KEY ("detailLogId") REFERENCES "DetailLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
