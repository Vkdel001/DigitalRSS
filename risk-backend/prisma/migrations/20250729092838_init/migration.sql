-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'approver', 'admin');

-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('individual', 'entity');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'approved', 'rejected', 'escalated');

-- CreateEnum
CREATE TYPE "RiskBand" AS ENUM ('Low', 'Medium', 'High', 'AutoHigh', 'NoGo');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "type" "SubmissionType" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "calculatedScore" DOUBLE PRECISION,
    "systemRating" "RiskBand" NOT NULL,
    "finalRating" "RiskBand" NOT NULL,
    "justification" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionDetail" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "SubmissionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskParameter" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "riskLevel" "RiskBand" NOT NULL,
    "scoreValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RiskParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionDetail" ADD CONSTRAINT "SubmissionDetail_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
