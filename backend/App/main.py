from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as api_router

app = FastAPI()

origins = [
    "http://localhost:5173",                 # Vite dev
    "https://commectr-app.vercel.app",    #vercel url
]

# Middleware looks at whether to block or allow requests from different origins, so not everyone has access to my backend APIS
# Added CORS middleware
app.add_middleware(
    CORSMiddleware, #CORS middleware, Cross Origin Resource Sharing, meaninng it deals with CORS requests from the frontend, ie certain origins are not allowed to call the backend unless the CORS is configured to allow it
    allow_origins=origins, # allows all origins to call backend APIS (for development, will be changed later to only allow frontend origin)
    allow_credentials=False, #doesnt allow cookies/ auth headers to be sent from the frontend
    allow_methods=["*"], #allows all HTTP methods to be sent from those origins
    allow_headers=["*"], #allows any custom headers like Authorization, Content_Type etc in reqs
)

@app.get("/")
def root():
    return {"message": "Backend is running"}

#mounted my api routes (generate and history endpoints) under the /api prefix
app.include_router(api_router, prefix= "/api")
