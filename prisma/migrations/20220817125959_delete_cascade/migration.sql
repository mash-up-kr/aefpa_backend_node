-- DropForeignKey
ALTER TABLE "DetailLog" DROP CONSTRAINT "DetailLog_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_detailLogId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_imageId_fkey";

-- AddForeignKey
ALTER TABLE "DetailLog" ADD CONSTRAINT "DetailLog_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_detailLogId_fkey" FOREIGN KEY ("detailLogId") REFERENCES "DetailLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
