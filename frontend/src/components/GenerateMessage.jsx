import { useState } from 'react';
import '../styles/dashboard.css';

export default function GenerateMessage({ onMessageGenerated }) {
  const [form, setForm] = useState({
    target_name: '',
    target_role: '',
    linkedin_url: '',
    company: '',
    experiences: '',
    recent_post: '',
    education: '',
    other_notes: '',
    goal_prompt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.target_name || !form.target_role || !form.linkedin_url || !form.goal_prompt) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic LinkedIn URL validation
    if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(form.linkedin_url)) {
      setError('Please enter a valid LinkedIn URL');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { backendRequest } = await import('../api');
      const message = await backendRequest('/generate', 'POST', form);
      onMessageGenerated(message);
      
      // Reset form
      setForm({
        target_name: '',
        target_role: '',
        linkedin_url: '',
        company: '',
        experiences: '',
        recent_post: '',
        education: '',
        other_notes: '',
        goal_prompt: '',
      });
    } catch (err) {
      setError('Could not generate message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="generate-container">
      <div className="form-section">
        <h2 className="section-title">Create Cold Message</h2>
        <p className="section-subtitle">Fill in the details to generate a personalized message</p>

        {error && <div className="error-alert">{error}</div>}

        <div className="form-wrapper">
          <div className="form-row">
            <div className="input-group">
              <label className="label">Target Name *</label>
              <input
                name="target_name"
                placeholder="John Doe"
                className="input"
                value={form.target_name}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="label">Target Role *</label>
              <input
                name="target_role"
                placeholder="Product Manager"
                className="input"
                value={form.target_role}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">LinkedIn URL *</label>
            <input
              name="linkedin_url"
              placeholder="https://linkedin.com/in/johndoe"
              className="input"
              value={form.linkedin_url}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="label">Company</label>
            <input
              name="company"
              placeholder="Tech Corp"
              className="input"
              value={form.company}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="label">Experiences</label>
            <textarea
              name="experiences"
              placeholder="Previous roles, notable projects..."
              className="input textarea"
              rows={3}
              value={form.experiences}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="label">Recent Post</label>
            <textarea
              name="recent_post"
              placeholder="Summary of their latest LinkedIn activity..."
              className="input textarea"
              rows={3}
              value={form.recent_post}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="label">Education</label>
            <input
              name="education"
              placeholder="University, degree..."
              className="input"
              value={form.education}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="label">Other Notes</label>
            <textarea
              name="other_notes"
              placeholder="Shared interests, location, mutual connections..."
              className="input textarea"
              rows={2}
              value={form.other_notes}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="label">Message Goal *</label>
            <textarea
              name="goal_prompt"
              placeholder="e.g., I want to schedule a coffee chat to discuss product management in fintech..."
              className="input textarea"
              rows={3}
              value={form.goal_prompt}
              onChange={handleChange}
            />
          </div>

          <button 
            className={`primary-button ${loading ? 'button-disabled' : ''}`}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Generating...' : 'Generate Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
