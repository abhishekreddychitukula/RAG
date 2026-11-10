from dotenv import load_dotenv
load_dotenv (override=True)  # Load environment variables from .env file
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import upload_router
from app.routes.documents import documents_router

from app.routes.chat import chat_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
