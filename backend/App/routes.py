from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List
from .supabase_client import supabase
from .auth_utils import get_current_user
from .openai_client import generate_cold_message

router = APIRouter()

#API schema for the generate request body
class GenerateRequest(BaseModel):
    target_name: str
    target_role: str
    target_company: str
    linkedin_url: HttpUrl
    company: str | None = None
    experiences: str | None= None
    recent_post: str | None= None
    education: str | None=None
    other_notes: str | None = None
    goal_prompt: str

#Api schema for a message history item
class MessageHistoryItem(BaseModel):
    id: str
    contact_id: str
    target_name: str
    target_role: str
    linkedin_url: HttpUrl
    goal_prompt: str
    generated_message: str
    created_at: str

def ensure_app_user(user_id: str, email: str | None):
    
    #checks is theres existing app user with this user id
    res = supabase.table("app_users"). select("*").eq("auth_uid", user_id).single().execute()
    
    if not res.error and res.data:
        return res.data
    
    #if the row doesnt exist, ie new user, then we have to create a new row in app_users
    new_row= {
        "auth_uid": user_id,
        "email": email or "",
    }

    created = supabase.table("app_users").insert(new_row).select("*").single().execute()
    if created.error:
        raise HTTPException(status_code= 500, detail= "Failed to create app user")
    return created.data

#generate message endpoint
@router.post("/generate", response_model= MessageHistoryItem)

#payload- autmatically parsed from json body into a GeneateRequest object
#request- fastapi request object, needed to read auth header
async def generate_message(payload: GenerateRequest, request: Request):
    
    #read the auth header and returns the current user, then calls above function to see if app user exists or not in the db
    current_user = get_current_user(request)
    app_user = ensure_app_user(current_user.id, current_user.email)
    app_user_id = app_user["id"] #set as the primary key of the app user row

    #First, it builds a dict with fields matching the contacts table
    contact_data= {
        "user_id": app_user_id,    
        "target_name": payload.target_name,
        "target_role": payload.target_role,
        "linkedin_url": str(payload.linkedin_url),
        "company": payload.company,
        "experiences": payload.experiences,
        "recent_post": payload.recent_post,
        "education": payload.education,
        "other_notes": payload.other_notes,
        }
    
    #insert then select newly created contact row
    contact_res = supabase.table("contacts").insert(contact_data).select("*").single().execute()
    if contact_res.error:
        raise HTTPException(status_code= 500, detail= "failed to create contact")
    contact = contact_res.data

    #then, generates openai message using generate_cold_message function
    try:
        message_text = generate_cold_message(contact_data, payload.goal_prompt)
    except Exception:
        raise HTTPException(status_code= 500, detail= "failed to generate message")
    
    #save message, to be inserted into messages table
    msg_data= {
        "user_id": app_user_id,
        "contact_id": contact["id"],
        "goal_prompt": payload.goal_prompt,
        "generated_message": message_text,
    }

    msg_res = supabase.table("messsages").insert(msg_data).select("*").single().execute()
    if msg_res.error:
        raise HTTPException(status_code= 500, detail= "failed to save message")
    msg= msg_res.data
    
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
    res = (
        supabase.table("messages")
        .select(
            "id, contact_id, goal_prompt, generated_message, created_at, "
            "contacts (target_name, target_role, linkedin_url)"
        )
        .eq("user_id", app_user_id) #returns msgs that only belong to the user
        .order("created_at", desc=True) #returns msgs in order from newest first
        .execute()
    )
    if res.error:
        raise HTTPException(status_code= 500, detail= "failed to fetch message history")
    
    #building list of message history items to return, extracts row["contacts"] into a simple variable 'contact for readability
    items= []
    for row in res.data:
        contact = row["contacts"]
        items.append({
            "id": row["id"],
            "contact_id": row["contact_id"],
            "target_name": contact["target_name"],
            "target_role": contact["target_role"],
            "linkedin_url": contact["linkedin_url"],
            "goal_prompt": row["goal_prompt"],
            "generated_message": row["generated_message"],
            "created_at": row["created_at"],
        })
    
    return items


