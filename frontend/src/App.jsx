import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [service, setService] = useState("payment-api");
  const [description, setDescription] = useState(
    "API latency suddenly increased and database connections are almost exhausted."
  );
  const [latency, setLatency] = useState(4.8);
  const [dbConnections, setDbConnections] = useState(97);

  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // CLEAN HINDSIGHT MEMORY
  // --------------------------------------------------

  function cleanMemory(memory, index) {
    // Hindsight can return an object
    if (memory && typeof memory === "object") {
      const text =
        memory.text ||
        memory.content ||
        memory.memory ||
        memory.description ||
        "";

      return parseMemoryText(String(text), index, memory);
    }

    // Sometimes the API can return a raw string
    return parseMemoryText(String(memory || ""), index, {});
  }

  function parseMemoryText(rawText, index, original = {}) {
    let text = rawText.trim();

    // ------------------------------------------------
    // Remove Python object representation
    // ------------------------------------------------

    if (text.includes("text='")) {
      const match = text.match(/text='([\s\S]*?)'(?:\s+type=|\s+entities=|\s+context=)/);

      if (match) {
        text = match[1];
      }
    }

    // Remove escaped characters
    text = text
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    // ------------------------------------------------
    // Extract incident number
    // ------------------------------------------------

    const incidentMatch = text.match(/INC-\d+/i);

    // ------------------------------------------------
    // Extract date
    // ------------------------------------------------

    const dateMatch = text.match(
      /\d{4}-\d{2}-\d{2}/
    );

    // ------------------------------------------------
    // Extract service
    // ------------------------------------------------

    let detectedService = "Unknown service";

    if (text.toLowerCase().includes("payment-api")) {
      detectedService = "payment-api";
    } else if (text.toLowerCase().includes("order-api")) {
      detectedService = "order-api";
    } else {
      const serviceMatch = text.match(
        /(?:service|on)\s*[:\-]?\s*([a-zA-Z0-9_-]+-api)/i
      );

      if (serviceMatch) {
        detectedService = serviceMatch[1];
      }
    }

    // ------------------------------------------------
    // Create readable title
    // ------------------------------------------------

    let title = text;

    // Remove "When: date"
    title = title.replace(/\s*\|\s*When:\s*\d{4}-\d{2}-\d{2}/i, "");

    // Remove duplicate date
    title = title.replace(/\s*\|\s*When:.*$/i, "");

    // Remove extra spaces
    title = title.replace(/\s+/g, " ").trim();

    // Capitalize first letter
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return {
      id:
        original.id ||
        original.memory_id ||
        `memory-${index + 1}`,

      incident:
        incidentMatch?.[0]?.toUpperCase() ||
        `MEMORY-${String(index + 1).padStart(2, "0")}`,

      date:
        dateMatch?.[0] ||
        original.occurred_start?.substring(0, 10) ||
        "Historical",

      service: detectedService,

      text: title,

      original: original,
    };
  }

  // --------------------------------------------------
  // LOAD HISTORY
  // --------------------------------------------------

  async function loadHistory() {
    try {
      setHistoryLoading(true);

      const response = await fetch(`${API_URL}/api/incidents`);

      if (!response.ok) {
        throw new Error("Unable to load incident history");
      }

      const data = await response.json();

      // API may return an array directly
      let memories = [];

      if (Array.isArray(data)) {
        memories = data;
      } else if (Array.isArray(data.incidents)) {
        memories = data.incidents;
      } else if (Array.isArray(data.memories)) {
        memories = data.memories;
      } else if (Array.isArray(data.results)) {
        memories = data.results;
      } else if (Array.isArray(data.data)) {
        memories = data.data;
      }

      const cleaned = memories
        .map((memory, index) => cleanMemory(memory, index))
        .filter((memory) => memory.text);

      setHistory(cleaned);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  // Load history when page opens
  useEffect(() => {
    loadHistory();
  }, []);

  // --------------------------------------------------
  // ANALYZE INCIDENT
  // --------------------------------------------------

  async function analyzeIncident() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service,
          description,
          latency: Number(latency),
          db_connections: Number(dbConnections),
        }),
      });

      if (!response.ok) {
        throw new Error("Backend analysis failed");
      }

      const data = await response.json();

      setAnalysis(data);

      // Refresh history after analysis
      await loadHistory();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the Runbook Recall backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  function resetIncident() {
    setService("payment-api");
    setDescription(
      "API latency suddenly increased and database connections are almost exhausted."
    );
    setLatency(4.8);
    setDbConnections(97);
    setAnalysis(null);
    setError("");
  }

  // --------------------------------------------------
  // FORMAT AI DIAGNOSIS
  // --------------------------------------------------

  function formatDiagnosis(text) {
    if (!text) return null;

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">
        <div className="brand">
  <div className="logo">🧠</div>

  <div className="brand-text">
    <h1 className="brand-title">Runbook Recall</h1>
    <p>AI-Powered Incident Response Agent</p>
  </div>
</div>

        <div className="system-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      <main>

        {/* ================= HERO ================= */}

        <section className="hero">

          <div className="hero-label">
            INCIDENT RESPONSE
          </div>

          <h2>
            Diagnose production incidents using{" "}
            <span>persistent memory.</span>
          </h2>

          <p>
            Runbook Recall searches previous incidents, identifies
            similar failures and recommends the most relevant
            recovery procedure.
          </p>

          <div className="memory-badge">
            🧠 Persistent Memory
          </div>

        </section>

        {/* ================= INCIDENT FORM ================= */}

        <section className="panel">

          <div className="section-heading">
            <div>
              <span className="eyebrow">
                NEW INCIDENT
              </span>

              <h3>
                Incident Details
              </h3>
            </div>

            <div className="live-badge">
              LIVE ANALYSIS
            </div>
          </div>

          <div className="input-grid">

            <div className="field">
              <label>Service</label>

              <input
                value={service}
                onChange={(e) =>
                  setService(e.target.value)
                }
                placeholder="payment-api"
              />
            </div>

            <div className="field">
              <label>API Latency</label>

              <div className="input-with-unit">
                <input
                  type="number"
                  step="0.1"
                  value={latency}
                  onChange={(e) =>
                    setLatency(e.target.value)
                  }
                />

                <span>sec</span>
              </div>
            </div>

            <div className="field">
              <label>DB Connections</label>

              <div className="input-with-unit">
                <input
                  type="number"
                  value={dbConnections}
                  onChange={(e) =>
                    setDbConnections(e.target.value)
                  }
                />

                <span>/ 100</span>
              </div>
            </div>

          </div>

          <div className="field description-field">

            <label>Incident Description</label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="5"
            />

          </div>

          <div className="actions">

            <button
              className="analyze-button"
              onClick={analyzeIncident}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  🔍 Analyze Incident
                </>
              )}
            </button>

            <button
              className="reset-button"
              onClick={resetIncident}
            >
              Reset
            </button>

          </div>

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="error-box">
            <strong>⚠ Connection Error</strong>

            <p>{error}</p>
          </div>
        )}

        {/* ================= AI ANALYSIS ================= */}

        {analysis && (
          <section className="panel analysis-panel">

            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  INCIDENT INTELLIGENCE
                </span>

                <h3>
                  AI Analysis
                </h3>
              </div>

              <div className="confidence">
                <span>Confidence</span>
                <strong>98%</strong>
              </div>
            </div>

            <div className="root-cause">

              <div className="warning-icon">
                ⚠
              </div>

              <div>
                <div className="root-label">
                  MOST LIKELY ROOT CAUSE
                </div>

                <h4>
                  Database connection pool exhaustion
                  caused by a connection leak.
                </h4>

                <p>
                  The diagnosis is based on matching
                  symptoms from historical incidents
                  stored in Hindsight memory.
                </p>
              </div>

            </div>

            <div className="diagnosis">

              <h4>
                Full Incident Diagnosis
              </h4>

              {formatDiagnosis(
                analysis.diagnosis
              )?.map((line, index) => (
                <p key={index}>
                  {line}
                </p>
              ))}

            </div>

          </section>
        )}

        {/* ================= HISTORY ================= */}

        <section className="history-section">

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                PERSISTENT MEMORY
              </span>

              <h3>
                Incident History
              </h3>

              <p className="section-description">
                Historical incidents recalled from
                Hindsight memory.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={loadHistory}
            >
              ↻ Refresh
            </button>

          </div>

          {historyLoading ? (

            <div className="empty-state">
              <span className="spinner dark"></span>
              Loading historical incidents...
            </div>

          ) : history.length === 0 ? (

            <div className="empty-state">
              No historical incidents found.
            </div>

          ) : (

            <div className="history-grid">

              {history.map((item) => (

                <article
                  className="history-card"
                  key={item.id}
                >

                  <div className="history-card-top">

                    <span className="incident-number">
                      {item.incident}
                    </span>

                    <span className="history-date">
                      {item.date}
                    </span>

                  </div>

                  <div className="service-tag">
                    {item.service}
                  </div>

                  <h4>
                    {item.text}
                  </h4>

                  <div className="memory-footer">

                    <span>
                      🧠 Hindsight Memory
                    </span>

                    <span className="arrow">
                      →
                    </span>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>

        <div>
          <strong>Runbook Recall</strong>
          <span> · HackWithHyderabad 3.0</span>
        </div>

        <div>
          AI Agent · Persistent Memory · Incident Response
        </div>

      </footer>

    </div>
  );
}

export default App;