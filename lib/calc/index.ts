import { addMonths, format } from "date-fns";
import type {
  ExpenseItemInput,
  IncomeEventInput,
  ProjectionResult,
  ProjectionRow,
  ScenarioAssumptionsInput,
  ScenarioInput,
  SummaryResult
} from "./types";

export const formatDate = (date: Date): string => format(date, "dd.MM.yyyy");

export const interpolateLinear = (
  start: number,
  end: number,
  stepIndex: number,
  totalSteps: number
): number => {
  if (totalSteps <= 1) {
    return end;
  }
  const clampedStep = Math.max(0, Math.min(stepIndex, totalSteps - 1));
  const fraction = clampedStep / (totalSteps - 1);
  return start + (end - start) * fraction;
};

export const apyToMonthlyRate = (apy: number): number => Math.pow(1 + apy, 1 / 12) - 1;

export const annualToMonthlyInflation = (annual: number): number =>
  Math.pow(1 + annual, 1 / 12) - 1;

const roundISK = (value: number): number => Math.round(value);

const computeTaxISK = (taxableISK: number, assumptions: ScenarioAssumptionsInput): number => {
  const { bracket1LimitISK, bracket2LimitISK, bracket1Rate, bracket2Rate, bracket3Rate } = assumptions;
  if (taxableISK <= 0) return 0;

  const tier1 = Math.min(taxableISK, bracket1LimitISK);
  const tier2 = Math.min(Math.max(taxableISK - bracket1LimitISK, 0), bracket2LimitISK - bracket1LimitISK);
  const tier3 = Math.max(taxableISK - bracket2LimitISK, 0);

  const tax = tier1 * bracket1Rate + tier2 * bracket2Rate + tier3 * bracket3Rate;
  return roundISK(tax);
};

const shouldApplyAnnualIncrease = (monthIndex: number): boolean =>
  monthIndex > 1 && (monthIndex - 1) % 12 === 0;

const resolveSalaryForMonth = (
  monthIndex: number,
  currentSalaryISK: number,
  assumptions: ScenarioAssumptionsInput
): number => {
  let salary = currentSalaryISK;
  if (
    assumptions.salaryChangeMonth &&
    assumptions.newMonthlySalaryBeforeTaxISK &&
    monthIndex === assumptions.salaryChangeMonth
  ) {
    salary = assumptions.newMonthlySalaryBeforeTaxISK;
  }
  if (shouldApplyAnnualIncrease(monthIndex)) {
    salary = roundISK(salary * (1 + assumptions.annualSalaryIncreasePct));
  }
  return salary;
};

const resolveIncomeEventsForMonth = (
  monthIndex: number,
  events: IncomeEventInput[],
  eventState: Record<string, number>
): number => {
  let total = 0;
  for (const event of events) {
    if (event.recurring) {
      if (monthIndex < event.month) continue;
      let amount = eventState[event.name] ?? event.amountISK;
      if (shouldApplyAnnualIncrease(monthIndex)) {
        amount = roundISK(amount * (1 + event.annualIncreasePct));
      }
      eventState[event.name] = amount;
      total += amount;
    } else if (event.month === monthIndex) {
      total += event.amountISK;
    }
  }
  return total;
};

const resolveExpensesForMonth = (
  monthIndex: number,
  expenseItems: ExpenseItemInput[],
  assumptions: ScenarioAssumptionsInput,
  inflationAnnual: number,
  expenseState: Record<string, number>
): number => {
  let total = 0;
  for (const item of expenseItems) {
    if (!item.enabled) continue;
    if (monthIndex < item.startsMonth) continue;
    if (item.endsMonth && monthIndex > item.endsMonth) continue;

    let amount = expenseState[item.name] ?? item.monthlyAmountISK;
    if (shouldApplyAnnualIncrease(monthIndex)) {
      const baseAnnual = item.annualIncreasePct;
      const effectiveAnnual = assumptions.inflationImpactsExpenses ? baseAnnual + inflationAnnual : baseAnnual;
      amount = roundISK(amount * (1 + effectiveAnnual));
    }
    expenseState[item.name] = amount;
    total += amount;
  }
  return total;
};

