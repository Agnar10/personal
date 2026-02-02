import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@savings.isk" },
    update: {},
    create: {
      email: "demo@savings.isk",
      name: "Demo User"
    }
  });

  const baseAssumptions = {
    startDate: new Date("2024-01-01"),
    durationMonths: 60,
    startingSavingsBalanceISK: 1500000,
    monthlySalaryBeforeTaxISK: 900000,
    annualSalaryIncreasePct: 0.04,
    salaryChangeMonth: 25,
    newMonthlySalaryBeforeTaxISK: 980000,
    currentSavingsAPY: 0.0675,
    targetSavingsAPY: 0.035,
    interestTransitionMonths: 24,
    currentInflationAnnual: 0.055,
    targetInflationAnnual: 0.028,
    inflationTransitionMonths: 24,
    pensionPct: 0.08,
    personalAllowanceMonthlyISK: 60000,
    bracket1LimitISK: 350000,
    bracket2LimitISK: 900000,
    bracket1Rate: 0.31,
    bracket2Rate: 0.37,
    bracket3Rate: 0.46
  };

  await prisma.scenario.deleteMany({ where: { userId: user.id } });

  await prisma.scenario.create({
    data: {
      name: "Baseline - Inflation does not impact expenses",
      userId: user.id,
      assumptions: {
        create: {
          ...baseAssumptions,
          inflationImpactsExpenses: false
        }
      },
      expenseItems: {
        create: [
          {
            name: "Rent",
            monthlyAmountISK: 280000,
            annualIncreasePct: 0.03,
            enabled: true
          },
          {
            name: "Utilities",
            monthlyAmountISK: 38000,
            annualIncreasePct: 0.02,
            enabled: true
          },
          {
            name: "Groceries",
            monthlyAmountISK: 75000,
            annualIncreasePct: 0.025,
            enabled: true
          },
          {
            name: "Transport",
            monthlyAmountISK: 40000,
            annualIncreasePct: 0.02,
            enabled: true
          }
        ]
      },
      incomeEvents: {
        create: [
          {
            name: "One-time bonus",
            month: 6,
            amountISK: 250000,
            recurring: false
          }
        ]
      }
    }
  });

  await prisma.scenario.create({
    data: {
      name: "Inflation impacts expenses",
      userId: user.id,
      assumptions: {
        create: {
          ...baseAssumptions,
          inflationImpactsExpenses: true
        }
      },
      expenseItems: {
        create: [
          {
            name: "Rent",
            monthlyAmountISK: 280000,
            annualIncreasePct: 0.03,
            enabled: true
          },
          {
            name: "Utilities",
            monthlyAmountISK: 38000,
            annualIncreasePct: 0.02,
            enabled: true
          },
          {
            name: "Groceries",
            monthlyAmountISK: 75000,
            annualIncreasePct: 0.025,
            enabled: true
          },
          {
            name: "Transport",
            monthlyAmountISK: 40000,
            annualIncreasePct: 0.02,
            enabled: true
          }
        ]
      },
      incomeEvents: {
        create: [
          {
            name: "One-time bonus",
            month: 6,
            amountISK: 250000,
            recurring: false
          }
        ]
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
