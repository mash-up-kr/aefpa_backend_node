/*
  Warnings:

  - You are about to drop the column `ingredient` on the `DetailLog` table. All the data in the column will be lost.
  - Added the required column `ingredients` to the `DetailLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetailLog" DROP COLUMN "ingredient",
ADD COLUMN     "ingredients" VARCHAR(3000) NOT NULL;
