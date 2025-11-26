import { useState, useEffect } from 'react';
import GenerateMessage from './GenerateMessage';
import MessageResult from './MessageResult';
import History from './History';
import Checklist from './Checklist';
import Profile from './Profile';
import '../styles/dashboard.css';
import {backendRequest} from '../api';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [history, setHistory] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
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

//generic function to toggle contacted/replied status
  async function toggleStatus(messageId, field) {

    //find the message and its current contacted value
  const msg = history.find((item) => item.id === messageId);
  if (!msg) return;

  if (updatingId === messageId) return; //prevents multiple rapid clicks

  const newValue = !msg[field];

  setUpdatingId(messageId);

    setHistory((prev) =>
      prev.map((item) =>
        item.id === messageId ? { ...item, [field]: newValue } : item
      )
    );
 
    try {
      const body = { [field]: newValue }; //{ contacted: true } or { replied: false }

      // 2) Tell the backend to update status_sent on the contact
      await backendRequest(
        `/contacts/${msg.contact_id}/status`,
        'PATCH',
        body
      );
    } catch (err) {
      console.error('Failed to update contact status', err);
      // 3) Roll back UI if backend failed
      setHistory((prev) =>
        prev.map((item) =>
          item.id === messageId ? { ...item, [field]: msg[field] } : item
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-small">CR</div>
            <h1 className="header-title">LinqDm</h1>
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
          <Checklist 
            history={history} 
            onToggleStatus={toggleStatus}
            updatingId={updatingId}
          />
        )}
        {activeTab === 'profile' && <Profile history={history} />}
      </main>
    </div>
  );
}