-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('quantity_below', 'any_broken');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('restock', 'notify', 'mark_unavailable', 'add_label');

-- CreateTable
CREATE TABLE "Workflow" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "threshold" INTEGER,
    "actionType" "ActionType" NOT NULL,
    "restockQuantity" INTEGER,
    "serialPattern" TEXT,
    "labelId" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;
