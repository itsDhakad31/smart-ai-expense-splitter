import { guessCategoryFromKeywords } from "../utils/categories.js";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";
const OPENAI_INSIGHTS_MODEL = process.env.OPENAI_INSIGHTS_MODEL || OPENAI_MODEL;

async function callOpenAI({ instructions, input, maxOutputTokens = 180 }) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions,
      input,
      max_output_tokens: maxOutputTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.output_text?.trim() || null;
}

async function callOpenAIForInsights(expenses) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_INSIGHTS_MODEL,
      instructions:
        "You analyze shared expenses. Return 2 or 3 concise bullet points only. Focus on spending patterns, biggest categories, split behavior, and useful observations.",
      input: JSON.stringify(
        expenses.map((expense) => ({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          paidBy: expense.paidBy,
          splitType: expense.splitType
        }))
      ),
      max_output_tokens: 180
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.output_text?.trim() || null;
}

export async function getExpenseCategory(description) {
  const fallbackCategory = guessCategoryFromKeywords(description);

  try {
    const text = await callOpenAI({
      instructions:
        "Categorize an expense description into one short label. Respond with only one category from this list: Food, Travel, Rent, Entertainment, Utilities, Shopping, General.",
      input: `Description: ${description}`,
      maxOutputTokens: 30
    });

    return text || fallbackCategory;
  } catch (_error) {
    return fallbackCategory;
  }
}

function buildFallbackInsights(expenses) {
  if (!expenses.length) {
    return [];
  }

  const categoryTotals = expenses.reduce((accumulator, expense) => {
    const category = expense.category || "General";
    accumulator[category] = (accumulator[category] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort(
    (left, right) => right[1] - left[1]
  );
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );
  const topCategory = sortedCategories[0];

  const unevenCustomCount = expenses.filter(
    (expense) => expense.splitType === "custom"
  ).length;

  const insights = [
    `You spent the most on ${topCategory[0]} (${Math.round(
      (topCategory[1] / totalAmount) * 100
    )}% of total spending).`,
    `You have added ${expenses.length} expenses worth Rs ${totalAmount.toFixed(2)} in total.`
  ];

  if (unevenCustomCount > 0) {
    insights.push(
      `Custom split expenses appear ${unevenCustomCount} time(s), so not every cost is divided equally.`
    );
  } else {
    insights.push("All recorded expenses are split equally so far.");
  }

  return insights;
}

export async function generateInsights(expenses) {
  const fallbackInsights = buildFallbackInsights(expenses);

  if (!expenses.length) {
    return [];
  }

  try {
    const text = await callOpenAIForInsights(expenses);

    if (!text) {
      return fallbackInsights;
    }

    return text
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch (_error) {
    return fallbackInsights;
  }
}
