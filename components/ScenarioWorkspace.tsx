"use client";

import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { computeMonthlyProjection, computeSummary, formatDate } from "@/lib/calc";
import type { ProjectionResult, ScenarioInput, SummaryResult } from "@/lib/calc/types";
import ComparisonChart from "@/components/ComparisonChart";
import ProjectionTable from "@/components/ProjectionTable";
import SummaryCards from "@/components/SummaryCards";
import ExportButtons from "@/components/ExportButtons";

const numberFormatter = new Intl.NumberFormat("is-IS");

const toISK = (value: number): string => `${numberFormatter.format(value)} Kr`;

const parseDateInput = (value: string): Date => {
  const parsed = parse(value, "dd.MM.yyyy", new Date());
  return Number.isNaN(parsed.valueOf()) ? new Date() : parsed;
};

type ScenarioWorkspaceProps = {
  scenarios: ScenarioInput[];
  projections: ProjectionResult[];
  summaries: SummaryResult[];
};

const ScenarioWorkspace = ({ scenarios, projections, summaries }: ScenarioWorkspaceProps) => {
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id ?? "");
  const [selectedScenarioState, setSelectedScenarioState] = useState(() => {
    const initial = scenarios[0];
    return initial ? { ...initial } : null;
  });
  const [comparisonIds, setComparisonIds] = useState(() =>
    scenarios.map((scenario) => scenario.id)
  );
  const [showReal, setShowReal] = useState(false);
  const [baselineId, setBaselineId] = useState(scenarios[0]?.id ?? "");

  const selectedScenario = useMemo(() => {
    if (!selectedScenarioState) return null;
    return selectedScenarioState;
  }, [selectedScenarioState]);

  const computedProjection = useMemo(() => {
    if (!selectedScenario) return null;
    return computeMonthlyProjection(selectedScenario);
  }, [selectedScenario]);

  const computedSummary = useMemo(() => {
    if (!computedProjection) return null;
    return computeSummary(computedProjection);
  }, [computedProjection]);

  const comparisonProjections = useMemo(() => {
    return scenarios
      .filter((scenario) => comparisonIds.includes(scenario.id))
      .map((scenario) => computeMonthlyProjection(scenario));
  }, [comparisonIds, scenarios]);

  const comparisonSummaries = useMemo(() => {
    return comparisonProjections.map((projection) => computeSummary(projection));
  }, [comparisonProjections]);

  const baselineSummary = comparisonSummaries.find((summary) => summary.scenarioId === baselineId);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedId(scenarioId);
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (scenario) {
      setSelectedScenarioState({ ...scenario });
    }
  };

  const updateAssumption = <K extends keyof ScenarioInput["assumptions"]>(
    key: K,
    value: ScenarioInput["assumptions"][K]
  ) => {
    if (!selectedScenario) return;
    setSelectedScenarioState({
      ...selectedScenario,
      assumptions: {
        ...selectedScenario.assumptions,
        [key]: value
      }
    });
  };

  const updateExpense = (index: number, key: keyof ScenarioInput["expenseItems"][0], value: number | string | boolean) => {
    if (!selectedScenario) return;
    const updated = [...selectedScenario.expenseItems];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setSelectedScenarioState({
      ...selectedScenario,
      expenseItems: updated
    });
  };

  if (!selectedScenario || !computedProjection || !computedSummary) {
    return <div className="p-6">No scenarios found. Seed the database to begin.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-72 border-r border-panel-border bg-panel px-5 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">Savings Projector (ISK)</h1>
          <p className="text-xs text-slate-400">Scenario routes & comparisons</p>
        </div>
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                selectedId === scenario.id
                  ? "border-neon-purple bg-panel-2 text-white shadow-glow"
                  : "border-panel-border bg-panel-2 text-slate-300 hover:border-neon-cyan"
              }`}
              onClick={() => handleScenarioSelect(scenario.id)}
            >
              <div className="font-semibold">{scenario.name}</div>
              <div className="text-xs text-slate-400">
                {scenario.assumptions.durationMonths} months · Start {formatDate(new Date(scenario.assumptions.startDate))}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-8 space-y-2 text-xs text-slate-400">
          <button className="w-full rounded-lg border border-dashed border-panel-border px-3 py-2 text-slate-300">
            + Create scenario
          </button>
          <button className="w-full rounded-lg border border-dashed border-panel-border px-3 py-2 text-slate-300">
            Duplicate selected
          </button>
        </div>
      </aside>

      <section className="flex-1 space-y-6 px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{selectedScenario.name}</h2>
            <p className="text-sm text-slate-400">
              Month-by-month projection · {selectedScenario.assumptions.durationMonths} months
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-panel-border bg-panel px-4 py-2">
            <span className="text-xs text-slate-400">View</span>
            <button
              className={`rounded-full px-3 py-1 text-xs ${
                !showReal ? "bg-neon-cyan text-slate-900" : "text-slate-300"
              }`}
              onClick={() => setShowReal(false)}
            >
              Nominal
            </button>
            <button
              className={`rounded-full px-3 py-1 text-xs ${
                showReal ? "bg-neon-purple text-slate-900" : "text-slate-300"
              }`}
              onClick={() => setShowReal(true)}
            >
              Real (today's ISK)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-panel-border bg-panel p-6 shadow-glow">
            <h3 className="mb-4 text-sm font-semibold text-neon-cyan">Assumptions</h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <label className="flex flex-col gap-1 text-slate-300">
                Start date (dd.mm.yyyy)
                <input
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={format(new Date(selectedScenario.assumptions.startDate), "dd.MM.yyyy")}
                  onChange={(event) => updateAssumption("startDate", parseDateInput(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Duration (months)
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.durationMonths}
                  onChange={(event) => updateAssumption("durationMonths", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Starting savings (ISK)
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.startingSavingsBalanceISK}
                  onChange={(event) =>
                    updateAssumption("startingSavingsBalanceISK", Number(event.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Monthly salary before tax (ISK)
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.monthlySalaryBeforeTaxISK}
                  onChange={(event) =>
                    updateAssumption("monthlySalaryBeforeTaxISK", Number(event.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Annual salary increase (%)
                <input
                  type="number"
                  step="0.01"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.annualSalaryIncreasePct}
                  onChange={(event) => updateAssumption("annualSalaryIncreasePct", Number(event.target.value))}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-slate-300">
                  Salary change month
                  <input
                    type="number"
                    className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                    value={selectedScenario.assumptions.salaryChangeMonth ?? ""}
                    onChange={(event) => updateAssumption("salaryChangeMonth", Number(event.target.value))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-slate-300">
                  New monthly salary
                  <input
                    type="number"
                    className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                    value={selectedScenario.assumptions.newMonthlySalaryBeforeTaxISK ?? ""}
                    onChange={(event) =>
                      updateAssumption("newMonthlySalaryBeforeTaxISK", Number(event.target.value))
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-panel-border bg-panel p-6 shadow-glowCyan">
            <h3 className="mb-4 text-sm font-semibold text-neon-purple">Inflation & Interest</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <label className="flex flex-col gap-1 text-slate-300">
                Current inflation (annual %)
                <input
                  type="number"
                  step="0.001"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.currentInflationAnnual}
                  onChange={(event) => updateAssumption("currentInflationAnnual", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Target inflation (annual %)
                <input
                  type="number"
                  step="0.001"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.targetInflationAnnual}
                  onChange={(event) => updateAssumption("targetInflationAnnual", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Inflation transition months
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.inflationTransitionMonths}
                  onChange={(event) =>
                    updateAssumption("inflationTransitionMonths", Number(event.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Current savings APY
                <input
                  type="number"
                  step="0.001"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.currentSavingsAPY}
                  onChange={(event) => updateAssumption("currentSavingsAPY", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Target savings APY
                <input
                  type="number"
                  step="0.001"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.targetSavingsAPY}
                  onChange={(event) => updateAssumption("targetSavingsAPY", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Interest transition months
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.interestTransitionMonths}
                  onChange={(event) =>
                    updateAssumption("interestTransitionMonths", Number(event.target.value))
                  }
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-full border border-neon-purple px-3 py-1 text-xs text-neon-purple"
                onClick={() => {
                  updateAssumption("currentInflationAnnual", 0.06);
                  updateAssumption("targetInflationAnnual", 0.028);
                  updateAssumption("inflationTransitionMonths", 24);
                }}
              >
                High → Lower
              </button>
              <button
                className="rounded-full border border-neon-cyan px-3 py-1 text-xs text-neon-cyan"
                onClick={() => {
                  updateAssumption("currentInflationAnnual", 0.03);
                  updateAssumption("targetInflationAnnual", 0.03);
                  updateAssumption("inflationTransitionMonths", 1);
                }}
              >
                Flat
              </button>
              <button
                className="rounded-full border border-neon-pink px-3 py-1 text-xs text-neon-pink"
                onClick={() => {
                  updateAssumption("currentInflationAnnual", 0.025);
                  updateAssumption("targetInflationAnnual", 0.055);
                  updateAssumption("inflationTransitionMonths", 24);
                }}
              >
                Low → Higher
              </button>
            </div>
            <div className="mt-4 rounded-lg border border-panel-border bg-panel-2 p-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Inflation impacts expenses</p>
              <p className="mt-1">
                {selectedScenario.assumptions.inflationImpactsExpenses
                  ? "ON: Effective annual expense increase = annualIncreasePct + inflationAnnual, applied once every 12 months."
                  : "OFF: Expense growth uses only annualIncreasePct, applied once every 12 months."}
              </p>
              <button
                className={`mt-2 rounded-full px-3 py-1 text-xs ${
                  selectedScenario.assumptions.inflationImpactsExpenses
                    ? "bg-neon-purple text-slate-900"
                    : "bg-slate-700 text-slate-200"
                }`}
                onClick={() =>
                  updateAssumption("inflationImpactsExpenses", !selectedScenario.assumptions.inflationImpactsExpenses)
                }
              >
                {selectedScenario.assumptions.inflationImpactsExpenses ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-panel-border bg-panel p-6">
            <h3 className="mb-4 text-sm font-semibold text-neon-cyan">Tax & Pension</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <label className="flex flex-col gap-1 text-slate-300">
                Pension (%)
                <input
                  type="number"
                  step="0.01"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.pensionPct}
                  onChange={(event) => updateAssumption("pensionPct", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Personal allowance (ISK)
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.personalAllowanceMonthlyISK}
                  onChange={(event) =>
                    updateAssumption("personalAllowanceMonthlyISK", Number(event.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Bracket 1 limit (ISK)
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.bracket1LimitISK}
                  onChange={(event) => updateAssumption("bracket1LimitISK", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Bracket 2 limit (ISK)
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.bracket2LimitISK}
                  onChange={(event) => updateAssumption("bracket2LimitISK", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Bracket 1 rate
                <input
                  type="number"
                  step="0.01"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.bracket1Rate}
                  onChange={(event) => updateAssumption("bracket1Rate", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Bracket 2 rate
                <input
                  type="number"
                  step="0.01"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.bracket2Rate}
                  onChange={(event) => updateAssumption("bracket2Rate", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                Bracket 3 rate
                <input
                  type="number"
                  step="0.01"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={selectedScenario.assumptions.bracket3Rate}
                  onChange={(event) => updateAssumption("bracket3Rate", Number(event.target.value))}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-panel-border bg-panel p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neon-purple">Expenses</h3>
            <button className="rounded-full border border-panel-border px-3 py-1 text-xs text-slate-300">
              + Add expense
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {selectedScenario.expenseItems.map((item, index) => (
              <div key={item.name} className="grid grid-cols-6 gap-3 text-xs text-slate-300">
                <input
                  className="col-span-2 rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={item.name}
                  onChange={(event) => updateExpense(index, "name", event.target.value)}
                />
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={item.monthlyAmountISK}
                  onChange={(event) => updateExpense(index, "monthlyAmountISK", Number(event.target.value))}
                />
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={item.annualIncreasePct}
                  onChange={(event) => updateExpense(index, "annualIncreasePct", Number(event.target.value))}
                />
                <input
                  type="number"
                  className="rounded-md border border-panel-border bg-panel-2 px-3 py-2 text-white"
                  value={item.startsMonth}
                  onChange={(event) => updateExpense(index, "startsMonth", Number(event.target.value))}
                />
                <label className="flex items-center justify-center gap-2 rounded-md border border-panel-border bg-panel-2 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(event) => updateExpense(index, "enabled", event.target.checked)}
                  />
                  Enabled
                </label>
              </div>
            ))}
          </div>
        </div>

        <SummaryCards summary={computedSummary} />

        <div className="rounded-2xl border border-panel-border bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-neon-cyan">Scenario comparison</h3>
              <p className="text-xs text-slate-400">Compare final balances and cashflow totals side-by-side.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Baseline</span>
              <select
                className="rounded-md border border-panel-border bg-panel-2 px-2 py-1"
                value={baselineId}
                onChange={(event) => setBaselineId(event.target.value)}
              >
                {comparisonSummaries.map((summary) => (
                  <option key={summary.scenarioId} value={summary.scenarioId}>
                    {summary.scenarioName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <label
                key={scenario.id}
                className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel-2 px-3 py-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={comparisonIds.includes(scenario.id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setComparisonIds([...comparisonIds, scenario.id]);
                    } else {
                      setComparisonIds(comparisonIds.filter((id) => id !== scenario.id));
                    }
                  }}
                />
                {scenario.name}
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {comparisonSummaries.map((summary) => (
              <div key={summary.scenarioId} className="rounded-xl border border-panel-border bg-panel px-4 py-3">
                <div className="text-sm font-semibold text-white">{summary.scenarioName}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    Final balance
                    <div className="text-sm text-white">{toISK(summary.finalSavingsBalanceISK)}</div>
                  </div>
                  <div>
                    Total deposits
                    <div className="text-sm text-white">{toISK(summary.totalSavingsDepositsISK)}</div>
                  </div>
                  <div>
                    Total interest
                    <div className="text-sm text-white">{toISK(summary.totalInterestEarnedISK)}</div>
                  </div>
                  <div>
                    Total expenses
                    <div className="text-sm text-white">{toISK(summary.totalExpensesISK)}</div>
                  </div>
                </div>
                {baselineSummary && baselineSummary.scenarioId !== summary.scenarioId ? (
                  <div className="mt-2 text-xs text-neon-cyan">
                    Difference vs baseline: {toISK(summary.finalSavingsBalanceISK - baselineSummary.finalSavingsBalanceISK)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-6 h-80 rounded-xl border border-panel-border bg-panel-2 p-4">
            <ComparisonChart
              projections={comparisonProjections}
              showReal={showReal}
              baselineId={baselineId}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-panel-border bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-neon-cyan">Monthly projection</h3>
              <p className="text-xs text-slate-400">
                Inflation rate and interest rate are shown as annual and monthly effective rates.
              </p>
            </div>
            <ExportButtons projection={computedProjection} summary={computedSummary} />
          </div>
          <ProjectionTable projection={computedProjection} showReal={showReal} />
        </div>

        <div className="rounded-2xl border border-panel-border bg-panel p-6 text-xs text-slate-400">
          <p className="font-semibold text-white">Calculation notes</p>
          <ul className="mt-2 space-y-2">
            <li>
              Salary and expense annual increases apply once every 12 months at months 13, 25, 37, ... (step method).
            </li>
            <li>
              Inflation and savings interest transition linearly month-by-month between current and target values over the
              configured transition months.
            </li>
            <li>
              Monthly interest and inflation rates are converted from annual using (1 + annual)^(1/12) - 1.
            </li>
            <li>
              Real (today's ISK) values deflate nominal figures by the cumulative inflation index since the start date.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ScenarioWorkspace;
