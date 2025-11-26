import "../styles/dashboard.css";

export default function Checklist({ history, onToggleStatus, updatingId }) {
  
  return (
    <div className="checklist-container">
      <h2 className="section-title">Outreach Checklist</h2>
      <p className="section-subtitle">
        Track who you've contacted and who replied
      </p>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p className="empty-text">No contacts yet</p>
          <p className="empty-subtext">Generate a message to start tracking</p>
        </div>
      ) : (
        <div className="checklist-list">
          {history.map((item) => (
            <div key={item.id} className="checklist-item">
              {/* LEFT: contact + reply toggles */}
              <div className="checklist-toggles">
                {/* CONTACTED TOGGLE */}
                <button
                  className={`checkbox ${item.contacted ? "checkbox-checked" : ""}`}
                  onClick={() => onToggleStatus(item.id, "contacted")}
                  disabled={updatingId === item.id}
                >
                  {item.contacted && "✓"}
                </button>

                {/* REPLIED TOGGLE */}
                <button
                  className={`checkbox replied-checkbox ${
                    item.replied ? "checkbox-checked" : ""
                  }`}
                  onClick={() => onToggleStatus(item.id, "replied")}
                  disabled= {updatingId === item.id}
                >
                  {item.replied && "↩"}
                </button>
              </div>

              {/* MIDDLE: name + role */}
              <div className="checklist-info">
                <h3
                  className={`checklist-name ${
                    item.contacted ? "checklist-name-completed" : ""
                  }`}
                >
                  {item.target_name}
                </h3>
                <p className="checklist-role">
                  {item.target_role} • {item.company || "No company"}
                </p>
              </div>

              {/* RIGHT: LinkedIn link */}
              <a
                href={item.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="checklist-link"
              >
                LinkedIn →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
