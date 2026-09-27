import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

client = Hindsight(
    base_url=os.getenv("HINDSIGHT_API_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = os.getenv("HINDSIGHT_BANK_ID")

print("Connecting to Hindsight...")

# Create memory bank
try:
    client.create_bank(
        bank_id=BANK_ID,
        name="Runbook Recall"
    )
    print("Memory bank created!")
except Exception as e:
    print("Memory bank may already exist:", e)


# -----------------------------
# INCIDENT 1
# -----------------------------

client.retain(
    bank_id=BANK_ID,
    content="""
    Incident INC-1024 happened three weeks ago.

    Service: payment-api.

    API latency increased to 4.7 seconds.

    Database connection usage reached 96 out of 100 connections.

    Root cause:
    Database connection pool exhaustion caused by a connection leak.

    Increasing API replicas did not solve the problem.

    Successful fix:
    Connection cleanup and connection pool configuration.
    """,
    context="Production incident postmortem"
)

print("INC-1024 stored")


# -----------------------------
# INCIDENT 2
# -----------------------------

client.retain(
    bank_id=BANK_ID,
    content="""
    Incident INC-1011 happened one month ago.

    Service: payment-api.

    API latency increased to 4.2 seconds.

    Database connections were normal.

    Root cause:
    A slow database query was causing high response time.

    Successful fix:
    Query optimization and adding a missing database index.
    """,
    context="Production incident postmortem"
)

print("INC-1011 stored")


# -----------------------------
# INCIDENT 3
# -----------------------------

client.retain(
    bank_id=BANK_ID,
    content="""
    Incident INC-0998 happened six weeks ago.

    Service: order-api.

    API latency increased to 5.1 seconds.

    Database connection usage reached 95 out of 100.

    Root cause:
    Database connection pool exhaustion.

    Successful fix:
    Connection cleanup and connection pool adjustment.
    """,
    context="Production incident postmortem"
)

print("INC-0998 stored")


# -----------------------------
# INCIDENT 4
# -----------------------------

client.retain(
    bank_id=BANK_ID,
    content="""
    Incident INC-0977 happened two months ago.

    Service: payment-api.

    Error rate increased and several requests returned HTTP 500.

    Root cause:
    Database connection timeout.

    Successful fix:
    Database timeout configuration and connection monitoring.
    """,
    context="Production incident postmortem"
)

print("INC-0977 stored")


# -----------------------------
# INCIDENT 5
# -----------------------------

client.retain(
    bank_id=BANK_ID,
    content="""
    Incident INC-0951 happened three months ago.

    Service: payment-api.

    API latency increased after a deployment.

    Root cause:
    Connection handling bug introduced during deployment.

    Successful fix:
    Rollback followed by connection cleanup.

    Increasing API replicas did not solve the issue.
    """,
    context="Production incident postmortem"
)

print("INC-0951 stored")


# -----------------------------
# TEST MEMORY RECALL
# -----------------------------

print("\nSearching Hindsight memory...")

results = client.recall(
    bank_id=BANK_ID,
    query="""
    Find previous incidents similar to a payment-api
    latency problem where database connection usage
    is very high. Include the root cause and the
    solution that worked.
    """
)

print("\n===== RECALLED MEMORIES =====")

for memory in results.results:
    print("\n" + memory.text)

print("\n===== TEST COMPLETE =====")