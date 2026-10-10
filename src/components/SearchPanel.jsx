import { Search, X } from "lucide-react";
import { useState } from "react";
import "./SearchPanel.css";

function SearchPanel({ onClose, onSearch, isClosing = false }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <div
      className={`search-panel ${isClosing ? "search-panel-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search tours"
    >
      <div className="search-panel-art" aria-hidden="true">
        <img src="/2439302c-a15f-4b73-b4b1-4333339353e4.svg" alt="" />
      </div>

      <div className="search-panel-top">
        <div className="search-panel-brand" aria-label="Holiday Planners">
          Holiday <span className="search-panel-brand-highlight">P</span>lanners
        </div>

        <button
          className="search-panel-close"
          type="button"
          onClick={onClose}
          aria-label="Close search"
        >
          <X />
        </button>
      </div>

      <div className="search-panel-content">
        <form className="search-panel-form" onSubmit={handleSubmit}>
          <label htmlFor="navbar-tour-search">Find your next adventure</label>
          <div className="search-panel-input-wrap">
            <Search aria-hidden="true" />
            <input
              id="navbar-tour-search"
              type="search"
              placeholder="Search tours or destinations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
            <button type="submit">SEARCH</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchPanel;
