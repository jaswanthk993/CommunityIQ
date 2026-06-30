import os
import json
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Schema for the joint Multi-Agent control center recommendations
class MasterPlanItem(BaseModel):
    title: str
    agency: str
    impact: str
    cost: str
    priority: str
    action: str

class RecommendationsData(BaseModel):
    trafficAgentReport: str
    environmentAgentReport: str
    serviceAgentReport: str
    emergencyAgentReport: str
    masterPlan: List[MasterPlanItem]

# Schema for the policy simulator AI predictions
class PolicySimulationResult(BaseModel):
    trafficReduction: int
    emissionSavings: int
    citizenSatisfactionDelta: int
    wasteEfficiencyDelta: int
    financialCostEstimate: str
    pros: List[str]
    cons: List[str]
    detailedAnalysis: str

class AgentCoordinatingCenter:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        self.model_name = os.getenv("LLM_MODEL", "gemini-2.5-flash") # Use standard flash/pro depending on deployment
        
        if self.api_key and self.api_key != "MOCK_KEY":
            try:
                # Initialize modern Google GenAI Client
                self.client = genai.Client(api_key=self.api_key)
                print(f"CIVITAS AGENTS: Successfully initialized Gemini Client with model {self.model_name}.")
            except Exception as e:
                print(f"CIVITAS AGENTS FAILURE: Failed to initialize Google GenAI SDK: {e}")
                self.client = None

    def execute_multi_agent_review(self, 
                                  active_complaints: List[Dict[str, Any]], 
                                  zone_sensor_data: List[Dict[str, Any]], 
                                  aggregates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinates reports from Traffic, Environment, Service, and Emergency sub-agents using a chief Decision Agent blueprint.
        """
        system_instruction = (
            "You are 'Decision Agent', the chief coordination engine of CommunityIQ's Multi-Agent system built with ADK.\n"
            "You coordinate multiple autonomous agents tracking smart cities:\n"
            "1. Traffic Agent: Optimizes congestion, public transit and parking efficiency.\n"
            "2. Environment Agent: Monitors AQI levels, heat islands, thermal mapping and compliance.\n"
            "3. Public Service Agent: Triages social reports, misses, service delays and resource queues.\n"
            "4. Emergency Agent: Mitigates active physical hazards, floods, blockages, fire risks.\n"
            "Analyze the current city state and construct the thinking logs/audit analysis of all four agents,\n"
            "creating a unified prioritisation masterPlan list. Return response conforming to strict JSON schema."
        )

        user_content = (
            f"Active Citizen Complaints:\n{json.dumps(active_complaints)}\n\n"
            f"Zone Sensor Data:\n{json.dumps(zone_sensor_data)}\n\n"
            f"Aggregate Metrics:\n{json.dumps(aggregates)}\n\n"
            "Query each sub-agent and provide structured report summaries and prioritized immediate tactical steps."
        )

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_content,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.8,
                        response_mime_type="application/json",
                        response_schema=RecommendationsData
                    )
                )
                # Parse response JSON standard format
                return json.loads(response.text)
            except Exception as err:
                print(f"CIVITAS AI EXCEPTION: Live AI failure, applying fallback Multi-Agent system logic: {err}")
                return self.get_rec_fallback(active_complaints, aggregates, zone_sensor_data)
        else:
            return self.get_rec_fallback(active_complaints, aggregates, zone_sensor_data)

    def run_policy_simulator(self, policy_name: str, policy_description: str, current_satisfaction: int) -> Dict[str, Any]:
        """
        Simulates the systemic impact of a custom municipality directive.
        """
        system_instruction = (
            "You are 'Predictive Simulation Agent', a professional city simulation AI engine.\n"
            "You run policy simulations on traffic, emission, satisfaction, and waste. Based on current stats,\n"
            "predict numeric percentages and cost, then output qualitative pros, cons, and detailed operational planning reports."
        )

        user_content = (
            f"Policy Name: {policy_name}\n"
            f"Description: {policy_description}\n"
            f"Current Satisfaction Score: {current_satisfaction}%\n\n"
            "Produce realistic forecasts mapping out urban development metrics."
        )

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_content,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        response_mime_type="application/json",
                        response_schema=PolicySimulationResult
                    )
                )
                return json.loads(response.text)
            except Exception as err:
                print(f"CIVITAS AI EXCEPTION: Live simulator failure, applying fallback predictive mapping: {err}")
                return self.get_simulation_fallback(policy_name, policy_description)
        else:
            return self.get_simulation_fallback(policy_name, policy_description)

    def generate_chat_reply(self, message: str, chat_history: List[Dict[str, str]]) -> str:
        """
        AI Conversation Assistant proxy to handle citizen questions about Wards or report ETAs.
        """
        system_instruction = (
            "You are 'CIVITAS AI Citizen Copilot', the official dashboard advisor. Help citizens lookup Wards status,\n"
            "air quality indexes, report dumpsters, check delay expectations, or file reports. Be concise, polite, and practical."
        )

        history_payload = []
        for turn in chat_history[-6:]:
            role = "user" if turn["role"] == "user" else "model"
            history_payload.append(types.Content(role=role, parts=[types.Part.from_text(text=turn["text"])]))

        history_payload.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=history_payload,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7
                    )
                )
                return response.text
            except Exception as e:
                print(f"CIVITAS AI CHAT EXCEPTION: {e}")
                return self.get_chat_fallback(message)
        else:
            return self.get_chat_fallback(message)

    # --- FALLBACK PROCEDURES (Safe Soft Recovery) ---
    def get_rec_fallback(self, complaints: List[Dict[str, Any]], aggregates: Dict[str, Any], zones: List[Dict[str, Any]]) -> Dict[str, Any]:
        active_count = len([c for c in complaints if c["status"] != "Resolved"])
        zone_aqi = zones[1]["airQualityAQI"] if len(zones) > 1 else 168
        
        return {
            "trafficAgentReport": f"Analyzed traffic indexes. Peak queues downtown ({aggregates.get('trafficCongestionIndex', 56)}% congestion). Custom adaptive green timing calibration running on express lines.",
            "environmentAgentReport": f"Particulate dispersion sensors active. High PM2.5 threshold warnings raised near Industrial sectors (AQI: {zone_aqi}). Demanding active mist spray or construction stops.",
            "serviceAgentReport": f"Social complaints queue active. Handling {active_count} unresolved priority incident reports. High garbage density noted in commercial markets.",
            "emergencyAgentReport": "Pipeline leak alert near Highway Ring. Re-routing freight drivers off affected junctions and dispatched plumbing specialists.",
            "masterPlan": [
                {
                    "title": "Intelligent Traffic Timing Reprofile",
                    "agency": "Municipal Traffic Commission",
                    "impact": "Reduces arterial travel queue times by 20% in Ward 1 & 3",
                    "cost": "$12,000 (Software Calibration)",
                    "priority": "Critical",
                    "action": "Deploy adaptive green phase synchronization algorithm for express corridors."
                },
                {
                    "title": "Urgent Sanitation Dispatch: Ward 3 & 4 Central Bins",
                    "agency": "Urban Services Department",
                    "impact": "Resolves ongoing odor complaints, recovers clean sanitary scores",
                    "cost": "$4,500 (Truck and crew dispatch)",
                    "priority": "High",
                    "action": "Direct secondary dump lifters and sanitizing scrubbers to clear Sectors."
                }
            ]
        }

    def get_simulation_fallback(self, name: str, description: str) -> Dict[str, Any]:
        name_lower = name.lower()
        if "bus" in name_lower or "transit" in name_lower:
            return {
                "trafficReduction": 18, "emissionSavings": 14, "citizenSatisfactionDelta": 10, "wasteEfficiencyDelta": 0,
                "financialCostEstimate": "$85,000 (Fleet leasing + Operator salaries)",
                "pros": ["Lowers peak single-passenger vehicular volume", "Reduces commuter gridlock"],
                "cons": ["Slight transit capital balance strain"],
                "detailedAnalysis": "Adding dedicated lines successfully pulls light vehicles off active highways, creating high rapid-access commuting indices."
            }
        elif "waste" in name_lower or "bin" in name_lower:
            return {
                "trafficReduction": 0, "emissionSavings": 5, "citizenSatisfactionDelta": 8, "wasteEfficiencyDelta": 25,
                "financialCostEstimate": "$40,000 (Bin telemetry installation)",
                "pros": ["Prevents urban dumpster spills", "Optimizes garbage route trucks"],
                "cons": ["Demands constant cellular coverage across devices"],
                "detailedAnalysis": "Integrating solar-compress elements scales total garbage carrying threshold, preventing secondary neighborhood rodent spikes."
            }
        else:
            return {
                "trafficReduction": 15, "emissionSavings": 8, "citizenSatisfactionDelta": 6, "wasteEfficiencyDelta": 5,
                "financialCostEstimate": "$135,000 (Smart urban sensors)",
                "pros": ["Improves responsive city metrics", "Transparent citizen data reports"],
                "cons": ["Deployment capital requirements"],
                "detailedAnalysis": "Predictive algorithms optimize general municipality corridors, resolving minor bottle-necks but requiring budget reallocation."
            }

    def get_chat_fallback(self, message: str) -> str:
        msg_lower = message.lower()
        if "garbage" in msg_lower or "dumpster" in msg_lower or "waste" in msg_lower:
            return "Our logs show high waste density near Ward 3 market. A cleaning squad has been routed to bin Sector-4. Would you like me to file a Priority Collection Ticket?"
        elif "traffic" in msg_lower or "light" in msg_lower or "road" in msg_lower:
            return "Expressway Crossing (Ward 1) is currently reporting severe delays of ~35 minutes. An automated signal timing override holds green lanes longer. I can file an electrical signal inspection for you if you'd like."
        return "I am CIVITAS AI Citizen Copilot. Ask me about road queues, AQI hazards, reported potholes, or central city statistics."

# Export unified singleton instance
ai_agents = AgentCoordinatingCenter()
