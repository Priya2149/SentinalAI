/*
  Warnings:

  - You are about to drop the column `error` on the `ModelCall` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `ModelCall` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `ModelCall` table. All the data in the column will be lost.
  - You are about to drop the column `route` on the `ModelCall` table. All the data in the column will be lost.
  - You are about to drop the column `ts` on the `ModelCall` table. All the data in the column will be lost.
  - You are about to alter the column `costUsd` on the `ModelCall` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `DoublePrecision`.
  - A unique constraint covering the columns `[callId,kind]` on the table `EvalResult` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."ModelCall" DROP COLUMN "error",
DROP COLUMN "ip",
DROP COLUMN "provider",
DROP COLUMN "route",
DROP COLUMN "ts",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "costUsd" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "EvalResult_callId_kind_idx" ON "public"."EvalResult"("callId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "EvalResult_callId_kind_key" ON "public"."EvalResult"("callId", "kind");
