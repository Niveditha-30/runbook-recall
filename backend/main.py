import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from hindsight_client import Hindsight

from agent import analyze_incident


load_dotenv()

app = FastAPI(title="Runbook Recall API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# HINDSIGHT CONNECTION
# -----------------------------

hindsight = Hindsight(
    base_url=os.getenv("HINDSIGHT_API_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = os.getenv("HINDSIGHT_BANK_ID")


# -----------------------------
# INCIDENT INPUT MODEL
# -----------------------------

class Incident(BaseModel):

    service: str

    description: str

    latency: float | None = None

    db_connections: int | None = None


# -----------------------------
# HOME
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "Runbook Recall Backend is running!"
    }


# -----------------------------
# ANALYZE INCIDENT
# -----------------------------

@app.post("/api/analyze")
def analyze(incident: Incident):

    incident_text = f"""
Service:
{incident.service}

Description:
{incident.description}

API latency:
{incident.latency} seconds

Database connections:
{incident.db_connections}
"""

    # Search persistent memory
    memories = hindsight.recall(
        bank_id=BANK_ID,
        query=incident_text
    )

    # AI analysis
    diagnosis = analyze_incident(
        incident_text,
        memories
    )

    return {
        "incident": incident_text,
        "diagnosis": diagnosis
    }


# -----------------------------
# INCIDENT HISTORY
# -----------------------------

@app.get("/api/incidents")
def get_incidents():

    # Search Hindsight for previously stored incidents
    memories = hindsight.recall(
        bank_id=BANK_ID,
        query="previous production incidents, incident IDs, services, root causes, symptoms and resolutions"
    )

    incidents = []

    for memory in memories:

        # Hindsight memories may contain different structures.
        # Convert each memory into a simple object for the frontend.

        if isinstance(memory, dict):

            text = (
                memory.get("text")
                or memory.get("content")
                or memory.get("memory")
                or str(memory)
            )

        else:

            text = str(memory)

        incidents.append({
            "content": text
        })

    return {
        "count": len(incidents),
        "incidents": incidents
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)