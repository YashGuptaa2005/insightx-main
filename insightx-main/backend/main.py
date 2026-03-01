from contextlib import asynccontextmanager
import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from ai_handler import ask_insightx
from data_loader import get_summary
from query_engine import (
    get_failure_analysis,
    get_success_rate_by_segment,
    get_regional_analysis,
    get_transaction_trends
)

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
RENDER_URL = "https://insightx-main.onrender.com"  # 🔁 Replace with your actual Render URL

conversation_store = {}


# ─────────────────────────────────────────────
# Keep-Alive Ping Loop
# ─────────────────────────────────────────────
async def keep_alive():
    await asyncio.sleep(60)  # Wait for server to fully start
    async with httpx.AsyncClient() as client:
        while True:
            try:
                response = await client.get(f"{RENDER_URL}/")
                print(f"[Keep-Alive] Ping successful: {response.status_code}")
            except Exception as e:
                print(f"[Keep-Alive] Ping failed: {e}")
            await asyncio.sleep(4 * 60)  # Ping every 4 minutes


# ─────────────────────────────────────────────
# Lifespan: Preload Data + Start Ping Loop
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Preloading dataset into memory...")
    get_summary()  # Triggers _records cache in data_loader.py
    print("[Startup] Dataset preloaded and ready!")
    asyncio.create_task(keep_alive())  # Start keep-alive loop
    print("[Startup] Keep-alive loop started!")
    yield
    print("[Shutdown] Server shutting down...")


# ─────────────────────────────────────────────
# App Init
# ─────────────────────────────────────────────
app = FastAPI(
    title="InsightX API",
    description="AI-powered UPI Transaction Analytics for Leadership",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────
class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"

class QuestionResponse(BaseModel):
    answer: str
    session_id: str

class ClearSessionRequest(BaseModel):
    session_id: Optional[str] = "default"


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "InsightX API is running", "status": "ok"}


@app.get("/api/summary")
def summary():
    return get_summary()


@app.post("/api/ask", response_model=QuestionResponse)
def ask_question(request: QuestionRequest):
    try:
        session_id = request.session_id or "default"
        history = conversation_store.get(session_id, [])

        answer, updated_history = ask_insightx(request.question, history)

        conversation_store[session_id] = updated_history

        return QuestionResponse(answer=answer, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/clear")
def clear_session(request: ClearSessionRequest):
    session_id = request.session_id or "default"
    if session_id in conversation_store:
        del conversation_store[session_id]
    return {"message": f"Session {session_id} cleared"}


@app.get("/api/data/failures")
def failures(peak_only: bool = False):
    return get_failure_analysis(peak_only=peak_only)


@app.get("/api/data/segments")
def segments(transaction_type: Optional[str] = None, min_amount: Optional[float] = None):
    return get_success_rate_by_segment(transaction_type=transaction_type, min_amount=min_amount)


@app.get("/api/data/regional")
def regional(transaction_type: Optional[str] = None, weekend_only: bool = False):
    return get_regional_analysis(transaction_type=transaction_type, weekend_only=weekend_only)


@app.get("/api/data/trends")
def trends():
    return get_transaction_trends()


# ─────────────────────────────────────────────
# Local Dev Entry Point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)