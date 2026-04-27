const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function fetchAppState() {
  return request("/api/state");
}

export function createGroup(payload) {
  return request("/api/group", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createExpense(payload) {
  return request("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSettlementStatus(settlementId, completed) {
  return request(`/api/settlements/${settlementId}`, {
    method: "PATCH",
    body: JSON.stringify({ completed })
  });
}

export function suggestCategory(description) {
  return request("/api/ai/categorize", {
    method: "POST",
    body: JSON.stringify({ description })
  });
}

export function fetchInsights() {
  return request("/api/ai/insights", {
    method: "POST"
  });
}
