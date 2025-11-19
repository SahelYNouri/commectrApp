import { useState, useEffect } from 'react';
import GenerateMessage from './GenerateMessage';
import MessageResult from './MessageResult';
import History from './History';
import Checklist from './Checklist';
import Profile from './Profile';
import '../styles/dashboard.css';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [history, setHistory] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { backendRequest } = await import('../api');
      const data = await backendRequest('/history', 'GET');
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  function handleMessageGenerated(message) {
    setLatestMessage(message);
    setHistory((prev) => [message, ...prev]);
    setActiveTab('result');
  }

  function toggleContacted(id) {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, contacted: !item.contacted } : item
      )
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-small">CC</div>
            <h1 className="header-title">ColdConnect</h1>
          </div>
          <nav className="nav">
            <button
              className={`nav-button ${activeTab === 'generate' ? 'nav-button-active' : ''}`}
              onClick={() => setActiveTab('generate')}
            >
              Generate
            </button>
            <button
              className={`nav-button ${activeTab === 'history' ? 'nav-button-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button
              className={`nav-button ${activeTab === 'checklist' ? 'nav-button-active' : ''}`}
              onClick={() => setActiveTab('checklist')}
            >
              Checklist
            </button>
            <button
              className={`nav-button ${activeTab === 'profile' ? 'nav-button-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </nav>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        {activeTab === 'generate' && (
          <GenerateMessage onMessageGenerated={handleMessageGenerated} />
        )}
        {activeTab === 'result' && latestMessage && (
          <MessageResult
            message={latestMessage}
            onGenerateAnother={() => setActiveTab('generate')}
          />
        )}
        {activeTab === 'history' && <History history={history} />}
        {activeTab === 'checklist' && (
          <Checklist history={history} onToggleContacted={toggleContacted} />
        )}
        {activeTab === 'profile' && <Profile history={history} />}
      </main>
    </div>
  );
}