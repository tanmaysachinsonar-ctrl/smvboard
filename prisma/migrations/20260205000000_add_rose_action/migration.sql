-- CreateEnum
CREATE TYPE "RoseCampaignStatus" AS ENUM ('PLANNED', 'OPEN', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoseOrder" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "senderSchoolId" TEXT NOT NULL,
    "recipientSchoolId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientClass" TEXT,
    "roseCount" INTEGER NOT NULL DEFAULT 1,
    "senderNote" TEXT,
    "createdById" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoseCampaign" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerRose" DOUBLE PRECISION NOT NULL DEFAULT 1.50,
    "status" "RoseCampaignStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoseCampaign_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "schoolId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "School_accessCode_key" ON "School"("accessCode");

-- CreateIndex
CREATE INDEX "School_orgId_idx" ON "School"("orgId");

-- CreateIndex
CREATE INDEX "RoseOrder_recipientSchoolId_recipientName_idx" ON "RoseOrder"("recipientSchoolId", "recipientName");

-- CreateIndex
CREATE INDEX "RoseOrder_orgId_idx" ON "RoseOrder"("orgId");

-- CreateIndex
CREATE INDEX "RoseOrder_campaignId_idx" ON "RoseOrder"("campaignId");

-- CreateIndex
CREATE INDEX "RoseOrder_createdById_idx" ON "RoseOrder"("createdById");

-- CreateIndex
CREATE INDEX "RoseCampaign_orgId_idx" ON "RoseCampaign"("orgId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoseOrder" ADD CONSTRAINT "RoseOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoseOrder" ADD CONSTRAINT "RoseOrder_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "RoseCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoseOrder" ADD CONSTRAINT "RoseOrder_senderSchoolId_fkey" FOREIGN KEY ("senderSchoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoseOrder" ADD CONSTRAINT "RoseOrder_recipientSchoolId_fkey" FOREIGN KEY ("recipientSchoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoseOrder" ADD CONSTRAINT "RoseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoseCampaign" ADD CONSTRAINT "RoseCampaign_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
