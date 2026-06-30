import os
import uvicorn
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

# Local module imports
from app.schemas import (
    ComplaintCreate, Complaint, ZoneMetric, CityAggregates,
    SimulationRequest, SimulationResult, RecommendationsResponse,
    MasterPlanItem
)
from app.database import db_manager
from app.agents.sub_agents import ai_agents
from app.agents.rag_service import city_rag
from app.analytics import olap_analytics

app = FastAPI(
    title="Civitas Core - Decision Intelligence Platform API",
    description="FastAPI central municipal OS supporting ADK multi-agents, RAG knowledge stores, and DuckDB OLAP feeds.",
    version="2.0.0"
)

# Enable global CORS for microservice architecture (e.g. decoupled Streamlit client calls)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def retrieve_city_aggregates() -> Dict[str, Any]:
    """
    Combines SQL stats with analytics weights to synthesize current metadata.
    """
    zones = db_manager.get_zones()
    complaints = db_manager.get_complaints()
    
    # Run DuckDB high-performance OLAP metrics
    olap_analytics.update_complaint_tables(complaints)
    zone_stats = olap_analytics.get_zone_aggregate_history(zones)
    
    avg_traffic = zone_stats["avg_traffic"]
    avg_aqi = zone_stats["avg_aqi"]
    avg_waste = zone_stats["avg_waste"]
    
    # Calculate utility fail rate from actual counts
    fails = [z["waterUtilityFailRate"] for z in zones]
    avg_fail = round(sum(fails)/len(fails)) if fails else 5

    # Composite satisfaction indices
    sat = max(20, min(98, round(100 - (avg_traffic*0.2 + avg_aqi*0.15 + avg_waste*0.25 + avg_fail*0.2))))
    active_count = len([c for c in complaints if c["status"] != "Resolved"])

    from datetime import datetime
    return {
        "trafficCongestionIndex": avg_traffic,
        "airQualityAQI": avg_aqi,
        "wasteManagementEfficiency": 100 - avg_waste,
        "waterUtilityFailRate": avg_fail,
        "citizenSatisfaction": sat,
        "activeAlertsCount": active_count,
        "lastUpdate": datetime.utcnow().isoformat() + "Z"
    }

# --- ENDPOINTS ---

@app.get("/api/status")
async def get_status():
    """
    GET: Returns real-time aggregate, active indicators, and city metrics.
    """
    try:
        aggregates = retrieve_city_aggregates()
        return {
            "success": True,
            "data": {
                "aggregates": aggregates,
                "zones": db_manager.get_zones(),
                "complaints": db_manager.get_complaints()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})

@app.post("/api/report")
async def report_incident(payload: ComplaintCreate):
    """
    POST: Citizen reports high-priority safety or utility incident.
    """
    try:
        new_complaint = db_manager.add_complaint(
            ward=payload.ward,
            category=payload.category,
            title=payload.title,
            details=payload.details,
            imageUrl=payload.imageUrl
        )
        return {"success": True, "data": new_complaint}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})

@app.post("/api/complaints/{id}/resolve")
async def resolve_incident(id: int):
    """
    POST: Administrative dispatcher commands resolution of active ticket.
    """
    success = db_manager.resolve_complaint(id)
    if success:
        return {"success": True, "message": "Incident resolved."}
    else:
        raise HTTPException(status_code=404, detail={"success": False, "error": "Complaint ID not found."})

@app.post("/api/copilot/chat")
async def copilot_chat(payload: Dict[str, Any] = Body(...)):
    """
    POST: Natural language chat endpoint with LlamaIndex RAG retrieval + Gemini model memory.
    """
    message = payload.get("message")
    chat_history = payload.get("chatHistory", [])
    
    if not message:
        raise HTTPException(status_code=400, detail={"success": False, "error": "Message body is empty."})

    try:
        # Build RAG knowledge base dynamically with current state
        complaints = db_manager.get_complaints()
        city_rag.build_index_from_complaints(complaints)
        
        # Verify if query involves past issues/incidents to extract similarity results
        context_response = ""
        if any(kw in message.lower() for kw in ["how", "last", "resolved", "history", "pothole", "dumpster", "leak"]):
            context_response = city_rag.query_historical_knowledge(message)
            
        # Invoke Gemini Client with chat payload
        primary_chat_prompt = message
        if context_response:
            primary_chat_prompt += f"\n\n(Retrieve Context Profile from Records):\n{context_response}"
            
        ai_reply = ai_agents.generate_chat_reply(primary_chat_prompt, chat_history)
        return {"success": True, "data": {"reply": ai_reply}}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})

@app.post("/api/recommendations")
async def get_multi_agent_recommendations():
    """
    POST: Coordinate joint sessions across all 4 ADK agents (Traffic, Environmental, Service, Emergency).
    """
    try:
        complaints = db_manager.get_complaints()
        zones = db_manager.get_zones()
        aggregates = retrieve_city_aggregates()

        report = ai_agents.execute_multi_agent_review(
            active_complaints=complaints,
            zone_sensor_data=zones,
            aggregates=aggregates
        )
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})

@app.post("/api/simulate")
async def simulate_policy(payload: SimulationRequest):
    """
    POST: Runs Monte-Carlo predictions on the expected impact of a custom policy suggestion.
    """
    try:
        result = ai_agents.run_policy_simulator(
            policy_name=payload.policyName,
            policy_description=payload.policyDescription or "",
            current_satisfaction=payload.currentSatisfaction or 70
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})

if __name__ == "__main__":
    # Standard standalone launch
    uvicorn.run("app.main_api:app", host="0.0.0.0", port=8000, reload=True)
