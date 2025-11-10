-- CreateTable
CREATE TABLE "invite_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "accessRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedByUserId" TEXT,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_accessRequestId_key" ON "invite_codes"("accessRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_usedByUserId_key" ON "invite_codes"("usedByUserId");

-- AddForeignKey
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_accessRequestId_fkey" FOREIGN KEY ("accessRequestId") REFERENCES "access_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

