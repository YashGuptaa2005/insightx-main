from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from ai_handler import ask_insightx
from data_loader import get_summary
from query_engine import (
    get_failure_analysis,
    get_success_rate_by_segment,
    get_regional_analysis,
    get_transaction_trends
)

app = FastAPI(
    title="InsightX API",
    description="AI-powered UPI Transaction Analytics for Leadership",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversation_store = {}

class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"

class QuestionResponse(BaseModel):
    answer: str
    session_id: str

class ClearSessionRequest(BaseModel):
    session_id: Optional[str] = "default"


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
def segments(transaction_type: str = None, min_amount: float = None):
    return get_success_rate_by_segment(transaction_type=transaction_type, min_amount=min_amount)


@app.get("/api/data/regional")
def regional(transaction_type: str = None, weekend_only: bool = False):
    return get_regional_analysis(transaction_type=transaction_type, weekend_only=weekend_only)


@app.get("/api/data/trends")
def trends():
    return get_transaction_trends()


