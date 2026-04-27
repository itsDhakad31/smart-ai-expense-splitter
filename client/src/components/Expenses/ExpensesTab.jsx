import { formatCurrency } from "../../utils/currency";

function getCategoryClassName(category) {
  return `category-pill category-pill--${(category || "general").toLowerCase()}`;
}

function ExpenseShareList({ expense, membersById }) {
  return (
    <ul className="share-list">
      {expense.splits.map((split) => (
        <li key={`${expense.id}-${split.memberId}`}>
          <span>{membersById[split.memberId] || "Unknown member"}</span>
          <strong>{formatCurrency(split.amount)}</strong>
        </li>
      ))}
    </ul>
  );
}

function ExpensesTab({ expenses, members }) {
  if (!expenses.length) {
    return (
      <div className="empty-state">
        <h3>No expenses yet</h3>
        <p>Add the first shared expense to start calculating balances.</p>
      </div>
    );
  }

  const membersById = members.reduce((accumulator, member) => {
    accumulator[member.id] = member.name;
    return accumulator;
  }, {});

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article key={expense.id} className="expense-card">
          <div className="expense-card__top">
            <div>
              <h3>{expense.description}</h3>
              <p>
                Paid by <strong>{membersById[expense.paidBy]}</strong> • {expense.splitType} split
              </p>
            </div>
            <div className="expense-card__amount">
              <strong>{formatCurrency(expense.amount)}</strong>
              {expense.category ? (
                <span className={getCategoryClassName(expense.category)}>{expense.category}</span>
              ) : null}
            </div>
          </div>

          <ExpenseShareList expense={expense} membersById={membersById} />
        </article>
      ))}
    </div>
  );
}

export default ExpensesTab;
