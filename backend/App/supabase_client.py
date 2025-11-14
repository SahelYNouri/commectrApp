import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SB_URL= os.getenv("SUPABASE_URL")
#public role key
SB_KEY= os.getenv("SUPABASE_API_KEY")
supabase: Client = create_client(SB_URL, SB_KEY)

