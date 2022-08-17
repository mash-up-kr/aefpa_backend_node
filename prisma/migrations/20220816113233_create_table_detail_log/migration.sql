-- CreateTable
CREATE TABLE "DetailLog" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(15) NOT NULL,
    "description" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" INTEGER NOT NULL,
    "ingredient" VARCHAR(3000) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "DetailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "step" SMALLINT NOT NULL,
    "imageId" INTEGER NOT NULL,
    "detailLogId" INTEGER,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetailLog" ADD CONSTRAINT "DetailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailLog" ADD CONSTRAINT "DetailLog_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_detailLogId_fkey" FOREIGN KEY ("detailLogId") REFERENCES "DetailLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
