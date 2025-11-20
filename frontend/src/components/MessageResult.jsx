import '../styles/dashboard.css';

export default function MessageResult({ message, onGenerateAnother }) {
  function copyMessage() {
    navigator.clipboard.writeText(message.generated_message);
    alert('Message copied to clipboard!');
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
          <h2 className="section-title">Generated Message</h2>
          <button className="secondary-button" onClick={onGenerateAnother}>
            Generate Another
          </button>
        </div>

        <div className="recipient-info">
          <div className="avatar">{message.target_name[0]}</div>
          <div>
            <h3 className="recipient-name">{message.target_name}</h3>
            <p className="recipient-role">
              {message.target_role}
              {message.company && ` • ${message.company}`}
            </p>
          </div>
        </div>

        <div className="message-box">
          <pre className="message-text">{message.generated_message}</pre>
        </div>

        <div className="action-buttons">
          <button className="primary-button" onClick={copyMessage}>
            📋 Copy Message
          </button>
          <a
            href={message.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="linkedin-button"
          >
            🔗 Open LinkedIn Profile
          </a>
        </div>
      </div>
    </div>
  );
}
