import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID, getOrCreateUser } from '@/lib/defaults';

export async function POST(request: Request) {
  await getOrCreateUser();
  const body = await request.json();
  const user = await prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data: {
      currency: body.currency ?? 'USD',
      monthStartDay: body.monthStartDay ?? 1
    }
  });
  return NextResponse.json(user);
}

export async function GET() {
  await getOrCreateUser();
  const [user, accounts, categories, rules, budgets, transactions, goals, contributions] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } }),
      prisma.account.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.category.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.rule.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.budget.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.transaction.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.savingsGoal.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.goalContribution.findMany({ where: { goal: { userId: DEFAULT_USER_ID } } })
    ]);

  const snapshots = await prisma.balanceSnapshot.findMany({
    where: { accountId: { in: accounts.map((account) => account.id) } }
  });

  const data = {
    user,
    accounts,
    categories,
    rules,
    budgets,
    transactions,
    goals,
    contributions,
    snapshots
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function PUT(request: Request) {
  await getOrCreateUser();
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file.' }, { status: 400 });
  }
  const text = await file.text();
  const data = JSON.parse(text);

  await prisma.$transaction([
    prisma.goalContribution.deleteMany({}),
    prisma.balanceSnapshot.deleteMany({}),
    prisma.transaction.deleteMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.budget.deleteMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.rule.deleteMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.category.deleteMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.savingsGoal.deleteMany({ where: { userId: DEFAULT_USER_ID } }),
    prisma.account.deleteMany({ where: { userId: DEFAULT_USER_ID } })
  ]);

  if (data.user) {
    await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: {
        name: data.user.name ?? 'Local User',
        currency: data.user.currency ?? 'USD',
        monthStartDay: data.user.monthStartDay ?? 1
      }
    });
  }

  if (Array.isArray(data.accounts)) {
    for (const account of data.accounts) {
      await prisma.account.create({
        data: {
          id: account.id,
          userId: DEFAULT_USER_ID,
          type: account.type,
          name: account.name,
          institution: account.institution,
          currency: account.currency,
          openingBalance: account.openingBalance
        }
      });
    }
  }

  if (Array.isArray(data.categories)) {
    for (const category of data.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          userId: DEFAULT_USER_ID,
          name: category.name,
          group: category.group,
          defaultBudget: category.defaultBudget
        }
      });
    }
  }

  if (Array.isArray(data.rules)) {
    for (const rule of data.rules) {
      await prisma.rule.create({
        data: {
          id: rule.id,
          userId: DEFAULT_USER_ID,
          priority: rule.priority,
          matchType: rule.matchType,
          pattern: rule.pattern,
          assignsCategoryId: rule.assignsCategoryId,
          assignsAccountId: rule.assignsAccountId
        }
      });
    }
  }

  if (Array.isArray(data.budgets)) {
    for (const budget of data.budgets) {
      await prisma.budget.create({
        data: {
          id: budget.id,
          userId: DEFAULT_USER_ID,
          month: budget.month,
          categoryId: budget.categoryId,
          limit: budget.limit
        }
      });
    }
  }

  if (Array.isArray(data.goals)) {
    for (const goal of data.goals) {
      await prisma.savingsGoal.create({
        data: {
          id: goal.id,
          userId: DEFAULT_USER_ID,
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: new Date(goal.targetDate),
          linkedAccountId: goal.linkedAccountId
        }
      });
    }
  }

  if (Array.isArray(data.transactions)) {
    for (const txn of data.transactions) {
      await prisma.transaction.create({
        data: {
          id: txn.id,
          userId: DEFAULT_USER_ID,
          date: new Date(txn.date),
          amount: txn.amount,
          merchant: txn.merchant,
          description: txn.description,
          categoryId: txn.categoryId,
          accountId: txn.accountId,
          importSource: txn.importSource,
          rawDataJson: txn.rawDataJson,
          notes: txn.notes,
          isTransfer: txn.isTransfer
        }
      });
    }
  }

  if (Array.isArray(data.contributions)) {
    for (const contribution of data.contributions) {
      await prisma.goalContribution.create({
        data: {
          id: contribution.id,
          goalId: contribution.goalId,
          date: new Date(contribution.date),
          amount: contribution.amount,
          transactionId: contribution.transactionId
        }
      });
    }
  }

  if (Array.isArray(data.snapshots)) {
    for (const snapshot of data.snapshots) {
      await prisma.balanceSnapshot.create({
        data: {
          id: snapshot.id,
          accountId: snapshot.accountId,
          date: new Date(snapshot.date),
          balance: snapshot.balance
        }
      });
    }
  }

  return NextResponse.json({ imported: true });
}
