import { formatCurrency } from "../utils/currency";

function Overview({ group, totals, settlements, onManageGroup }) {
  const pendingSettlements = settlements.filter(
    (settlement) => !settlement.completed
  );

  return (
    <section className="overview-grid">
      <article className="panel metric-card">
        <p className="eyebrow">Group</p>
        <h2>{group.name}</h2>
        <p>{group.members.length} members active</p>
        <button className="secondary-button metric-card__action" type="button" onClick={onManageGroup}>
          Manage group
        </button>
      </article>

      <article className="panel metric-card">
        <p className="eyebrow">Spent</p>
        <h2>{formatCurrency(totals.totalSpent)}</h2>
        <p>{totals.totalExpenses} expense entries</p>
      </article>

      <article className="panel metric-card">
        <p className="eyebrow">Settlements</p>
        <h2>{pendingSettlements.length}</h2>
        <p>
          {pendingSettlements.length
            ? "Payments still pending"
            : settlements.length
              ? "All suggested payments are done"
              : "Everyone is settled"}
        </p>
      </article>
    </section>
  );
}

export default Overview;
