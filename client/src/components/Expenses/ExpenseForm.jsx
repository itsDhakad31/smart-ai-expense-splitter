import { useEffect, useState } from "react";
import { suggestCategory } from "../../api";
import { formatCurrency } from "../../utils/currency";

function createInitialSplits(members) {
  return members.reduce((accumulator, member) => {
    accumulator[member.id] = "";
    return accumulator;
  }, {});
}

function getCategoryClassName(category) {
  return `category-pill category-pill--${(category || "general").toLowerCase()}`;
}

function ExpenseForm({ group, isSubmitting, onAddExpense }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || "");
  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState(createInitialSplits(group.members));
  const [category, setCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCustomSplits(createInitialSplits(group.members));
    setPaidBy(group.members[0]?.id || "");
  }, [group.members]);

  useEffect(() => {
    if (!description.trim()) {
      setCategory("");
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setCategoryLoading(true);
        const response = await suggestCategory(description.trim());
        setCategory(response.category || "");
      } catch (requestError) {
        setCategory("");
      } finally {
        setCategoryLoading(false);
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [description]);

  function resetForm() {
    setDescription("");
    setAmount("");
    setSplitType("equal");
    setCustomSplits(createInitialSplits(group.members));
    setCategory("");
    setError("");
  }

  function updateCustomSplit(memberId, value) {
    setCustomSplits((currentSplits) => ({
      ...currentSplits,
      [memberId]: value
    }));
  }

  function getCustomTotal() {
    return group.members.reduce((sum, member) => {
      return sum + Number(customSplits[member.id] || 0);
    }, 0);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!description.trim()) {
      setError("Please enter an expense description.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    let splits = [];

    if (splitType === "custom") {
      splits = group.members.map((member) => ({
        memberId: member.id,
        amount: Number(customSplits[member.id] || 0)
      }));

      const customTotal = splits.reduce((sum, split) => sum + split.amount, 0);

      if (Math.abs(customTotal - parsedAmount) > 0.01) {
        setError("Custom split amounts must add up to the total expense.");
        return;
      }
    }

    setError("");

    await onAddExpense({
      description: description.trim(),
      amount: parsedAmount,
      paidBy,
      splitType,
      splits,
      category
    });

    resetForm();
  }

  const customTotal = getCustomTotal();

  return (
    <section className="panel form-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>Add an expense</h2>
        </div>
        {category ? <span className={getCategoryClassName(category)}>{category}</span> : null}
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <span>Description</span>
            <input
              type="text"
              placeholder="Pizza dinner"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <small>{categoryLoading ? "Checking category..." : "Category updates automatically."}</small>
          </label>

          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Who paid</span>
            <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)}>
              {group.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Split type</span>
            <select value={splitType} onChange={(event) => setSplitType(event.target.value)}>
              <option value="equal">Equal</option>
              <option value="custom">Custom amounts</option>
            </select>
          </label>
        </div>

        {splitType === "equal" ? (
          <div className="helper-box">
            {amount
              ? `Each member will share approximately ${formatCurrency(Number(amount) / group.members.length)}.`
              : "Enter an amount to preview the equal share per member."}
          </div>
        ) : (
          <div className="field">
            <span>Custom split</span>
            <div className="split-grid">
              {group.members.map((member) => (
                <label key={member.id} className="field split-field">
                  <span>{member.name}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customSplits[member.id]}
                    onChange={(event) => updateCustomSplit(member.id, event.target.value)}
                  />
                </label>
              ))}
            </div>
            <small>
              Current total: {formatCurrency(customTotal)}
              {amount ? ` of ${formatCurrency(amount)}` : ""}
            </small>
          </div>
        )}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving expense..." : "Add expense"}
        </button>
      </form>
    </section>
  );
}

export default ExpenseForm;
