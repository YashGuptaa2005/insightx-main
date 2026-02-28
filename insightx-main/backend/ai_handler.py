import os
import json
from groq import Groq
from dotenv import load_dotenv
from query_engine import (
    get_failure_analysis,
    get_success_rate_by_segment,
    get_regional_analysis,
    get_transaction_trends
)
from data_loader import get_summary

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are InsightX, an expert business intelligence assistant for a UPI digital payments platform.
You help leadership-level users (CEOs, CTOs, VPs) understand transaction data through clear, actionable insights.

You have access to a dataset of 250,000 UPI transactions from 2024 covering:
- Transaction types: P2P, P2M, Bill Payment, Recharge
- 10 Indian states, 8 banks, multiple device types and network types
- Merchant categories: Grocery, Food, Shopping, Fuel, Entertainment, Transport, Healthcare, Education, Utilities, Other
- Fraud flags, success/failure status, timestamps

Your response style:
- Lead with a direct, clear answer
- Back it up with specific numbers from the data provided
- Explain what it means for the business
- Suggest 1-2 actionable next steps when relevant
- Use plain business language, no technical jargon
- Always mention sample size for context
- Distinguish between correlation and causation clearly

You will receive data context as JSON. Use it to answer the user's question precisely."""


def classify_intent(question: str) -> str:
    question_lower = question.lower()
    
    if any(word in question_lower for word in ["fail", "error", "issue", "problem", "peak"]):
        return "failure"
    elif any(word in question_lower for word in ["region", "state", "geography", "bill", "recharge", "weekend"]):
        return "regional"
    elif any(word in question_lower for word in ["age", "device", "segment", "p2m", "fraud", "high-value", "success"]):
        return "segment"
    elif any(word in question_lower for word in ["trend", "hour", "time", "day", "volume", "pattern"]):
        return "trends"
    else:
        return "general"


def fetch_relevant_data(intent: str, question: str) -> dict:
    data = {"summary": get_summary()}
    
    if intent == "failure":
        peak = "peak" in question.lower()
        data["failure_analysis"] = get_failure_analysis(peak_only=peak)
        data["failure_analysis_overall"] = get_failure_analysis(peak_only=False)
    elif intent == "regional":
        weekend = "weekend" in question.lower()
        data["regional_analysis"] = get_regional_analysis(weekend_only=weekend)
        if "bill" in question.lower():
            data["bill_payment_regional"] = get_regional_analysis(transaction_type="Bill Payment", weekend_only=weekend)
        if "recharge" in question.lower():
            data["recharge_regional"] = get_regional_analysis(transaction_type="Recharge", weekend_only=weekend)
    elif intent == "segment":
        min_amount = 5000 if "5000" in question or "5,000" in question else None
        data["segment_analysis"] = get_success_rate_by_segment(transaction_type="P2M", min_amount=min_amount)
    elif intent == "trends":
        data["trends"] = get_transaction_trends()
    else:
        data["failure_analysis"] = get_failure_analysis()
        data["trends"] = get_transaction_trends()
        data["regional_analysis"] = get_regional_analysis()
    
    return data


def ask_insightx(question: str, conversation_history: list = None) -> tuple:
    if conversation_history is None:
        conversation_history = []
    
    intent = classify_intent(question)
    data = fetch_relevant_data(intent, question)
    
    data_context = f"""
RELEVANT DATA FOR THIS QUERY:
{json.dumps(data, indent=2, default=str)}

USER QUESTION: {question}
"""
    
    messages = conversation_history.copy()
    messages.append({"role": "user", "content": data_context})
    
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages
    )
    
    answer = response.choices[0].message.content
    
    conversation_history.append({"role": "user", "content": data_context})
    conversation_history.append({"role": "assistant", "content": answer})
    
    return answer, conversation_history