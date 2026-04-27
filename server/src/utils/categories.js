const CATEGORY_KEYWORDS = {
  Food: ["pizza", "dinner", "lunch", "breakfast", "snacks", "groceries", "restaurant", "cafe"],
  Travel: ["uber", "ola", "taxi", "flight", "bus", "train", "fuel", "petrol", "diesel"],
  Rent: ["rent", "deposit", "lease"],
  Utilities: ["electricity", "water", "wifi", "internet", "gas", "bill", "maintenance"],
  Entertainment: ["movie", "netflix", "game", "concert", "party"],
  Shopping: ["shopping", "clothes", "amazon", "mall", "gift"]
};

export function guessCategoryFromKeywords(description = "") {
  const normalizedDescription = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedDescription.includes(keyword))) {
      return category;
    }
  }

  return "General";
}

