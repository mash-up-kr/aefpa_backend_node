-- CreateTable
CREATE TABLE "UserScrapLog" (
    "userId" INTEGER NOT NULL,
    "logId" INTEGER NOT NULL,

    CONSTRAINT "UserScrapLog_pkey" PRIMARY KEY ("userId","logId")
);

-- CreateTable
CREATE TABLE "UserGoodLog" (
    "userId" INTEGER NOT NULL,
    "logId" INTEGER NOT NULL,

    CONSTRAINT "UserGoodLog_pkey" PRIMARY KEY ("userId","logId")
);

-- AddForeignKey
ALTER TABLE "UserScrapLog" ADD CONSTRAINT "UserScrapLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScrapLog" ADD CONSTRAINT "UserScrapLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoodLog" ADD CONSTRAINT "UserGoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoodLog" ADD CONSTRAINT "UserGoodLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
