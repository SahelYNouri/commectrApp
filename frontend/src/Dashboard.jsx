import { useEffect, useState } from "react";
import { backendRequest } from "./api";

//dashboard shown only when user is logged in
//on logout function is passed from app.jsx to clear session
export default function Dashboard({ onLogout }) {
    //fields to be filled in to linkedin person
  const [form, setForm] = useState({
    target_name: "",
    target_role: "",
    linkedin_url: "",
    company: "",
    experiences: "",
    recent_post: "",
    education: "",
    other_notes: "",
    goal_prompt: "",
  });

  const [loading, setLoading] = useState(false);//loading flag while generateing msg
  const [error, setError] = useState("");//err msg
  const [generated, setGenerated] = useState(null); //newest msg
  const [history, setHistory] = useState([]);//all previous msgs

  //loads msg history from backend api
  async function loadHistory() {
    try {
      const data = await backendRequest("/history", "GET");
      setHistory(data); //store history in state
    } catch (err) {
      console.error(err);
    }
  }

  //run load hsitory on dashboard mount
  useEffect(() => {
    loadHistory();
  }, []);

  //handles changs in form input fields
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  //handles form submission to generate new cold msg
  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    //calls Post /generate on backend api with form data
    try {
      const data = await backendRequest("/generate", "POST", form);
      setGenerated(data); //data is newly created MessageHistoryItem from backend
      setHistory((prev) => [data, ...prev]);//prepend new msg at top of history list
    } catch (err) {
      console.error(err);
      setError("Could not generate message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyMessage() {
    if (!generated) return;
    navigator.clipboard.writeText(generated.generated_message);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold">ColdConnect Dashboard</h1>
        <button
          onClick={onLogout}
          className="text-sm bg-slate-800 text-white px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Create a new cold message</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="target_name"
                placeholder="Target's name *"
                className="border rounded-lg px-3 py-2"
                value={form.target_name}
                onChange={handleChange}
                required
              />
              <input
                name="target_role"
                placeholder="Target's role *"
                className="border rounded-lg px-3 py-2"
                value={form.target_role}
                onChange={handleChange}
                required
              />
            </div>
            <input
              name="linkedin_url"
              placeholder="LinkedIn URL *"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.linkedin_url}
              onChange={handleChange}
              required
            />
            <input
              name="company"
              placeholder="Company (optional)"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.company}
              onChange={handleChange}
            />
            <textarea
              name="experiences"
              placeholder="Experiences from their profile (optional)"
              className="border rounded-lg px-3 py-2 w-full"
              rows={2}
              value={form.experiences}
              onChange={handleChange}
            />
            <textarea
              name="recent_post"
              placeholder="Recent post text / summary (optional)"
              className="border rounded-lg px-3 py-2 w-full"
              rows={2}
              value={form.recent_post}
              onChange={handleChange}
            />
            <textarea
              name="education"
              placeholder="Education (optional)"
              className="border rounded-lg px-3 py-2 w-full"
              rows={2}
              value={form.education}
              onChange={handleChange}
            />
            <textarea
              name="other_notes"
              placeholder="Other notes (shared interests, location, etc.)"
              className="border rounded-lg px-3 py-2 w-full"
              rows={2}
              value={form.other_notes}
              onChange={handleChange}
            />
            <textarea
              name="goal_prompt"
              placeholder="Tell the AI what you want this message to do *"
              className="border rounded-lg px-3 py-2 w-full"
              rows={3}
              value={form.goal_prompt}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate message"}
            </button>
          </form>
        </section>

        {/* MESSAGE + HISTORY */}
        <section className="space-y-6">
          {/* Latest message */}
          <div className="bg-white p-6 rounded-xl shadow min-h-[180px]">
            <h2 className="text-lg font-semibold mb-3">Latest generated message</h2>
            {!generated ? (
              <p className="text-sm text-slate-500">
                Generate a message to see it here.
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-2">
                  To: {generated.target_name} – {generated.target_role}
                </p>
                <p className="whitespace-pre-line text-sm border rounded-lg px-3 py-2 mb-3">
                  {generated.generated_message}
                </p>
                <button
                  onClick={copyMessage}
                  className="text-sm bg-slate-800 text-white px-3 py-1 rounded-lg"
                >
                  Copy message
                </button>
              </>
            )}
          </div>

          {/* History */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium">
                          {item.target_name} – {item.target_role}
                        </div>
                        <a
                          href={item.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 text-xs"
                        >
                          LinkedIn profile
                        </a>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <details className="mt-1 text-xs">
                      <summary className="cursor-pointer text-blue-600">
                        View message
                      </summary>
                      <p className="mt-1 whitespace-pre-line">
                        {item.generated_message}
                      </p>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
