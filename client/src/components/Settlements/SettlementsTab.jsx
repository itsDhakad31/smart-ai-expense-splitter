import { formatCurrency } from "../../utils/currency";

function SettlementsTab({ settlements, updatingSettlementId, onToggleSettlement }) {
  if (!settlements.length) {
    return (
      <div className="empty-state">
        <h3>All settled</h3>
        <p>No payments are needed right now.</p>
      </div>
    );
  }

  return (
    <div className="settlement-list">
      {settlements.map((settlement) => (
        <article
          key={settlement.id}
          className={
            settlement.completed
              ? "settlement-card settlement-card--completed"
              : "settlement-card"
          }
        >
          <div className="settlement-card__content">
            <h3>
              {settlement.from} owes {settlement.to}
            </h3>
            <p>
              {settlement.completed
                ? "Marked as completed"
                : "Recommended settlement payment"}
            </p>
          </div>
          <div className="settlement-card__actions">
            <strong>{formatCurrency(settlement.amount)}</strong>
            <button
              type="button"
              className={
                settlement.completed
                  ? "settlement-toggle settlement-toggle--completed"
                  : "settlement-toggle"
              }
              onClick={() =>
                onToggleSettlement(settlement.id, !settlement.completed)
              }
              disabled={updatingSettlementId === settlement.id}
            >
              <span className="settlement-toggle__tick" aria-hidden="true">
                ✓
              </span>
              <span>
                {updatingSettlementId === settlement.id
                  ? "Saving..."
                  : settlement.completed
                    ? "Done"
                    : "Mark done"}
              </span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default SettlementsTab;
