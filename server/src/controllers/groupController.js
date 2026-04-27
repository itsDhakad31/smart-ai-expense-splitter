import { setGroup, store } from "../data/store.js";
import { buildAppState } from "../utils/balance.js";

function createMemberId(name, index) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`;
}

export function createGroup(request, response) {
  const { name, members } = request.body;
  const trimmedName = String(name || "").trim();

  if (!trimmedName || !Array.isArray(members)) {
    return response.status(400).json({
      message: "Group name and members are required."
    });
  }

  const trimmedMembers = members
    .map((member) => String(member).trim())
    .filter(Boolean);

  if (trimmedMembers.length < 2) {
    return response.status(400).json({
      message: "At least two members are required."
    });
  }

  const uniqueNames = new Set(trimmedMembers.map((member) => member.toLowerCase()));

  if (uniqueNames.size !== trimmedMembers.length) {
    return response.status(400).json({
      message: "Member names must be unique."
    });
  }

  setGroup({
    id: "active-group",
    name: trimmedName,
    members: trimmedMembers.map((member, index) => ({
      id: createMemberId(member, index),
      name: member
    }))
  });

  return response
    .status(201)
    .json(buildAppState(store.group, store.expenses, store.completedSettlementIds));
}
