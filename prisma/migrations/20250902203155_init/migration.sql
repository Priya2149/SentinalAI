-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('SUCCESS', 'FAIL', 'FLAGGED');

-- CreateEnum
CREATE TYPE "public"."EvalKind" AS ENUM ('HALLUCINATION', 'TOXICITY');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModelCall" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "respTokens" INTEGER NOT NULL,
    "status" "public"."CallStatus" NOT NULL DEFAULT 'SUCCESS',
    "costUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "hallucinated" BOOLEAN NOT NULL DEFAULT false,
    "toxic" BOOLEAN NOT NULL DEFAULT false,
    "route" TEXT,
    "ip" TEXT,
    "error" TEXT,

    CONSTRAINT "ModelCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EvalResult" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "kind" "public"."EvalKind" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."ModelCall" ADD CONSTRAINT "ModelCall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EvalResult" ADD CONSTRAINT "EvalResult_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."ModelCall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
