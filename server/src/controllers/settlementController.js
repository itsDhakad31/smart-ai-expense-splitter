import {
  replaceCompletedSettlementIds,
  setSettlementCompletion,
  store
} from "../data/store.js";
import { buildAppState } from "../utils/balance.js";

function buildCurrentState() {
  const nextState = buildAppState(
    store.group,
    store.expenses,
    store.completedSettlementIds
  );

  const validIds = nextState.settlements.map((settlement) => settlement.id);
  const filteredIds = store.completedSettlementIds.filter((id) => validIds.includes(id));

  if (filteredIds.length !== store.completedSettlementIds.length) {
    replaceCompletedSettlementIds(filteredIds);
    return buildAppState(store.group, store.expenses, filteredIds);
  }

  return nextState;
}

export function getState(_request, response) {
  response.json(buildCurrentState());
}

export function updateSettlementStatus(request, response) {
  if (!store.group) {
    return response.status(400).json({
      message: "Create a group before updating settlements."
    });
  }

  const { settlementId } = request.params;
  const { completed } = request.body;
  const currentState = buildCurrentState();
  const targetSettlement = currentState.settlements.find(
    (settlement) => settlement.id === settlementId
  );

  if (!targetSettlement) {
    return response.status(404).json({
      message: "Settlement not found."
    });
  }

  setSettlementCompletion(settlementId, Boolean(completed));

  return response.json(
    buildAppState(store.group, store.expenses, store.completedSettlementIds)
  );
}

