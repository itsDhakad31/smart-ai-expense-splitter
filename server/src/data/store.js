export const store = {
  group: null,
  expenses: [],
  completedSettlementIds: []
};

export function resetStore() {
  store.group = null;
  store.expenses = [];
  store.completedSettlementIds = [];
}

export function setGroup(group) {
  store.group = group;
  store.expenses = [];
  store.completedSettlementIds = [];
}

export function addExpense(expense) {
  store.expenses.push(expense);
  store.completedSettlementIds = [];
}

export function setSettlementCompletion(settlementId, completed) {
  const completedIds = new Set(store.completedSettlementIds);

  if (completed) {
    completedIds.add(settlementId);
  } else {
    completedIds.delete(settlementId);
  }

  store.completedSettlementIds = Array.from(completedIds);
}

export function replaceCompletedSettlementIds(settlementIds) {
  store.completedSettlementIds = settlementIds;
}
