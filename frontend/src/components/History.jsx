import '../styles/dashboard.css';

export default function History({ history }) {
  return (
    <div className="history-container">
      <h2 className="section-title">Message History</h2>
      <p className="section-subtitle">All your generated messages</p>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-text">No messages yet</p>
          <p className="empty-subtext">Generate your first message to get started</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-header">
                <div className="history-info">
                  <div className="avatar-small">{item.target_name[0]}</div>
                  <div>
                    <h3 className="history-name">{item.target_name}</h3>
                    <p className="history-role">
                      {item.target_role}
                      {item.company && ` • ${item.company}`}
                    </p>
                  </div>
                </div>
                <span className="history-date">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <details className="history-details">
                <summary className="history-summary">View message</summary>
                <pre className="history-message">{item.generated_message}</pre>
              </details>

              <a
                href={item.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="history-link"
              >
                View LinkedIn Profile →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}