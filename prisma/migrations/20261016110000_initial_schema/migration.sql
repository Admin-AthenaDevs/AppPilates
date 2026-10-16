-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StudioRole" AS ENUM ('OWNER', 'INSTRUCTOR', 'FRONT_DESK', 'CLIENT');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('MAT', 'REFORMER', 'PRIVATE', 'MIXED');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('MAT', 'REFORMER', 'SEMI_PRIVATE', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('BOOKED', 'WAITLISTED', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'CLASS_PACK', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('MEMBERSHIP', 'CLASS_PACK', 'PRIVATE_SESSION', 'VIDEO_ACCESS');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VideoLevel" AS ENUM ('BEGINNER', 'ALL_LEVELS', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Studio" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "brandPrimary" TEXT NOT NULL DEFAULT '#176b5b',
    "brandAccent" TEXT NOT NULL DEFAULT '#e89a78',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "countryCode" VARCHAR(2) NOT NULL DEFAULT 'ES',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "cancellationNoticeHours" INTEGER NOT NULL DEFAULT 8,
    "stripeAccountId" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioMember" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "StudioRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "emergencyContact" TEXT,
    "medicalNotesEncrypted" TEXT,
    "goals" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorProfile" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstructorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTemplate" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClassType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 50,
    "defaultCapacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClassTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "classCredits" INTEGER,
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentMembership" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "remainingCredits" INTEGER,
    "stripeSubscriptionId" TEXT,
    "currentPeriodEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'BOOKED',
    "waitlistOrder" INTEGER,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "VideoLevel" NOT NULL DEFAULT 'ALL_LEVELS',
    "durationSeconds" INTEGER,
    "muxAssetId" TEXT,
    "muxPlaybackId" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoPlanAccess" (
    "studioId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoPlanAccess_pkey" PRIMARY KEY ("studioId","videoId","planId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "clientId" TEXT,
    "kind" "PaymentKind" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "recipient" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "providerId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_stripeAccountId_key" ON "Studio"("stripeAccountId");

-- CreateIndex
CREATE INDEX "Studio_name_idx" ON "Studio"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "StudioMember_userId_role_idx" ON "StudioMember"("userId", "role");

-- CreateIndex
CREATE INDEX "StudioMember_studioId_role_isActive_idx" ON "StudioMember"("studioId", "role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StudioMember_studioId_userId_key" ON "StudioMember"("studioId", "userId");

-- CreateIndex
CREATE INDEX "ClientProfile_studioId_createdAt_idx" ON "ClientProfile"("studioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_studioId_userId_key" ON "ClientProfile"("studioId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_id_studioId_key" ON "ClientProfile"("id", "studioId");

-- CreateIndex
CREATE INDEX "InstructorProfile_studioId_isActive_idx" ON "InstructorProfile"("studioId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_id_studioId_key" ON "InstructorProfile"("id", "studioId");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_studioId_userId_key" ON "InstructorProfile"("studioId", "userId");

-- CreateIndex
CREATE INDEX "Room_studioId_type_isActive_idx" ON "Room"("studioId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Room_studioId_name_key" ON "Room"("studioId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Room_id_studioId_key" ON "Room"("id", "studioId");

-- CreateIndex
CREATE INDEX "ClassTemplate_studioId_isActive_type_idx" ON "ClassTemplate"("studioId", "isActive", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTemplate_id_studioId_key" ON "ClassTemplate"("id", "studioId");

-- CreateIndex
CREATE INDEX "ClassSession_studioId_startsAt_isCancelled_idx" ON "ClassSession"("studioId", "startsAt", "isCancelled");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_id_studioId_key" ON "ClassSession"("id", "studioId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_studioId_roomId_startsAt_key" ON "ClassSession"("studioId", "roomId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_studioId_instructorId_startsAt_key" ON "ClassSession"("studioId", "instructorId", "startsAt");

-- CreateIndex
CREATE INDEX "MembershipPlan_studioId_isActive_idx" ON "MembershipPlan"("studioId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_id_studioId_key" ON "MembershipPlan"("id", "studioId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_studioId_name_key" ON "MembershipPlan"("studioId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StudentMembership_stripeSubscriptionId_key" ON "StudentMembership"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "StudentMembership_studioId_clientId_status_idx" ON "StudentMembership"("studioId", "clientId", "status");

-- CreateIndex
CREATE INDEX "StudentMembership_studioId_currentPeriodEndsAt_idx" ON "StudentMembership"("studioId", "currentPeriodEndsAt");

-- CreateIndex
CREATE INDEX "Reservation_studioId_classSessionId_status_waitlistOrder_idx" ON "Reservation"("studioId", "classSessionId", "status", "waitlistOrder");

-- CreateIndex
CREATE INDEX "Reservation_studioId_clientId_bookedAt_idx" ON "Reservation"("studioId", "clientId", "bookedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_studioId_classSessionId_clientId_key" ON "Reservation"("studioId", "classSessionId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_muxAssetId_key" ON "Video"("muxAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_muxPlaybackId_key" ON "Video"("muxPlaybackId");

-- CreateIndex
CREATE INDEX "Video_studioId_status_publishedAt_idx" ON "Video"("studioId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Video_studioId_instructorId_createdAt_idx" ON "Video"("studioId", "instructorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Video_id_studioId_key" ON "Video"("id", "studioId");

-- CreateIndex
CREATE INDEX "VideoPlanAccess_studioId_planId_idx" ON "VideoPlanAccess"("studioId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_studioId_status_createdAt_idx" ON "Payment"("studioId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_studioId_clientId_createdAt_idx" ON "Payment"("studioId", "clientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_idempotencyKey_key" ON "NotificationLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "NotificationLog_studioId_status_scheduledAt_idx" ON "NotificationLog"("studioId", "status", "scheduledAt");

-- AddForeignKey
ALTER TABLE "StudioMember" ADD CONSTRAINT "StudioMember_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioMember" ADD CONSTRAINT "StudioMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorProfile" ADD CONSTRAINT "InstructorProfile_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorProfile" ADD CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplate" ADD CONSTRAINT "ClassTemplate_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_templateId_studioId_fkey" FOREIGN KEY ("templateId", "studioId") REFERENCES "ClassTemplate"("id", "studioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_instructorId_studioId_fkey" FOREIGN KEY ("instructorId", "studioId") REFERENCES "InstructorProfile"("id", "studioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_roomId_studioId_fkey" FOREIGN KEY ("roomId", "studioId") REFERENCES "Room"("id", "studioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipPlan" ADD CONSTRAINT "MembershipPlan_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMembership" ADD CONSTRAINT "StudentMembership_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMembership" ADD CONSTRAINT "StudentMembership_clientId_studioId_fkey" FOREIGN KEY ("clientId", "studioId") REFERENCES "ClientProfile"("id", "studioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentMembership" ADD CONSTRAINT "StudentMembership_planId_studioId_fkey" FOREIGN KEY ("planId", "studioId") REFERENCES "MembershipPlan"("id", "studioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_classSessionId_studioId_fkey" FOREIGN KEY ("classSessionId", "studioId") REFERENCES "ClassSession"("id", "studioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_clientId_studioId_fkey" FOREIGN KEY ("clientId", "studioId") REFERENCES "ClientProfile"("id", "studioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_instructorId_studioId_fkey" FOREIGN KEY ("instructorId", "studioId") REFERENCES "InstructorProfile"("id", "studioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPlanAccess" ADD CONSTRAINT "VideoPlanAccess_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPlanAccess" ADD CONSTRAINT "VideoPlanAccess_videoId_studioId_fkey" FOREIGN KEY ("videoId", "studioId") REFERENCES "Video"("id", "studioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPlanAccess" ADD CONSTRAINT "VideoPlanAccess_planId_studioId_fkey" FOREIGN KEY ("planId", "studioId") REFERENCES "MembershipPlan"("id", "studioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_studioId_fkey" FOREIGN KEY ("clientId", "studioId") REFERENCES "ClientProfile"("id", "studioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma connects through the trusted server-side PostgreSQL credentials. Keep
-- browser-facing Supabase Data API roles denied until tenant-aware policies exist.
ALTER TABLE "Studio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudioMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstructorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MembershipPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoPlanAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationLog" ENABLE ROW LEVEL SECURITY;
