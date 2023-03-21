/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `FieldVisibility` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FieldVisibility_userId_key" ON "FieldVisibility"("userId");
