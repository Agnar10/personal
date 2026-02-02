import { describe, expect, it } from "vitest";
import {
  annualToMonthlyInflation,
  apyToMonthlyRate,
  computeMonthlyProjection,
  formatDate,
  interpolateLinear
} from "../index";
import type { ScenarioInput } from "../types";

const baseScenario = (overrides?: Partial<ScenarioInput>): ScenarioInput => ({
  id: "scenario-1",
  name: "Test",
  assumptions: {
    startDate: new Date("2024-01-01"),
    durationMonths: 2,
    startingSavingsBalanceISK: 0,
    monthlySalaryBeforeTaxISK: 500000,
    annualSalaryIncreasePct: 0.03,
    salaryChangeMonth: null,
    newMonthlySalaryBeforeTaxISK: null,
    currentSavingsAPY: 0.06,
    targetSavingsAPY: 0.06,
    interestTransitionMonths: 1,
    currentInflationAnnual: 0.04,
    targetInflationAnnual: 0.04,
    inflationTransitionMonths: 1,
    pensionPct: 0.08,
    personalAllowanceMonthlyISK: 60000,
    bracket1LimitISK: 350000,
    bracket2LimitISK: 900000,
    bracket1Rate: 0.31,
    bracket2Rate: 0.37,
    bracket3Rate: 0.46,
    inflationImpactsExpenses: false
  },
  expenseItems: [],
  incomeEvents: [],
  ...overrides
});

describe("calc", () => {
  it("formats dates as dd.mm.yyyy", () => {
    expect(formatDate(new Date("2024-02-05"))).toBe("05.02.2024");
  });

  it("computes APY to monthly rate", () => {
    const rate = 0.12;
    const monthly = apyToMonthlyRate(rate);
    expect(monthly).toBeCloseTo(Math.pow(1 + rate, 1 / 12) - 1, 8);
  });

  it("computes inflation transition from high to low", () => {
    const start = 0.08;
    const end = 0.03;
    const step = interpolateLinear(start, end, 3, 5);
    expect(step).toBeCloseTo(0.055, 6);
  });

  it("calculates progressive tax brackets", () => {
    const scenario = baseScenario({
      expenseItems: [],
      incomeEvents: [],
      assumptions: {
        ...baseScenario().assumptions,
        monthlySalaryBeforeTaxISK: 1000000,
        pensionPct: 0.1,
        personalAllowanceMonthlyISK: 0,
        bracket1LimitISK: 300000,
        bracket2LimitISK: 700000,
        bracket1Rate: 0.2,
        bracket2Rate: 0.3,
        bracket3Rate: 0.4
      }
    });
    const projection = computeMonthlyProjection(scenario);
    const first = projection.rows[0];
    // taxable = 900000
    // tax = 300000*0.2 + 400000*0.3 + 200000*0.4 = 60k + 120k + 80k = 260k
    expect(first.taxISK).toBe(260000);
  });

  it("applies inflation to expenses when toggle is on", () => {
    const scenarioOff = baseScenario({
      assumptions: {
        ...baseScenario().assumptions,
        durationMonths: 13,
        currentInflationAnnual: 0.12,
        targetInflationAnnual: 0.12,
        inflationTransitionMonths: 1,
        inflationImpactsExpenses: false
      },
      expenseItems: [
        {
          name: "Rent",
          monthlyAmountISK: 100000,
          startsMonth: 1,
          annualIncreasePct: 0.02,
          enabled: true
        }
      ]
    });

    const scenarioOn = baseScenario({
      assumptions: {
        ...baseScenario().assumptions,
        durationMonths: 13,
        currentInflationAnnual: 0.12,
        targetInflationAnnual: 0.12,
        inflationTransitionMonths: 1,
        inflationImpactsExpenses: true
      },
      expenseItems: [
        {
          name: "Rent",
          monthlyAmountISK: 100000,
          startsMonth: 1,
          annualIncreasePct: 0.02,
          enabled: true
        }
      ]
    });

    const rowOff = computeMonthlyProjection(scenarioOff).rows[12];
    const rowOn = computeMonthlyProjection(scenarioOn).rows[12];

    expect(rowOff.expensesISK).toBe(102000);
    expect(rowOn.expensesISK).toBe(114000);
  });

  it("converts annual inflation to monthly correctly", () => {
    const annual = 0.06;
    const monthly = annualToMonthlyInflation(annual);
    expect(monthly).toBeCloseTo(Math.pow(1 + annual, 1 / 12) - 1, 8);
  });
});
