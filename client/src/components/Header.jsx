function Header({ showHomeAction, homeLabel, onHomeClick }) {
  return (
    <header className="hero panel">
      <div className="hero__top">
        <div>
          <p className="eyebrow">Smart Expense Splitter</p>
          <h1>Split shared costs without the spreadsheet chaos.</h1>
          <p className="hero-copy">
            Create a group, add expenses, and let the app calculate who owes whom
            in real time.
          </p>
        </div>

        {showHomeAction ? (
          <button className="hero__nav-button" type="button" onClick={onHomeClick}>
            {homeLabel}
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
