/*
  Warnings:

  - You are about to drop the column `usedAt` on the `EmailOTP` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HabitType" AS ENUM ('CHECK', 'PROGRESS', 'TIMER', 'RATING', 'TEXT', 'MEASUREMENT');

-- AlterTable
ALTER TABLE "EmailOTP" DROP COLUMN "usedAt";

-- CreateTable
CREATE TABLE "HabitSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "habitSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HabitType" NOT NULL DEFAULT 'CHECK',
    "unit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetInt" INTEGER,
    "targetSec" INTEGER,
    "ratingMax" INTEGER,
    "precision" INTEGER,
    "minFloat" DOUBLE PRECISION,
    "maxFloat" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "valueInt" INTEGER,
    "durationSec" INTEGER,
    "rating" INTEGER,
    "textValue" TEXT,
    "valueFloat" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HabitSet_userId_idx" ON "HabitSet"("userId");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");

-- CreateIndex
CREATE INDEX "Habit_habitSetId_idx" ON "Habit"("habitSetId");

-- CreateIndex
CREATE INDEX "HabitEntry_userId_idx" ON "HabitEntry"("userId");

-- CreateIndex
CREATE INDEX "HabitEntry_habitId_idx" ON "HabitEntry"("habitId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitEntry_habitId_date_key" ON "HabitEntry"("habitId", "date");

-- AddForeignKey
ALTER TABLE "HabitSet" ADD CONSTRAINT "HabitSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_habitSetId_fkey" FOREIGN KEY ("habitSetId") REFERENCES "HabitSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitEntry" ADD CONSTRAINT "HabitEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitEntry" ADD CONSTRAINT "HabitEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
