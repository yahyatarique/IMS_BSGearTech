-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SuperAdmin', 'Admin');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Draft', 'Accepted', 'RawMaterialFinalized', 'InProcess', 'PendingFulfillment', 'PendingPayment', 'Dispatched');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('Pinion', 'Gear');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('CR_5', 'EN_9');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "tinNumber" TEXT,
    "orgName" TEXT NOT NULL,
    "orgAddress" TEXT NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProfileType" NOT NULL,
    "material" "MaterialType" NOT NULL,
    "materialRate" DOUBLE PRECISION NOT NULL,
    "cutSizeWidth" INTEGER NOT NULL,
    "cutSizeHeight" INTEGER NOT NULL,
    "burningWastage" DOUBLE PRECISION NOT NULL,
    "heatTreatmentRate" DOUBLE PRECISION NOT NULL,
    "heatTreatmentInefficacy" DOUBLE PRECISION NOT NULL,
    "availableInventory" INTEGER NOT NULL,

    CONSTRAINT "OrderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "materialCost" DOUBLE PRECISION NOT NULL,
    "processCosts" DOUBLE PRECISION NOT NULL,
    "turningRate" DOUBLE PRECISION NOT NULL,
    "teethCount" INTEGER NOT NULL,
    "module" INTEGER NOT NULL,
    "face" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "htCost" DOUBLE PRECISION NOT NULL,
    "totalOrderValue" DOUBLE PRECISION NOT NULL,
    "profitMargin" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "materialType" "MaterialType" NOT NULL,
    "materialWeight" DOUBLE PRECISION NOT NULL,
    "cutSizeWidth" INTEGER NOT NULL,
    "cutSizeHeight" INTEGER NOT NULL,
    "relatedPOs" TEXT[],

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "purchaserId" INTEGER NOT NULL,
    "poNumber" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" INTEGER NOT NULL,
    "finishSizeWidth" INTEGER NOT NULL,
    "finishSizeHeight" INTEGER NOT NULL,
    "turningRate" DOUBLE PRECISION NOT NULL,
    "teethCount" INTEGER NOT NULL,
    "module" INTEGER NOT NULL,
    "face" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "materialCost" DOUBLE PRECISION NOT NULL,
    "tcTgPrice" DOUBLE PRECISION NOT NULL,
    "htCost" DOUBLE PRECISION NOT NULL,
    "processCosts" JSONB NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "profitMargin" DOUBLE PRECISION NOT NULL,
    "totalOrderValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "OrderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
