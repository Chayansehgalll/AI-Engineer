from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_assistant import ask_ai


# -------------------------
# FastAPI
# -------------------------

app = FastAPI()


# -------------------------
# CORS
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-engineer-sooty.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Request model
# -------------------------

class ChatRequest(BaseModel):
    message: str


# -------------------------
# Chat endpoint
# -------------------------

@app.post("/chat")
async def chat(request: ChatRequest):

    answer = ask_ai(request.message)

    return {
        "response": answer
    }


# -------------------------
# Health check
# -------------------------

@app.get("/")
def root():
    return {
        "message": "Chayan AI Assistant API is running"
    }
