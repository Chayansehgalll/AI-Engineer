from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ai_assistant import ask_ai, stream_ai


app = FastAPI()


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


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {
        "message": "Chayan AI Assistant API is running"
    }


@app.post("/chat")
def chat(request: ChatRequest):
    answer = ask_ai(request.message)

    return {
        "response": answer
    }


@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    return StreamingResponse(
        stream_ai(request.message),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
