import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Prefer the service role key for server-side operations when available.
# Fall back to the anon key if a service key isn't present (not recommended for production).
SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
if not SB_URL or not SB_KEY:
	raise RuntimeError("SUPABASE_URL or SUPABASE key is not set in environment")

supabase: Client = create_client(SB_URL, SB_KEY)

