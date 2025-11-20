import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import Request, HTTPException, status
from jose import JWTError, jwt

#this file is for handling
load_dotenv()

JWT_SECRET_KEY= os.getenv("SUPABASE_JWT_SECRET")
JWT_ALG= "HS256" #default alg used by supabase

#fails fast if secret key isnt set properly
if not JWT_SECRET_KEY:
    raise RuntimeError("SUPABASE_JWT_SECRET is not set in backend .env")

#reps the current authenticated user in the app
class CurrentUser:
    def __init__(self, id: str, email: Optional[str]):
        self.id = id
        self.email = email

#this funct takes a fastapi req and returns a CurrentUser obj if the user is authenticated, or raise a 401 error
def get_current_user(request: Request) -> CurrentUser:
    
    #reads autho header from incoming http req, if missing or it doesnt start with Bearer, it raises a 401 exception, ie not authorized because no valid token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "no token provided")
    
    token = auth_header.split(" ", 1)[1] #splits "Bearer <token>" into ["Bearer", "<token>"] and takes the second index ie [1]

        #uses the JWTKEY and JWTALG to decode the token string, and it verifies the signature and expiration, returns as a dict if valid
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALG], options={"verify_aud": False},)
    except JWTError as e:
        print("JWT decode error:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")
    
    user_id= payload.get("sub") #sub = subject ie the user id
    email= payload.get("email")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "invalid token payload")
    
    return CurrentUser(id=user_id, email=email)