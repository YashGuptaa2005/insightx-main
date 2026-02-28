# InsightX — Leadership Analytics Intelligence

AI-powered conversational business intelligence system for UPI transaction data.
Built for InsightX: Leadership Analytics Challenge, Techfest 2025-26.

---

## Overview

InsightX allows non-technical leadership (CEOs, CTOs, VPs) to ask plain English questions
about 250,000 UPI transactions and receive clear, data-backed business insights —
no SQL, no dashboards, no technical knowledge required.

---

## Project Structure

```
insightx/
├── backend/
│   ├── main.py               # REST API endpoints
│   ├── data_loader.py        # CSV ingestion and caching
│   ├── query_engine.py       # Data analysis functions
│   ├── ai_handler.py         # Groq LLM integration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   └── SummaryCards.jsx
└── data/
    └── upi_transactions_2024.csv
```

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- Groq API key — available free at console.groq.com

---

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install fastapi uvicorn pandas python-dotenv groq
```

Create a `.env` file inside `backend/`:

```
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:

```bash
python3 main.py
```

Backend runs at http://localhost:8000

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

---

## Sample Leadership Questions

- What are the top reasons for transaction failures during peak hours?
- Which age group has the highest success rate for P2M transactions above 5,000?
- How do transaction volumes vary across states on weekends?
- What are the fraud flag patterns across different device types?

---

## API Reference

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| POST   | /api/ask            | Ask a business question      |
| GET    | /api/summary        | Dataset overview             |
| GET    | /api/data/failures  | Failure analysis             |
| GET    | /api/data/trends    | Hourly and daily trends      |
| GET    | /api/data/regional  | State-wise breakdown         |
| GET    | /api/data/segments  | Age and device segments      |
| POST   | /api/clear          | Clear conversation session   |

---

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| AI Model  | Llama 3.3 70B via Groq API  |
| Backend   | Python, FastAPI, Pandas     |
| Frontend  | React, Vite                 |
| Styling   | CSS Variables               |

---

## Deliberate Exclusions

- No predictive or forecasting models
- No real-time streaming analytics
- No external data sources
- No individual user profiling
- Correlation is never presented as causation

---

Built for Techfest 2025-26 — InsightX Leadership Analytics Challenge
