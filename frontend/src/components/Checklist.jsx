import '../styles/dashboard.css';

export default function Checklist({ history, onToggleContacted }) {
  return (
    <div className="checklist-container">
      <h2 className="section-title">Outreach Checklist</h2>
      <p className="section-subtitle">Track who you've contacted</p>

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
              <button
                className={`checkbox ${item.contacted ? 'checkbox-checked' : ''}`}
                onClick={() => onToggleContacted(item.id)}
              >
                {item.contacted && '✓'}
              </button>
              <div className="checklist-info">
                <h3
                  className={`checklist-name ${
                    item.contacted ? 'checklist-name-completed' : ''
                  }`}
                >
                  {item.target_name}
                </h3>
                <p className="checklist-role">
                  {item.target_role} • {item.company || 'No company'}
                </p>
              </div>
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