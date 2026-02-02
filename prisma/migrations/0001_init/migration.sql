-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioAssumptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "startingSavingsBalanceISK" INTEGER NOT NULL,
    "monthlySalaryBeforeTaxISK" INTEGER NOT NULL,
    "annualSalaryIncreasePct" REAL NOT NULL,
    "salaryChangeMonth" INTEGER,
    "newMonthlySalaryBeforeTaxISK" INTEGER,
    "currentSavingsAPY" REAL NOT NULL,
    "targetSavingsAPY" REAL NOT NULL,
    "interestTransitionMonths" INTEGER NOT NULL,
    "currentInflationAnnual" REAL NOT NULL,
    "targetInflationAnnual" REAL NOT NULL,
    "inflationTransitionMonths" INTEGER NOT NULL,
    "pensionPct" REAL NOT NULL,
    "personalAllowanceMonthlyISK" INTEGER NOT NULL,
    "bracket1LimitISK" INTEGER NOT NULL,
    "bracket2LimitISK" INTEGER NOT NULL,
    "bracket1Rate" REAL NOT NULL,
    "bracket2Rate" REAL NOT NULL,
    "bracket3Rate" REAL NOT NULL,
    "inflationImpactsExpenses" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ScenarioAssumptions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyAmountISK" INTEGER NOT NULL,
    "startsMonth" INTEGER NOT NULL DEFAULT 1,
    "endsMonth" INTEGER,
    "annualIncreasePct" REAL NOT NULL DEFAULT 0.02,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ExpenseItem_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncomeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amountISK" INTEGER NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "annualIncreasePct" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "IncomeEvent_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioAssumptions_scenarioId_key" ON "ScenarioAssumptions"("scenarioId");