export const computeMonthlyProjection = (scenario: ScenarioInput): ProjectionResult => {
  const { assumptions, expenseItems, incomeEvents } = scenario;
  const startDate = new Date(assumptions.startDate);

  const rows: ProjectionRow[] = [];
  let savingsBalanceISK = assumptions.startingSavingsBalanceISK;
  let currentSalaryISK = assumptions.monthlySalaryBeforeTaxISK;
  const expenseState: Record<string, number> = {};
  const eventState: Record<string, number> = {};
  let cumulativeInflationIndex = 1;
  let totalInterestEarnedISK = 0;

  for (let monthIndex = 1; monthIndex <= assumptions.durationMonths; monthIndex += 1) {
    const date = addMonths(startDate, monthIndex - 1);

    const inflationAnnual = interpolateLinear(
      assumptions.currentInflationAnnual,
      assumptions.targetInflationAnnual,
      monthIndex - 1,
      assumptions.inflationTransitionMonths
    );
    const interestAnnual = interpolateLinear(
      assumptions.currentSavingsAPY,
      assumptions.targetSavingsAPY,
      monthIndex - 1,
      assumptions.interestTransitionMonths
    );

    const inflationMonthly = annualToMonthlyInflation(inflationAnnual);
    const interestMonthly = apyToMonthlyRate(interestAnnual);

    currentSalaryISK = resolveSalaryForMonth(monthIndex, currentSalaryISK, assumptions);
    const incomeEventsISK = resolveIncomeEventsForMonth(monthIndex, incomeEvents, eventState);
    const grossSalaryISK = currentSalaryISK + incomeEventsISK;
    const pensionISK = roundISK(grossSalaryISK * assumptions.pensionPct);
    const taxableISK = Math.max(0, grossSalaryISK - pensionISK - assumptions.personalAllowanceMonthlyISK);
    const taxISK = computeTaxISK(taxableISK, assumptions);
    const netSalaryISK = grossSalaryISK - pensionISK - taxISK;

    const expensesISK = resolveExpensesForMonth(
      monthIndex,
      expenseItems,
      assumptions,
      inflationAnnual,
      expenseState
    );
    const savingsDepositISK = netSalaryISK - expensesISK;

    const preInterestBalance = savingsBalanceISK + savingsDepositISK;
    const interestEarnedISK = roundISK(preInterestBalance * interestMonthly);
    totalInterestEarnedISK += interestEarnedISK;
    savingsBalanceISK = preInterestBalance + interestEarnedISK;

    cumulativeInflationIndex *= 1 + inflationMonthly;

    rows.push({
      monthIndex,
      date: formatDate(date),
      grossSalaryISK,
      pensionISK,
      taxISK,
      netSalaryISK,
      expensesISK,
      savingsDepositISK,
      interestRateAnnual: interestAnnual,
      interestRateMonthly: interestMonthly,
      inflationRateAnnual: inflationAnnual,
      inflationRateMonthly: inflationMonthly,
      savingsBalanceISK,
      realSavingsBalanceISK: roundISK(savingsBalanceISK / cumulativeInflationIndex),
      realNetSalaryISK: roundISK(netSalaryISK / cumulativeInflationIndex),
      realExpensesISK: roundISK(expensesISK / cumulativeInflationIndex),
      totalInterestEarnedISK,
      cumulativeInflationIndex
    });
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    rows
  };
};

export const computeSummary = (projection: ProjectionResult): SummaryResult => {
  const { rows } = projection;
  const startingSavingsBalanceISK = rows.length > 0 ? rows[0].savingsBalanceISK - rows[0].savingsDepositISK : 0;
  const totalSavingsDepositsISK = rows.reduce((sum, row) => sum + row.savingsDepositISK, 0);
  const totalInterestEarnedISK = rows.length > 0 ? rows[rows.length - 1].totalInterestEarnedISK : 0;
  const finalSavingsBalanceISK = rows.length > 0 ? rows[rows.length - 1].savingsBalanceISK : 0;
  const totalExpensesISK = rows.reduce((sum, row) => sum + row.expensesISK, 0);
  const averageMonthlySavingsISK = rows.length > 0 ? Math.round(totalSavingsDepositsISK / rows.length) : 0;
  const totalGrossSalaryISK = rows.reduce((sum, row) => sum + row.grossSalaryISK, 0);
  const totalPensionISK = rows.reduce((sum, row) => sum + row.pensionISK, 0);
  const totalTaxISK = rows.reduce((sum, row) => sum + row.taxISK, 0);

  return {
    scenarioId: projection.scenarioId,
    scenarioName: projection.scenarioName,
    startingSavingsBalanceISK,
    totalSavingsDepositsISK,
    totalInterestEarnedISK,
    finalSavingsBalanceISK,
    totalExpensesISK,
    averageMonthlySavingsISK,
    totalGrossSalaryISK,
    totalPensionISK,
    totalTaxISK
  };
};

export const mapScenarioInput = (scenario: {
  id: string;
  name: string;
  assumptions: ScenarioAssumptionsInput;
  expenseItems: ExpenseItemInput[];
  incomeEvents: IncomeEventInput[];
}): ScenarioInput => scenario;
