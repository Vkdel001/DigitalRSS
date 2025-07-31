-- CreateTable
CREATE TABLE "country_risks" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "riskLevel" "RiskBand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_risks" (
    "id" SERIAL NOT NULL,
    "occupation" TEXT NOT NULL,
    "riskLevel" "RiskBand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_risks" (
    "id" SERIAL NOT NULL,
    "product" TEXT NOT NULL,
    "riskLevel" "RiskBand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_nature_risks" (
    "id" SERIAL NOT NULL,
    "business" TEXT NOT NULL,
    "riskLevel" "RiskBand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_nature_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction_lists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "listType" TEXT NOT NULL,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanction_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_risks_country_key" ON "country_risks"("country");

-- CreateIndex
CREATE UNIQUE INDEX "employment_risks_occupation_key" ON "employment_risks"("occupation");

-- CreateIndex
CREATE UNIQUE INDEX "product_risks_product_key" ON "product_risks"("product");

-- CreateIndex
CREATE UNIQUE INDEX "business_nature_risks_business_key" ON "business_nature_risks"("business");
