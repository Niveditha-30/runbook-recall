# Runbook Recall 🚀

**Runbook Recall** is an intelligent AI-powered incident response agent that leverages long-term vector memory (via Hindsight) and Google Gemini to automatically diagnose production incidents and suggest actionable remediation runbooks.

---

## 🌟 Key Features

- **Automated Incident Triage**: Ingests production alerts (service, description, latency, DB connections, error rate) and searches historical incident memory.
- **Hindsight Long-Term Memory**: Stores and indexes past incident post-mortems, root causes, and runbook solutions.
- **Gemini-Powered Diagnosis**: Uses Google Gemini to analyze incidents, evaluate historical evidence, and recommend step-by-step remediation procedures.
- **Interactive Dashboard**: Modern, responsive React dashboard with real-time incident analysis, metric gauges, and memory bank inspection.

---

## 🏗️ Architecture

```
[ Frontend: React + Vite ]
           │
           ▼ (HTTP / REST)
[ Backend: FastAPI ]
     ├── [ Google Gemini 2.5 ]  ──> Root cause analysis & runbook synthesis
     └── [ Hindsight Client ]   ──> Incident retrieval & memory persistence
```

---

## 📁 Repository Structure

```
runbook-recall/
├── backend/
│   ├── agent.py            # Gemini integration and prompt logic
│   ├── main.py             # FastAPI REST endpoints
│   ├── test_gemini.py      # Gemini connection verification
│   ├── test_hindsight.py   # Hindsight memory seeding & test script
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main UI component
│   │   ├── App.css         # Component styling
│   │   └── index.css       # Global design system
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
   HINDSIGHT_API_KEY=your_hindsight_api_key_here
   HINDSIGHT_BANK_ID=runbook-recall
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. (Optional) Seed the Hindsight memory bank:
   ```bash
   python test_hindsight.py
   ```
6. Start the backend server:
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

### 2. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic
- **AI & Memory**: Google Gemini (`google-genai`), Hindsight (`hindsight-client`)
- **Frontend**: React, Vite, Vanilla CSS
