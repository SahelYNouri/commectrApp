# Commectr

_AI-powered LinkedIn outreach for students and early-career professionals._

Commectr helps you turn messy LinkedIn profile notes into clean, personalized cold DMs you can actually send.

You paste:

- Who you’re messaging (name, role, LinkedIn URL)
- Context (their company, posts, experiences, etc.)
- Your goal (coffee chat, internship, portfolio feedback…)

…and Commectr generates a tailored message, saves it to your history, and lets you track who you’ve contacted and who replied.

> 💻 **Live app**: _Hosted on Vercel_  
> (`https://commectr-app.vercel.app`)

---

## ✨ Features

**🔐 Auth & onboarding**

- Email/password signup & login via **Supabase Auth**
- Authenticated API calls using the Supabase JWT  
- Backend enforces per-user isolation with **Row Level Security (RLS)**

**🤖 AI-generated outreach**

- Simple form for target details:
  - **Required:** name, role, LinkedIn URL  
  - **Optional:** company, experiences, recent post, education, other notes
- Custom **goal prompt** (e.g. _“Ask for a quick intro call about their work at Cove”_)
- Backend calls **OpenAI** to generate a personalized cold DM ready to paste into LinkedIn

**🕓 Message history & checklist**

- Full **history** of previously generated messages
- Each item shows:
  - Target name, role, LinkedIn link
  - Goal / prompt
  - Generated message
  - Created timestamp
- **Checklist view** with two toggles:
  - `Contacted` – you actually messaged them
  - `Replied` – they responded
- Status is persisted in Supabase so it survives refreshes / new sessions

**🧱 Simple but real-world backend**

- FastAPI backend with:
  - `/api/generate` – create contact + message, call OpenAI, save to DB
  - `/api/history` – fetch per-user message history with joined contact info
  - `/api/contacts/{id}/status` – update `contacted` / `replied` flags
- **Basic rate limiting** on `/generate`  
  → limits how many messages per minute a user can generate (protects OpenAI & app)

**🎨 UI & UX**

- Clean, dashboard-style layout designed around 4 tabs:
  - **Generate** – main form to create messages
  - **Result** – shows the latest AI message, with copy & “open in LinkedIn” actions
  - **History** – collapsible list of past messages
  - **Checklist** – outreach tracker (contacted / replied)
  - **Profile** – lightweight analytics (messages, contacted, replied, pending)
- Custom **logo + favicon** and dark, STEM-friendly color theme

---

## 🧱 Tech Stack

**Frontend**

- **React** (Vite)
- CSS modules / custom styles (`dashboard.css`, `auth.css`)
- Supabase JS client for auth/session

**Backend**

- **FastAPI** (Python)
- Supabase Python client
- OpenAI Chat Completions API
- Deployed on **Render**

**Auth & Database**

- **Supabase**
  - Postgres database
  - Supabase Auth (email/password)
  - Row Level Security (RLS) on all user-scoped tables

**Deployment**

- **Frontend:** Vercel (static Vite build)
- **Backend:** Render web service (`uvicorn App.main:app`)

---

## 🏗️ Architecture Overview

**High-level flow**

1. User signs up / logs in via Supabase.
2. Frontend grabs the Supabase session (JWT) and stores it in memory.
3. When generating a message:
   - Frontend calls `POST /api/generate` with:
     - Target info
     - Goal prompt
     - Supabase JWT in the `Authorization: Bearer <token>` header
4. Backend:
   - Verifies the JWT with `get_current_user`.
   - Ensures an `app_users` row for that auth user exists.
   - Inserts a row into `contacts`.
   - Calls OpenAI with a structured prompt built from the contact + goal.
   - Inserts the generated text into `messages`.
   - Returns a **MessageHistoryItem** to the frontend.
5. History + checklist:
   - Frontend calls `GET /api/history`.
   - Backend joins `messages` + `contacts` (via foreign key) and returns:
     - Message metadata
     - Contact info
     - `status_sent` → `contacted`
     - `status_replied` → `replied`
6. Toggling `Contacted` / `Replied`:
   - Frontend calls `PATCH /api/contacts/{id}/status` with `{ contacted, replied }`.
   - Backend updates the `contacts` table, scoped to the current user.

---

## 🔒 Security & Reliability Touches

Even as a student project, Commectr includes a few “grown-up” practices:

- **Row Level Security (RLS)**  
  Every user only sees their own `app_users`, `contacts`, and `messages` rows.

- **Backend-verified auth**  
  FastAPI validates the Supabase JWT on every request; there is no “public” generate endpoint.

- **Basic rate limiting**  
  In-memory sliding window to limit `/generate` calls per user per minute.

- **CORS configuration**  
  Backend only allows:
  - `http://localhost:5173` (dev)
  - Your Vercel domain (prod)

This keeps the API usable from your app while blocking random third-party sites.

---

## 🚀 Using the Live App

You don’t need to clone or run anything locally.

1. **Open the live app**  
   _(Add your Vercel link here, e.g. `https://commectr-app.vercel.app`)_  
2. **Create an account** with your email and password.
3. Go to **Generate**, fill in the target info and your goal, and click **Generate**.
4. Copy the message and paste it into a LinkedIn DM.
5. Mark the contact as **Contacted** and later **Replied** in the **Checklist** tab.
6. Keep track of your outreach progress in the **Profile** view.

---

## 🧠 What I Learned Building Commectr

This project was a way to practice building a small but end-to-end product:

- Designing a **real database schema** with RLS in Supabase.
- Wiring up **JWT-based auth** from frontend → backend → database.
- Building a clean **React dashboard UI** with multiple views and shared state.
- Working with **OpenAI APIs** to generate structured, useful content.
- Deploying a **FastAPI** backend on Render and a **Vite** frontend on Vercel.
- Handling real-world issues like:
  - CORS
  - Env vars in prod
  - Rate limiting
  - Persisted per-user state (contacted / replied)

---

## 📬 Contact

If you’d like to chat about the app, the stack, or working together:

- **GitHub:** [`@SahelYNouri`](https://github.com/SahelYNouri)
- **LinkedIn:** _[`Sahel Nouri`](https://www.linkedin.com/in/sahel-nouri-9696b1260/)_

---

_Thanks for checking out Commectr 💬_  
Helping students and early professionals send fewer awkward DMs—and more intentional ones.
