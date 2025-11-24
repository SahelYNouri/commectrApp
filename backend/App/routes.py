from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field, HttpUrl
from typing import List
from .supabase_client import supabase
from .auth_utils import get_current_user
from .openai_client import generate_cold_message

router = APIRouter()

#API schema for the generate request body
#added input validation using string length constraints
class GenerateRequest(BaseModel):
    target_name: str = Field(max_length=100)
    target_role: str = Field(max_length=100)
    linkedin_url: HttpUrl
    company: str | None = Field(default=None, max_length=200)
    experiences: str | None= Field(default=None, max_length=2000)
    recent_post: str | None= Field(default=None, max_length=2000)
    education: str | None= Field(default=None, max_length=1000)
    other_notes: str | None = Field(default=None, max_length=1000)
    goal_prompt: str = Field(max_length=1000)

#Api schema for a message history item
class MessageHistoryItem(BaseModel):
    id: str
    contact_id: str
    target_name: str
    target_role: str
    linkedin_url: str
    goal_prompt: str
    generated_message: str
    created_at: str

def ensure_app_user(user_id: str, email: str | None):
    
    #checks is theres existing app user with this user id
    try:
        res = (
            supabase.from_("app_users")
            .select("*")
            .eq("auth_uid", user_id)
            .execute()
        )
    except Exception:
        # include exception text for local debugging
        import traceback
        err = traceback.format_exc()
        print("Failed to fetch app user:", err)
        raise HTTPException(status_code=500, detail=f"Failed to fetch app user: {err}")

    rows = res.data or []  # Supabase returns a list of rows

    # If we already have a row, return the first one
    if rows:
        return rows[0]
    
    #if the row doesnt exist, ie new user, then we have to create a new row in app_users
    new_row= {
        "auth_uid": user_id,
        "email": email or "",
    }

    # NOTE: no .select("*") here – your client doesn't support it on insert
    try:
        created = (
            supabase.from_("app_users")
            .insert(new_row)
            .execute()
        )
    except Exception:
        import traceback
        err = traceback.format_exc()
        print("Failed to create app user:", err)
        raise HTTPException(status_code=500, detail=f"Failed to create app user: {err}")

    data = created.data
    # handle both list and single-row cases
    if isinstance(data, list):
        return data[0]
    return data

#generate message endpoint
@router.post("/generate", response_model= MessageHistoryItem)

#payload- autmatically parsed from json body into a GeneateRequest object
#request- fastapi request object, needed to read auth header
async def generate_message(payload: GenerateRequest, request: Request):

    """
    1) Ensure app_user exists
    2) Insert contact
    3) Call OpenAI to generate message
    4) Insert message
    5) Return a MessageHistoryItem object
    """
    
    #read the auth header and returns the current user, then calls above function to see if app user exists or not in the db
    current_user = get_current_user(request)
    app_user = ensure_app_user(current_user.id, current_user.email)
    app_user_id = app_user["id"] #set as the primary key of the app user row

    #First, it builds a dict with fields matching the contacts table
    contact_data= {
        "user_id": app_user_id,    
        "target_name": payload.target_name,
        "target_role": payload.target_role,
        "linkedin_url": payload.linkedin_url,
        "company": payload.company,
        "experiences": payload.experiences,
        "recent_post": payload.recent_post,
        "education": payload.education,
        "other_notes": payload.other_notes,
        }

    try:
        contact_res = (
            supabase
            .from_("contacts")
            .insert(contact_data)
            .execute()      #took out the select and single
        )
    except Exception:
        import traceback
        err = traceback.format_exc()
        print("Failed to create contact:", err)
        raise HTTPException(status_code=500, detail="failed to create contact")

    
    contact_raw = contact_res.data
    contact = contact_raw[0] if isinstance(contact_raw, list) else contact_raw

    #then, generates openai message using generate_cold_message function
    try:
        message_text = generate_cold_message(contact_data, payload.goal_prompt)
    except Exception:
        import traceback
        err = traceback.format_exc()
        print("OpenAI error:", err)
        raise HTTPException(status_code= 500, detail= "failed to generate message")
    
    #save message, to be inserted into messages table
    msg_data= {
        "user_id": app_user_id,
        "contact_id": contact["id"],
        "goal_prompt": payload.goal_prompt,
        "generated_message": message_text,
    }

    try:
        msg_res = (
            supabase
            .from_("messages")
            .insert(msg_data)
            .execute()      #again, just .execute()
        )
    except Exception:
        import traceback
        err = traceback.format_exc()
        print("Failed to save message:", err)
        raise HTTPException(status_code=500, detail="failed to save message")

    msg_raw = msg_res.data
    msg = msg_raw[0] if isinstance(msg_raw, list) else msg_raw
    
    #build a dict that matches messagehistoryitem schema to return
    return{
        "id": msg["id"],
        "contact_id": msg["contact_id"],
        "target_name": contact["target_name"],
        "target_role": contact["target_role"],
        "linkedin_url": contact["linkedin_url"],
        "goal_prompt": msg["goal_prompt"],
        "generated_message": msg["generated_message"],
        "created_at": msg["created_at"],
    }

#get request to fetch message history for the current user
@router.get("/history", response_model= List[MessageHistoryItem])
async def history(request: Request):

    #user auth again
    current_user = get_current_user(request)
    app_user = ensure_app_user(current_user.id, current_user.email)
    app_user_id = app_user["id"]

    #queries the messages table and returns fields, also uses foreign key relationship to fetch additional fields from contacts table
    try: 
        res = (
            supabase
            .from_("messages")
            .select(
                "id, contact_id, goal_prompt, generated_message, created_at, "
                "contacts (target_name, target_role, linkedin_url)"
            )
            .eq("user_id", app_user_id) #returns msgs that only belong to the user
            .order("created_at", desc=True) #returns msgs in order from newest first
            .execute()
        )
    except Exception:
        import traceback
        err = traceback.format_exc()
        print("Failed to fetch message history:", err)
        raise HTTPException(status_code= 500, detail= "failed to fetch message history")
    
    #building list of message history items to return, extracts row["contacts"] into a simple variable 'contact for readability
    items: list[MessageHistoryItem] = []

    for row in res.data or []:
        contact = row["contacts"]
        items.append(
            {
                "id": row["id"],
                "contact_id": row["contact_id"],
                "target_name": contact["target_name"],
                "target_role": contact["target_role"],
                "linkedin_url": contact["linkedin_url"],
                "goal_prompt": row["goal_prompt"],
                "generated_message": row["generated_message"],
                "created_at": row["created_at"],
            }
        )
    
    return items


