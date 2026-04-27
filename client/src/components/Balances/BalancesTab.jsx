import { formatCurrency } from "../../utils/currency";

function BalancesTab({ balances }) {
  if (!balances.length) {
    return (
      <div className="empty-state">
        <h3>No balances available</h3>
        <p>Create a group and add expenses to see who is owed and who owes.</p>
      </div>
    );
  }

  return (
    <div className="balance-list">
      {balances.map((balance) => {
        const amount = Math.abs(balance.balance);
        const statusClass =
          balance.balance > 0
            ? "balance-card balance-card--positive"
            : balance.balance < 0
              ? "balance-card balance-card--negative"
              : "balance-card";

        const statusText =
          balance.balance > 0
            ? "Should receive"
            : balance.balance < 0
              ? "Needs to pay"
              : "Settled up";

        return (
          <article key={balance.memberId} className={statusClass}>
            <div>
              <h3>{balance.name}</h3>
              <p>{statusText}</p>
            </div>
            <strong>{formatCurrency(amount)}</strong>
          </article>
        );
      })}
    </div>
  );
}

export default BalancesTab;

