import { addExpense, store } from "../data/store.js";
import { getExpenseCategory } from "../services/aiService.js";
import { buildAppState, normalizeSplits } from "../utils/balance.js";

export async function createExpense(request, response, next) {
  try {
    if (!store.group) {
      return response.status(400).json({
        message: "Create a group before adding expenses."
      });
    }

    const { description, amount, paidBy, splitType = "equal", splits = [], category } = request.body;

    if (!description || !amount || !paidBy) {
      return response.status(400).json({
        message: "Description, amount, and payer are required."
      });
    }

    if (!store.group.members.some((member) => member.id === paidBy)) {
      return response.status(400).json({
        message: "The selected payer is not part of the group."
      });
    }

    if (!["equal", "custom"].includes(splitType)) {
      return response.status(400).json({
        message: "Split type must be equal or custom."
      });
    }

    if (Number(amount) <= 0) {
      return response.status(400).json({
        message: "Amount must be greater than zero."
      });
    }

    const normalizedSplits = normalizeSplits(
      { amount, splitType, splits },
      store.group
    );

    const memberIds = new Set(store.group.members.map((member) => member.id));
    const hasUnknownMember = normalizedSplits.some((split) => !memberIds.has(split.memberId));

    if (hasUnknownMember) {
      return response.status(400).json({
        message: "All split members must belong to the active group."
      });
    }

    const resolvedCategory = category || (await getExpenseCategory(description));

    addExpense({
      id: `expense-${store.expenses.length + 1}`,
      description: String(description).trim(),
      amount: Number(Number(amount).toFixed(2)),
      paidBy,
      splitType,
      splits: normalizedSplits,
      category: resolvedCategory,
      createdAt: new Date().toISOString()
    });

    return response.status(201).json(
      buildAppState(store.group, store.expenses, store.completedSettlementIds)
    );
  } catch (error) {
    next(error);
  }
}
