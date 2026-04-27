function InsightsPanel({ insights, isLoading, expenseCount, onRefresh }) {
  const hasExpenses = expenseCount > 0;

  return (
    <section className="panel insights-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI Insights</p>
          <h2>Spending patterns</h2>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={onRefresh}
          disabled={!hasExpenses || isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!hasExpenses ? (
        <div className="empty-state empty-state--compact">
          <p>Add a few expenses to unlock insights.</p>
        </div>
      ) : isLoading && !insights.length ? (
        <div className="empty-state empty-state--compact">
          <p>Generating insights...</p>
        </div>
      ) : (
        <ul className="insight-list">
          {insights.map((insight, index) => (
            <li key={`${index}-${insight}`}>{insight}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default InsightsPanel;

