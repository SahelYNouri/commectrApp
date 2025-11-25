import '../styles/dashboard.css';

export default function Profile({ history }) {
  const totalMessages = history.length;
  const contacted = history.filter((h) => h.contacted).length;
  const pending = history.filter((h) => h.contacted && !h.replied).length;
  const replied= history.filter((h) => h.replied).length;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="section-title">Your Profile</h2>
        <p className="section-subtitle">Overview of your outreach activity</p>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{totalMessages}</div>
            <div className="stat-label">Messages Generated</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{contacted}</div>
            <div className="stat-label">Contacted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{replied}</div>
            <div className="stat-label">Replied</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="profile-info">
          <h3 className="profile-section-title">Tips for Success</h3>
          <div className="tips-list">
            <div className="tip-item">• Personalize each message based on their recent activity</div>
            <div className="tip-item">• Follow up within 48 hours if no response</div>
            <div className="tip-item">• Keep messages concise and focused on value</div>
            <div className="tip-item">• Always include a clear call-to-action</div>
          </div>
        </div>
      </div>
    </div>
  );
}