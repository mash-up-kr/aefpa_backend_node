/*
  Warnings:

  - You are about to drop the column `url` on the `Image` table. All the data in the column will be lost.
  - Added the required column `original` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `w_1024` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `w_256` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "url",
ADD COLUMN     "original" VARCHAR(1024) NOT NULL,
ADD COLUMN     "w_1024" VARCHAR(1024) NOT NULL,
ADD COLUMN     "w_256" VARCHAR(1024) NOT NULL;
