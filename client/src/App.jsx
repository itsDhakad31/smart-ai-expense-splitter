import { useEffect, useState } from "react";
import Header from "./components/Header";
import GroupSetup from "./components/GroupSetup";
import Overview from "./components/Overview";
import TabNav from "./components/TabNav";
import ExpenseForm from "./components/Expenses/ExpenseForm";
import ExpensesTab from "./components/Expenses/ExpensesTab";
import BalancesTab from "./components/Balances/BalancesTab";
import SettlementsTab from "./components/Settlements/SettlementsTab";
import InsightsPanel from "./components/Insights/InsightsPanel";
import {
  createGroup,
  fetchAppState,
  createExpense,
  fetchInsights,
  updateSettlementStatus
} from "./api";

const TAB_OPTIONS = [
  { id: "expenses", label: "Expenses" },
  { id: "balances", label: "Balances" },
  { id: "settlements", label: "Settlements" }
];

const EMPTY_STATE = {
  group: null,
  expenses: [],
  balances: [],
  settlements: [],
  totals: {
    totalSpent: 0,
    totalExpenses: 0,
    memberCount: 0
  }
};

function App() {
  const [appState, setAppState] = useState(EMPTY_STATE);
  const [activeTab, setActiveTab] = useState("expenses");
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [settlementUpdatingId, setSettlementUpdatingId] = useState("");
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (!appState.expenses.length) {
      setInsights([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadInsights();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [appState.expenses]);

  async function loadState() {
    try {
      setLoadingState(true);
      const nextState = await fetchAppState();
      setAppState(nextState);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to load the app state.");
    } finally {
      setLoadingState(false);
    }
  }

  async function handleCreateGroup(payload) {
    try {
      setGroupSubmitting(true);
      const nextState = await createGroup(payload);
      setAppState(nextState);
      setActiveTab("expenses");
      setShowGroupEditor(false);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to create the group.");
    } finally {
      setGroupSubmitting(false);
    }
  }

  async function handleAddExpense(payload) {
    try {
      setExpenseSubmitting(true);
      const nextState = await createExpense(payload);
      setAppState(nextState);
      setActiveTab("expenses");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to add the expense.");
      throw requestError;
    } finally {
      setExpenseSubmitting(false);
    }
  }

  async function loadInsights() {
    try {
      setInsightsLoading(true);
      const response = await fetchInsights();
      setInsights(response.insights || []);
    } catch (requestError) {
      setInsights([
        "Insights are temporarily unavailable.",
        requestError.message || "Please try again in a moment."
      ]);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleSettlementToggle(settlementId, completed) {
    try {
      setSettlementUpdatingId(settlementId);
      const nextState = await updateSettlementStatus(settlementId, completed);
      setAppState(nextState);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to update the settlement.");
    } finally {
      setSettlementUpdatingId("");
    }
  }

  function handleGoHome() {
    setActiveTab("expenses");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function handleOpenGroupEditor() {
    setShowGroupEditor(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function handleCloseGroupEditor() {
    setShowGroupEditor(false);
  }

  if (loadingState) {
    return (
      <main className="app-shell">
        <section className="panel loading-panel">
          <p>Loading your expense workspace...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <Header
          showHomeAction={Boolean(appState.group) && activeTab !== "expenses"}
          homeLabel="Back to Home"
          onHomeClick={handleGoHome}
        />

        {error ? (
          <div className="message-banner message-banner--error">{error}</div>
        ) : null}

        {!appState.group ? (
          <GroupSetup
            isSubmitting={groupSubmitting}
            onCreateGroup={handleCreateGroup}
          />
        ) : showGroupEditor ? (
          <GroupSetup
            isSubmitting={groupSubmitting}
            onCreateGroup={handleCreateGroup}
            initialGroupName={appState.group.name}
            initialMembers={appState.group.members.map((member) => member.name)}
            title="Create a new group or add members"
            stepLabel="Group Manager"
            submitLabel="Save new group"
            helperText="Saving this group replaces the current group and resets its expenses, balances, and settlements."
            onCancel={handleCloseGroupEditor}
          />
        ) : (
          <div className="dashboard-grid">
            <section className="main-column">
              <Overview
                group={appState.group}
                totals={appState.totals}
                settlements={appState.settlements}
                onManageGroup={handleOpenGroupEditor}
              />

              <ExpenseForm
                group={appState.group}
                isSubmitting={expenseSubmitting}
                onAddExpense={handleAddExpense}
              />

              <section className="panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Workspace Views</p>
                    <h2>Track every split clearly</h2>
                  </div>
                </div>

                <TabNav
                  activeTab={activeTab}
                  options={TAB_OPTIONS}
                  onChange={setActiveTab}
                />

                {activeTab === "expenses" ? (
                  <ExpensesTab expenses={appState.expenses} members={appState.group.members} />
                ) : null}

                {activeTab === "balances" ? (
                  <BalancesTab balances={appState.balances} />
                ) : null}

                {activeTab === "settlements" ? (
                  <SettlementsTab
                    settlements={appState.settlements}
                    updatingSettlementId={settlementUpdatingId}
                    onToggleSettlement={handleSettlementToggle}
                  />
                ) : null}
              </section>
            </section>

            <aside className="side-column">
              <InsightsPanel
                insights={insights}
                isLoading={insightsLoading}
                expenseCount={appState.expenses.length}
                onRefresh={loadInsights}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
