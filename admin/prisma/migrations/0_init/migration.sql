-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "UserStatus" AS ENUM ('APPROVED', 'BANNED');
CREATE TYPE "ItemCategory" AS ENUM ('MOVIE', 'TV_SERIES', 'ANIME', 'CARTOON', 'LIVE_TV', 'STREAMING');
CREATE TYPE "ItemStatus" AS ENUM ('VISIBLE', 'HIDDEN');
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');
CREATE TYPE "Quality" AS ENUM ('SD', 'HD', 'FullHD', 'K4');
CREATE TYPE "Auth" AS ENUM ('CONNECTED', 'DISCONNECTED');
CREATE TYPE "DurationPlan" AS ENUM ('ONE_MONTH', 'SIX_MONTHS', 'ONE_YEAR');
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SOLD_OUT');
CREATE TYPE "Category" AS ENUM ('IPTV', 'STREAMING');

-- CreateTable User
CREATE TABLE "User" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "authLastAt" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'APPROVED',
    "auth" "Auth" NOT NULL DEFAULT 'DISCONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateTable Video
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "videoUrl" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable CatalogApp
CREATE TABLE "CatalogApp" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "downloadLink" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable UserCatalogApp
CREATE TABLE "UserCatalogApp" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "appId" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex for UserCatalogApp
CREATE UNIQUE INDEX "UserCatalogApp_userId_appId_key" ON "UserCatalogApp"("userId", "appId");
CREATE INDEX "UserCatalogApp_userId_idx" ON "UserCatalogApp"("userId");
CREATE INDEX "UserCatalogApp_appId_idx" ON "UserCatalogApp"("appId");

-- CreateTable Settings
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1 PRIMARY KEY,
    "brandName" TEXT NOT NULL DEFAULT 'HOTFLIX',
    "accentColor" TEXT NOT NULL DEFAULT '#f97316',
    "allowRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable BeInSportActivation
CREATE TABLE "BeInSportActivation" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BeInSportActivation_code_key" ON "BeInSportActivation"("code");

-- CreateTable IPTVChannel
CREATE TABLE "IPTVChannel" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "category" "Category" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable Subscription
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "code" TEXT UNIQUE,
    "channelId" INTEGER NOT NULL,
    "duration" "DurationPlan" NOT NULL DEFAULT 'ONE_MONTH',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "Subscription_channelId_status_idx" ON "Subscription"("channelId", "status");
CREATE UNIQUE INDEX "Subscription_code_key" ON "Subscription"("code");

-- CreateTable UserSubscription
CREATE TABLE "UserSubscription" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_subscriptionId_key" ON "UserSubscription"("userId", "subscriptionId");
CREATE INDEX "UserSubscription_userId_status_idx" ON "UserSubscription"("userId", "status");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCatalogApp" ADD CONSTRAINT "UserCatalogApp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCatalogApp" ADD CONSTRAINT "UserCatalogApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "CatalogApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeInSportActivation" ADD CONSTRAINT "BeInSportActivation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "IPTVChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
