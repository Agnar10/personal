# Savings Projector (ISK)

A full-stack, multi-scenario savings projection dashboard for Icelandic Krona (ISK). It projects savings month-by-month, supports scenario comparison, and includes inflation/interest transitions, progressive tax brackets, and real vs nominal views.

## Stack
- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Tailwind CSS (dark neon analytics dashboard styling)
- Recharts
- Business logic in `/lib/calc` with unit tests

## Setup
```bash
npm install
```

### Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Run the app
```bash
npm run dev
```

### Tests
```bash
npm run test
```

## Key formulas & rules
- **Interpolation:** Linear month-by-month interpolation from current → target.
  - `interpolateLinear(start, end, stepIndex, totalSteps)`
- **Monthly rates:**
  - Interest: `(1 + APY)^(1/12) - 1`
  - Inflation: `(1 + annualInflation)^(1/12) - 1`
- **Salary increases:** Applied as a **step increase** every 12 months at months 13, 25, 37, ...
- **Expense increases:** Same step rule, with a toggle:
  - Off: `effectiveAnnual = annualIncreasePct`
  - On: `effectiveAnnual = annualIncreasePct + inflationAnnual`
- **Taxes:**
  - Pension: `round(gross * pensionPct)`
  - Taxable: `max(0, gross - pension - personalAllowance)`
  - Progressive brackets with editable limits and rates
- **Savings balance:**
  - `preInterest = prevBalance + savingsDeposit`
  - `interestEarned = round(preInterest * monthlyInterestRate)`
  - `balance = preInterest + interestEarned`
- **Real (today's ISK):**
  - `realValue = nominal / cumulativeInflationIndex`

## CSV exports
- Monthly projection CSV
- Summary CSV

Dates are formatted as `dd.mm.yyyy` and all ISK values are integers.
