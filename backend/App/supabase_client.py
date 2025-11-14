import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SB_URL= os.getenv("SUPABASE_URL")
SB_KEY= os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SB_URL, SB_KEY)

