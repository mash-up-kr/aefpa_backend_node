-- CreateEnum
CREATE TYPE "CharacterType" AS ENUM ('BROCCOLI', 'CARROT', 'GREEN_ONION');

-- CreateTable
CREATE TABLE "UserCharacter" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "characterType" "CharacterType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCharacter_userId_key" ON "UserCharacter"("userId");

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
