import { prisma } from "@/lib/db";
import { computeMonthlyProjection, computeSummary, mapScenarioInput } from "@/lib/calc";
import ScenarioWorkspace from "@/components/ScenarioWorkspace";

const Page = async () => {
  const scenarios = await prisma.scenario.findMany({
    include: {
      assumptions: true,
      expenseItems: true,
      incomeEvents: true
    },
    orderBy: { createdAt: "asc" }
  });

  const mappedScenarios = scenarios
    .filter((scenario) => scenario.assumptions)
    .map((scenario) => {
      const assumptions = scenario.assumptions!;
      return mapScenarioInput({
        id: scenario.id,
        name: scenario.name,
        assumptions: {
          startDate: assumptions.startDate,
          durationMonths: assumptions.durationMonths,
          startingSavingsBalanceISK: assumptions.startingSavingsBalanceISK,
          monthlySalaryBeforeTaxISK: assumptions.monthlySalaryBeforeTaxISK,
          annualSalaryIncreasePct: assumptions.annualSalaryIncreasePct,
          salaryChangeMonth: assumptions.salaryChangeMonth,
          newMonthlySalaryBeforeTaxISK: assumptions.newMonthlySalaryBeforeTaxISK,
          currentSavingsAPY: assumptions.currentSavingsAPY,
          targetSavingsAPY: assumptions.targetSavingsAPY,
          interestTransitionMonths: assumptions.interestTransitionMonths,
          currentInflationAnnual: assumptions.currentInflationAnnual,
          targetInflationAnnual: assumptions.targetInflationAnnual,
          inflationTransitionMonths: assumptions.inflationTransitionMonths,
          pensionPct: assumptions.pensionPct,
          personalAllowanceMonthlyISK: assumptions.personalAllowanceMonthlyISK,
          bracket1LimitISK: assumptions.bracket1LimitISK,
          bracket2LimitISK: assumptions.bracket2LimitISK,
          bracket1Rate: assumptions.bracket1Rate,
          bracket2Rate: assumptions.bracket2Rate,
          bracket3Rate: assumptions.bracket3Rate,
          inflationImpactsExpenses: assumptions.inflationImpactsExpenses
        },
        expenseItems: scenario.expenseItems.map((item) => ({
          name: item.name,
          monthlyAmountISK: item.monthlyAmountISK,
          startsMonth: item.startsMonth,
          endsMonth: item.endsMonth,
          annualIncreasePct: item.annualIncreasePct,
          enabled: item.enabled
        })),
        incomeEvents: scenario.incomeEvents.map((event) => ({
          name: event.name,
          month: event.month,
          amountISK: event.amountISK,
          recurring: event.recurring,
          annualIncreasePct: event.annualIncreasePct
        }))
      });
    });

  const projections = mappedScenarios.map((scenario) => computeMonthlyProjection(scenario));
  const summaries = projections.map((projection) => computeSummary(projection));

  return (
    <main className="min-h-screen bg-panel-2">
      <ScenarioWorkspace scenarios={mappedScenarios} projections={projections} summaries={summaries} />
    </main>
  );
};

export default Page;
