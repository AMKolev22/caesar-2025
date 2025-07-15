-- CreateTable
CREATE TABLE "Label" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "organisationId" INTEGER NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLabel" (
    "productId" INTEGER NOT NULL,
    "labelId" INTEGER NOT NULL,

    CONSTRAINT "ProductLabel_pkey" PRIMARY KEY ("productId","labelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_organisationId_key" ON "Label"("name", "organisationId");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLabel" ADD CONSTRAINT "ProductLabel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLabel" ADD CONSTRAINT "ProductLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
