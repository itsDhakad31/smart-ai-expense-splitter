import { fromPaise, toPaise } from "./money.js";

function createEqualSplits(memberIds, amountInPaise) {
  const baseShare = Math.floor(amountInPaise / memberIds.length);
  const remainder = amountInPaise % memberIds.length;

  return memberIds.map((memberId, index) => ({
    memberId,
    amountInPaise: baseShare + (index < remainder ? 1 : 0)
  }));
}

function createCustomSplits(splits) {
  return splits.map((split) => ({
    memberId: split.memberId,
    amountInPaise: toPaise(split.amount)
  }));
}

export function normalizeSplits(expenseInput, group) {
  const amountInPaise = toPaise(expenseInput.amount);
  const memberIds = group.members.map((member) => member.id);

  const normalizedSplits =
    expenseInput.splitType === "custom"
      ? createCustomSplits(expenseInput.splits)
      : createEqualSplits(memberIds, amountInPaise);

  const splitTotal = normalizedSplits.reduce(
    (sum, split) => sum + split.amountInPaise,
    0
  );

  if (splitTotal !== amountInPaise) {
    const error = new Error("Split amounts must exactly match the total expense.");
    error.statusCode = 400;
    throw error;
  }

  return normalizedSplits.map((split) => ({
    memberId: split.memberId,
    amount: fromPaise(split.amountInPaise)
  }));
}

export function calculateBalances(group, expenses) {
  if (!group) {
    return [];
  }

  const balanceMap = new Map(
    group.members.map((member) => [member.id, 0])
  );

  // We work in paise to avoid floating point rounding issues.
  // For every expense:
  // 1. The payer gets credited with the full amount.
  // 2. Each participant gets debited by their individual share.
  for (const expense of expenses) {
    const totalInPaise = toPaise(expense.amount);
    balanceMap.set(expense.paidBy, balanceMap.get(expense.paidBy) + totalInPaise);

    for (const split of expense.splits) {
      balanceMap.set(
        split.memberId,
        balanceMap.get(split.memberId) - toPaise(split.amount)
      );
    }
  }

  return group.members.map((member) => ({
    memberId: member.id,
    name: member.name,
    balance: fromPaise(balanceMap.get(member.id))
  }));
}

export function calculateSettlements(balances) {
  const creditors = balances
    .filter((balance) => balance.balance > 0)
    .map((balance) => ({
      ...balance,
      amountInPaise: toPaise(balance.balance)
    }));

  const debtors = balances
    .filter((balance) => balance.balance < 0)
    .map((balance) => ({
      ...balance,
      amountInPaise: Math.abs(toPaise(balance.balance))
    }));

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const transferAmount = Math.min(creditor.amountInPaise, debtor.amountInPaise);

    settlements.push({
      id: `${debtor.memberId}-${creditor.memberId}-${settlements.length}`,
      from: debtor.name,
      to: creditor.name,
      amount: fromPaise(transferAmount)
    });

    creditor.amountInPaise -= transferAmount;
    debtor.amountInPaise -= transferAmount;

    if (creditor.amountInPaise === 0) {
      creditorIndex += 1;
    }

    if (debtor.amountInPaise === 0) {
      debtorIndex += 1;
    }
  }

  return settlements;
}

export function buildAppState(group, expenses, completedSettlementIds = []) {
  const balances = calculateBalances(group, expenses);
  const completedIdSet = new Set(completedSettlementIds);
  const settlements = calculateSettlements(balances).map((settlement) => ({
    ...settlement,
    completed: completedIdSet.has(settlement.id)
  }));
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return {
    group,
    expenses,
    balances,
    settlements,
    totals: {
      totalSpent: Number(totalSpent.toFixed(2)),
      totalExpenses: expenses.length,
      memberCount: group?.members.length || 0
    }
  };
}
