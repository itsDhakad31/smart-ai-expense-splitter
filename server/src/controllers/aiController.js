import { store } from "../data/store.js";
import { generateInsights, getExpenseCategory } from "../services/aiService.js";

export async function categorizeExpense(request, response, next) {
  try {
    const { description } = request.body;

    if (!description) {
      return response.status(400).json({
        message: "Description is required."
      });
    }

    const category = await getExpenseCategory(description);
    return response.json({ category });
  } catch (error) {
    next(error);
  }
}

export async function getInsights(_request, response, next) {
  try {
    const insights = await generateInsights(store.expenses);
    return response.json({ insights });
  } catch (error) {
    next(error);
  }
}
