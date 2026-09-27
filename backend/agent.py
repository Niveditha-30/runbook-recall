import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_incident(incident, memories):

    # Convert Hindsight memories into readable text
    memory_text = "\n\n".join(
        memory.text for memory in memories.results
    )

    prompt = f"""
You are Runbook Recall, an AI incident-response agent.

Your job is to diagnose a new production incident by using
similar incidents retrieved from long-term memory.

========================
NEW INCIDENT
========================

{incident}

========================
PAST INCIDENTS FROM MEMORY
========================

{memory_text}

========================
YOUR TASK
========================

Analyze the new incident using the historical incidents.

Return the answer using exactly these sections:

1. MOST LIKELY ROOT CAUSE

Explain the most likely cause.

2. SIMILAR PREVIOUS INCIDENT

Give the incident ID of the most relevant previous incident.

3. EVIDENCE FROM MEMORY

Explain why the previous incident is relevant.

4. RECOMMENDED RUNBOOK

Give clear step-by-step actions the engineer should take.

5. ACTIONS TO AVOID

Mention previous actions that did not solve the problem.

6. CONFIDENCE

Give a confidence percentage from 0 to 100.

IMPORTANT RULES:

- Use the retrieved memories as evidence.
- Do not invent incident IDs.
- Do not claim something happened in a previous incident unless
  it appears in the memory.
- If there is insufficient evidence, say so.
- Prefer the most similar incident.
- Keep the answer practical and concise.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text