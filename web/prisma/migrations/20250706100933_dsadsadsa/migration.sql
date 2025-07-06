-- CreateTable
CREATE TABLE "TwoFA" (
    "userEmail" TEXT NOT NULL,
    "code" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFA_code_key" ON "TwoFA"("code");
