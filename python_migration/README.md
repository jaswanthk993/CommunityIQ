# 🛡️ CIVITAS AI (CommunityIQ) - Python Architecture Migration Blueprint

This directory contains the production-grade, migrated, Python-first architecture of the **CIVITAS AI** (formerly CommunityIQ) city intelligence operating system. The application has been refactored from React/Express/TypeScript to a fully microservice-ready backend based on **FastAPI** paired with an interactive, responsive front-end built using **Streamlit** and custom SVG-over-HTML maps.

---

## 🏛️ Updated Target Architecture

```
                    ┌──────────────────────────────┐
                    │     Streamlit Front-End      │
                    │        (Port 3000)           │
                    └──────────────┬───────────────┘
                                   │
                           REST    │ HTTP Posts & Chats
                           APIs    │
                                   ▼
                    ┌──────────────────────────────┐
                    │       FastAPI Backend        │
                    │        (Port 8000)           │
                    └──────────────┬───────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  PostgreSQL/SQL  │     │   LlamaIndex     │     │     DuckDB       │
│  (pgvector Store)│     │  RAG Knowledge   │     │  OLAP Analytics  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
          │                        │                        │
          │                        ▼                        ▼
          └───────────────► google-genai SDK ◄──────────────┘
                         (Gemini 2.5 Pro / Embeddings)
```

- **Frontend:** Streamlit v1.25+ utilizing responsive state containers, high-contrast dark visual components, and standard CSS overlays to fully mirror the original dark theme.
- **Backend:** FastAPI leveraging Pydantic v2 schemas and Uvicorn runtime to handle high-bandwidth municipal request dispatch threads.
- **AI layer:** Google GenAI SDK interfacing `gemini-2.5-pro` for structured Multi-Agent reports and RAG answers.
- **RAG Store:** LlamaIndex with `text-embedding-004` embedding arrays mapped onto historical incident records.
- **Analytics Store:** DuckDB running real-time OLAP group queries on live incident categories.

---

## 📂 New Folder Structure & File-by-File Mapping

Below is the precise architectural cross-over mapping showing how the original TypeScript components have been translated to standard, modular Python files:

| Original TypeScript/React File | Migrated Python Equivalents | Architectural Roll & Purpose |
| :--- | :--- | :--- |
| `server.ts` (API routes) | `app/main_api.py` | FastAPI center exposing CORS, ticket posting, and simulator routers. |
| `server.ts` (Database mock) | `app/database.py` | PostgreSQL SQLAlchemy mapping with in-memory thread-safe failover mocks. |
| `server.ts` (Gemini SDK proxies) | `app/agents/sub_agents.py` | Multi-Agent orchestrator using system prompts and Pydantic schemas. |
| `/src/types.ts` (Models) | `app/schemas.py` | Strict validation of network payload definitions using Pydantic. |
| `/src/App.tsx` (Dashboard view) | `frontend/app.py` | Streamlit layout coordinating metrics, interactive tabs, and agent logs. |
| `src/components/CityMap.tsx` | `frontend/components/maps.py` | Renders the high-contrast interactive SVG matrix with blinking incident indicators. |
| `src/components/MetricCards.tsx` | `frontend/app.py` (Visual rows) | Generates responsive grid modules with critical conditional threshold glows. |
| `src/components/PolicySimulator.tsx`| `frontend/app.py` (Sandbox) | Policy template presets loading and Custom Proposal simulation controls. |
| `src/components/CitizenCopilot.tsx` | `frontend/app.py` (Tabs portal)| Conversational agent chat log, submission forms, and administrative resolves. |

```
python_migration/
├── requirements.txt         # All modern Python requirements (FastAPI, Streamlit, DuckDB, LlamaIndex, Google GenAI)
├── Dockerfile               # Dual-service production wrapper optimizing memory and startup pools
├── .env.example             # Database, LLM and Port environmental flags mapping
├── README.md                # This comprehensive blueprint and documentation
├── app/
│   ├── __init__.py
│   ├── database.py          # SQLAlchemy PostgreSQL mapping, seeding schemas and in-memory mock fallback
│   ├── schemas.py           # Pydantic v2 payload structures
│   ├── main_api.py          # Central FastAPI routing logic
│   ├── analytics.py         # DuckDB aggregations and group analytics
│   └── agents/
│       ├── __init__.py
│       ├── sub_agents.py    # Gemini multi-agent coordinates and safe recovery pipelines
│       └── rag_service.py   # LlamaIndex semantic retrieval engine
└── frontend/
    ├── __init__.py
    ├── app.py               # Responsive Streamlit UI layout
    └── components/
        └── maps.py          # Dynamic SVG interactive city map
```

---

## 📦 Local & Production Deployment Instructions

### 1. Manual Setup & Activation
Ensure you have Python 3.10+ installed.

```bash
# Climb into the migration folder
cd python_migration

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install all locked production-grade libraries
pip install -r requirements.txt

# Create your secret environmental keys
cp .env.example .env
# Edit '.env' to specify your real GEMINI_API_KEY
```

### 2. Standalone Service Run
Launch both endpoints in two separate shell windows:

*   **Terminal 1 (Backend REST API):**
    ```bash
    uvicorn app.main_api:app --host 0.0.0.0 --port 8000 --reload
    ```
*   **Terminal 2 (Streamlit Front-End Interface):**
    ```bash
    streamlit run frontend/app.py --server.port=3000
    ```

---

## 🐋 Docker & Google Cloud Run Setup

The provided `Dockerfile` leverages a **dual-service startup** designed specifically for simple, unified Google Cloud Run deployments without demanding high-overhead external Kubernetes overhead.

### Step 1: Build Docker Container locally
```bash
docker build -t gcr.io/your_project_id/civitas-ai:latest -f Dockerfile .
```

### Step 2: Push container to Google Artifact Registry
```bash
gcloud auth configure-docker
docker push gcr.io/your_project_id/civitas-ai:latest
```

### Step 3: Deploy to Cloud Run on Port 3000
```bash
gcloud run deploy civitas-ai \
    --image gcr.io/your_project_id/civitas-ai:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3000 \
    --set-env-vars="GEMINI_API_KEY=your_key,DATABASE_URL=postgresql+asyncpg://..."
```

---

## 🔍 Migration Risks, Edge Cases & Safe Fixes

1.  **Risk: Missing or Revoked Gemini API Key**
    *   *Symptom:* The main orchestration buttons or the copilot chat fail, causing server timeouts.
    *   *Remediation:* Deployed clean JSON schema fallbacks (`safe recovery protocol`) both in `sub_agents.py` and `rag_service.py`. If key is invalid, the model switches gracefully to pre-formulated planning loops.
2.  **Risk: PostgreSQL Latency / High Ingress Barriers**
    *   *Symptom:* Complaints submission blocks the thread waiting for database handshakes.
    *   *Remediation:* Built high-performance async pools using SQLAlchemy and designed a Dual-Mode automatic thread-safe memory mock database that runs immediately on SQLite/RAM if the system is offline.
3.  **Risk: Streamlit Component Blocking**
    *   *Symptom:* Continuous page refreshes clear the active chat logging history or current agent findings.
    *   *Remediation:* Bound critical arrays inside `st.session_state` so that conversational turns remain perfectly preserved across tick states and form submits.
