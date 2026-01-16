/*
  Warnings:

  - Added the required column `title` to the `Journal` table without a default value.
*/

-- DropIndex
DROP INDEX "Journal_userId_date_key";

-- 1️⃣ Add title safely
ALTER TABLE "Journal"
ADD COLUMN "title" TEXT;

-- 2️⃣ Backfill existing journals
UPDATE "Journal"
SET "title" = 'Journal Entry'
WHERE "title" IS NULL;

-- 3️⃣ Enforce NOT NULL
ALTER TABLE "Journal"
ALTER COLUMN "title" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Journal_userId_idx" ON "Journal"("userId");

-- CreateIndex
CREATE INDEX "Journal_userId_createdAt_idx"
ON "Journal"("userId", "createdAt");
