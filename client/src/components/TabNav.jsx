function TabNav({ activeTab, options, onChange }) {
  return (
    <div className="tab-row" role="tablist" aria-label="Expense views">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          className={option.id === activeTab ? "tab-button tab-button--active" : "tab-button"}
          aria-selected={option.id === activeTab}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default TabNav;

