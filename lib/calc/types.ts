export type ExpenseItemInput = {
  name: string;
  monthlyAmountISK: number;
  startsMonth: number;
  endsMonth?: number | null;
  annualIncreasePct: number;
  enabled: boolean;
};

export type IncomeEventInput = {
  name: string;
  month: number;
  amountISK: number;
  recurring: boolean;
  annualIncreasePct: number;
};

export type ScenarioAssumptionsInput = {
  startDate: Date | string;
  durationMonths: number;
  startingSavingsBalanceISK: number;
  monthlySalaryBeforeTaxISK: number;
  annualSalaryIncreasePct: number;
  salaryChangeMonth?: number | null;
  newMonthlySalaryBeforeTaxISK?: number | null;
  currentSavingsAPY: number;
  targetSavingsAPY: number;
  interestTransitionMonths: number;
  currentInflationAnnual: number;
  targetInflationAnnual: number;
  inflationTransitionMonths: number;
  pensionPct: number;
  personalAllowanceMonthlyISK: number;
  bracket1LimitISK: number;
  bracket2LimitISK: number;
  bracket1Rate: number;
  bracket2Rate: number;
  bracket3Rate: number;
  inflationImpactsExpenses: boolean;
};

export type ScenarioInput = {
  id: string;
  name: string;
  assumptions: ScenarioAssumptionsInput;
  expenseItems: ExpenseItemInput[];
  incomeEvents: IncomeEventInput[];
};

export type ProjectionRow = {
  monthIndex: number;
  date: string;
  grossSalaryISK: number;
  pensionISK: number;
  taxISK: number;
  netSalaryISK: number;
  expensesISK: number;
  savingsDepositISK: number;
  interestRateAnnual: number;
  interestRateMonthly: number;
  inflationRateAnnual: number;
  inflationRateMonthly: number;
  savingsBalanceISK: number;
  realSavingsBalanceISK: number;
  realNetSalaryISK: number;
  realExpensesISK: number;
  totalInterestEarnedISK: number;
  cumulativeInflationIndex: number;
};

export type ProjectionResult = {
  scenarioId: string;
  scenarioName: string;
  rows: ProjectionRow[];
};

export type SummaryResult = {
  scenarioId: string;
  scenarioName: string;
  startingSavingsBalanceISK: number;
  totalSavingsDepositsISK: number;
  totalInterestEarnedISK: number;
  finalSavingsBalanceISK: number;
  totalExpensesISK: number;
  averageMonthlySavingsISK: number;
  totalGrossSalaryISK: number;
  totalPensionISK: number;
  totalTaxISK: number;
};
