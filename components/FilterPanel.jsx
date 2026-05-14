export default function FilterPanel({
  groups,
  selectedGroups,
  searchQuery,
  isLoaded,
  statusText,
  isOfficial,
  onSearchChange,
  onToggleGroup,
  onReset,
  onQuickRun,
  onJump297,
}) {
  return (
    <section className="panel">
      <div className="shortcut-box">
        <div>
          <h3>Quick Test Shortcuts</h3>
          <p>Apply predefined filters to verify specific matchups instantly.</p>
        </div>
        <div className="button-row">
          <button onClick={onQuickRun}>Test: 1L vs 3I + A,B,G</button>
          <button onClick={onJump297}>Jump to #297</button>
        </div>
      </div>

      <label htmlFor="searchInput" className="section-title">Search Matchups</label>
      <input
        id="searchInput"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={!isLoaded}
        placeholder={isLoaded ? "E.g., type '1L vs 3I' or '#297'..." : 'Connecting to Wikipedia API...'}
      />

      <div className="groups">
        <span className="section-title">Must Include Advancing Group(s):</span>
        <div className="group-grid">
          {groups.map((group) => (
            <label key={group} className="checkbox-chip">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={() => onToggleGroup(group)}
                disabled={!isLoaded}
              />
              <span>{group}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="status-row">
        <span className={`status-pill ${isOfficial ? 'ok' : 'warn'}`}>{statusText}</span>
        <button className="link-btn" onClick={onReset}>Reset Filters</button>
      </div>
    </section>
  );
}
