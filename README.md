# Commectr

Commectr is a web app that helps students and early professionals generate **personalized cold outreach messages** for LinkedIn using AI.

Users copy key info from a person’s LinkedIn profile (name, role, URL, experiences, posts, etc.), describe their goal, and ColdConnect generates a tailored message ready to send.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Supabase JS
- **Backend:** FastAPI (Python)
- **Auth & DB:** Supabase (Postgres + RLS)
- **AI:** OpenAI Chat Completions API

## Core Features (MVP)

- Email/password signup & login (Supabase Auth)
- Form for target person:
  - Required: name, role, LinkedIn URL
  - Optional: company, experiences, posts, education, notes
- Goal prompt (what you want the message to do)
- AI-generated outreach message using OpenAI
- History of past contacts + messages

