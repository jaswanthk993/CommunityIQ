import os
import streamlit as st
import requests
import json
from datetime import datetime
import time

# Local module imports
from frontend.components.maps import render_interactive_svg_map

# Setup absolute styling properties
st.set_page_config(
    page_title="CIVITAS AI • City OS v2.0",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Dark slate premium CSS theme injection
st.markdown("""
<style>
    /* Global styles overrides */
    .stApp {
        background-color: #030712;
        color: #f1f5f9;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Header Container styling */
    .header-container {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1.5rem 0;
        margin-bottom: 2rem;
    }
    
    /* Custom panel container */
    .custom-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    }
    
    /* Segment headers */
    .section-title {
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        color: #ffffff;
        margin-bottom: 0.25rem;
    }
    
    .section-subtitle {
        font-size: 0.75rem;
        font-weight: 500;
        color: #94a3b8;
        font-family: monospace;
        margin-bottom: 1rem;
    }
    
    /* Interactive metric displays */
    .metric-value {
        font-size: 1.875rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1;
        margin-bottom: 0.25rem;
    }
    
    .metric-title {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
        font-family: monospace;
    }
    
    /* Custom buttons and tabs styling */
    div.stButton > button {
        background: #4f46e5;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        font-size: 0.8rem;
        padding: 0.5rem 1rem;
        font-weight: 600;
        transition: all 0.2s;
        cursor: pointer;
    }
    div.stButton > button:hover {
        background: #4338ca;
        border-color: #4f46e5;
    }
</style>
""", unsafe_allow_value=True)

# Centralized Port Binding config
API_HOST = "http://localhost:8000"

# Fetch metrics wrapper
def fetch_api_status():
    try:
        r = requests.get(f"{API_HOST}/api/status")
        if r.status_code == 200 and r.json().get("success"):
            return r.json().get("data")
    except Exception as e:
        st.error(f"Cannot sync with Civitas API database: {e}")
    return None

# --- SESSION INITIALIZATION ---
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "agent_outputs" not in st.session_state:
    st.session_state.agent_outputs = None
if "simulation_result" not in st.session_state:
    st.session_state.simulation_result = None

# Pull freshest backend records
data = fetch_api_status()

if not data:
    # Set fallback default data state to align interface
    data = {
        "aggregates": {
            "trafficCongestionIndex": 56,
            "airQualityAQI": 102,
            "wasteManagementEfficiency": 74,
            "waterUtilityFailRate": 7,
            "citizenSatisfaction": 68,
            "activeAlertsCount": 3,
            "lastUpdate": datetime.now().isoformat()
        },
        "zones": [
            {"id": "zone-1", "name": "Zone 1 (Downtown)", "trafficIndex": 78, "airQualityAQI": 92, "wasteBuildupIndex": 64, "waterUtilityFailRate": 4, "activeAlerts": ["Market Waste Overflow"]},
            {"id": "zone-2", "name": "Zone 2 (Industrial)", "trafficIndex": 52, "airQualityAQI": 168, "wasteBuildupIndex": 35, "waterUtilityFailRate": 15, "activeAlerts": ["Soot PM2.5"]},
            {"id": "zone-3", "name": "Zone 3 (Residential)", "trafficIndex": 28, "airQualityAQI": 42, "wasteBuildupIndex": 25, "waterUtilityFailRate": 1, "activeAlerts": []},
            {"id": "zone-4", "name": "Zone 4 (Port Delta)", "trafficIndex": 67, "airQualityAQI": 110, "wasteBuildupIndex": 71, "waterUtilityFailRate": 8, "activeAlerts": ["Port Waste Backlog"]}
        ],
        "complaints": [
            {"id": 1, "ward": "Ward 3", "category": "Waste Management", "title": "Overflow dumpster Sector-4", "status": "Pending", "priority": "High", "reportedAt": datetime.now().isoformat(), "replies": []}
        ]
    }

aggregates = data.get("aggregates")
zones = data.get("zones")
complaints = data.get("complaints")

# 1. Header component
with st.container():
    col_logo, col_title, col_clock, col_profile = st.columns([1, 6, 2, 1])
    with col_logo:
        st.markdown("""
        <div style="background: #4f46e5; border-radius: 16px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4); margin-top:0.4rem;">
            <span style="font-size: 24px; color: white;">🛡️</span>
        </div>
        """, unsafe_allow_value=True)
    with col_title:
        st.markdown(f"""
        <div style="margin-top: 0.1rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <h1 style="font-size: 1.4rem; font-weight: 800; color: #ffffff; margin: 0; line-height: 1;">CIVITAS AI</h1>
                <span style="background: rgba(79, 70, 229, 0.15); border: 1px solid rgba(79, 70, 229, 0.4); border-radius: 4px; padding: 2px 6px; font-size: 9px; font-family: monospace; font-weight: bold; color: #a5b4fc; float: left;">CITY OS v2.0 (PYTHON)</span>
            </div>
            <p style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0 0; font-weight: 500;">Autonomous Digital Twin & Decision Intelligence Platform • <i>Simulate tomorrow. Decide today.</i></p>
        </div>
        """, unsafe_allow_value=True)
    with col_clock:
        city_time = datetime.now().strftime("%I:%M:%S %p")
        st.markdown(f"""
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 8px 12px; text-align: center; margin-top: 0.4rem;">
            <div style="font-family: monospace; font-size: 0.8rem; font-weight: 700; color: #e2e8f0;">🕒 {city_time}</div>
            <div style="font-size: 0.55rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Local Node Ticker</div>
        </div>
        """, unsafe_allow_value=True)
    with col_profile:
        st.markdown("""
        <div style="display: flex; justify-content: flex-end; align-items: center; height:100%; margin-top:0.3rem;">
            <div style="background: rgba(79, 70, 229, 0.2); border: 1px solid rgba(79, 70, 229, 0.4); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; color:#a5b4fc;" title="Logged in as Auditor">
                JK
            </div>
        </div>
        """, unsafe_allow_value=True)

st.markdown("<hr style='margin: 0.8rem 0; opacity: 0.15;' />", unsafe_allow_value=True)

# 2. Metric indicators row (MetricCards.tsx Equivalent)
cols = st.columns(5)
metrics_config = [
    {"label": "Traffic Congestion", "value": f"{aggregates['trafficCongestionIndex']}%", "sub": "Arterial gridlock", "crit": aggregates['trafficCongestionIndex'] > 65},
    {"label": "Air Quality (PM2.5)", "value": f"{aggregates['airQualityAQI']} AQI", "sub": "Localized particulates", "crit": aggregates['airQualityAQI'] > 120},
    {"label": "Waste Bin Efficiency", "value": f"{aggregates['wasteManagementEfficiency']}%", "sub": "Throughput clear rate", "crit": aggregates['wasteManagementEfficiency'] < 70},
    {"label": "Utility Outage Rate", "value": f"{aggregates['waterUtilityFailRate']}%", "sub": "Potable pressure fails", "crit": aggregates['waterUtilityFailRate'] > 10},
    {"label": "Citizen Satisfaction", "value": f"{aggregates['citizenSatisfaction']}%", "sub": "Active support rating", "crit": aggregates['citizenSatisfaction'] < 60}
]

for idx, metric in enumerate(metrics_config):
    with cols[idx]:
        glow_color = "rgba(239, 68, 68, 0.08)" if metric["crit"] else "rgba(255, 255, 255, 0.02)"
        border_color = "rgba(239, 68, 68, 0.3)" if metric["crit"] else "rgba(255, 255, 255, 0.08)"
        glow_dot_visible = "inline-flex" if metric["crit"] else "none"
        
        st.markdown(f"""
        <div style="background: {glow_color}; border: 1px solid {border_color}; border-radius: 16px; padding: 12px 16px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="metric-title" style="float: left;">{metric['label']}</span>
                <span style="display: {glow_dot_visible}; width: 6px; height: 6px; border-radius: 50%; background-color: #ef4444; position: absolute; top: 12px; right: 12px; box-shadow: 0 0 8px #ef4444;"></span>
            </div>
            <div class="metric-value" style="margin-top: 4px;">{metric['value']}</div>
            <div style="font-size: 0.65rem; color: #64748b;">{metric['sub']}</div>
        </div>
        """, unsafe_allow_value=True)

st.markdown("<br/>", unsafe_allow_value=True)

# 3. Main content splits: GIS map on left, interaction tabs on right
col_map, col_portal = st.columns([6, 5])

with col_map:
    st.markdown("""
    <div class="section-title">🛡️ Spatial Telemetry Network</div>
    <div class="section-subtitle">Tactical active vector overview • WebSockets Online</div>
    """, unsafe_allow_value=True)
    
    # Render interactive map component!
    map_html = render_interactive_svg_map(zones, complaints)
    st.components.v1.html(map_html, height=340)

with col_portal:
    st.markdown("""
    <div class="section-title">💬 Citizen Action Hub</div>
    <div class="section-subtitle">Real-time engagement portal</div>
    """, unsafe_allow_value=True)
    
    tab_chat, tab_report, tab_tickets = st.tabs(["💬 Copilot", "⚠️ Report Incident", "🗄️ Public Database"])
    
    with tab_chat:
        st.write("Ask about road congestion, trash overflows, or incident ETAs:")
        
        # Draw previous messages
        chat_box = st.container()
        with chat_box:
            for item in st.session_state.chat_history:
                avatar = "🧑‍💻" if item["role"] == "user" else "⚙️"
                with st.chat_message(item["role"], avatar=avatar):
                    st.write(item["text"])
                    
        # Send dynamic msg
        user_msg = st.chat_input("Ask CIVITAS Copilot...", key="user_copilot_input")
        if user_msg:
            # Append local user
            st.session_state.chat_history.append({"role": "user", "text": user_msg})
            
            with st.spinner("Consulting Central AI logs..."):
                try:
                    payload = {"message": user_msg, "chatHistory": st.session_state.chat_history}
                    res = requests.post(f"{API_HOST}/api/copilot/chat", json=payload)
                    if res.status_code == 200 and res.json().get("success"):
                        reply = res.json().get("data").get("reply")
                        st.session_state.chat_history.append({"role": "copilot", "text": reply})
                        st.experimental_rerun()
                except Exception as e:
                    st.session_state.chat_history.append({
                        "role": "copilot",
                        "text": f"Error linking with core: {e}. Check server status."
                    })
                    st.experimental_rerun()
                    
    with tab_report:
        st.write("Flag municipal services directly:")
        with st.form("new_incident_submission", clear_on_submit=True):
            f_title = st.text_input("Incident Title", placeholder="e.g. Ruptured water line")
            col_opts1, col_opts2 = st.columns(2)
            with col_opts1:
                f_ward = st.selectbox("Ward Area", ["Ward 1 (Industrial North)", "Ward 2 (Residential East)", "Ward 3 (Downtown Central)", "Ward 4 (South Delta)"])
            with col_opts2:
                f_cat = st.selectbox("Category", ["Waste Management", "Traffic & Roads", "Environmental Hazard", "Water & Utilities"])
            f_details = st.text_area("Detailed Findings / Logs")
            
            submit_ticket = st.form_submit_button("Submit Alarm Ticket")
            if submit_ticket:
                if f_title and f_details:
                    payload = {
                        "ward": f_ward, "category": f_cat,
                        "title": f_title, "details": f_details
                    }
                    try:
                        res = requests.post(f"{API_HOST}/api/report", json=payload)
                        if res.status_code == 200 and res.json().get("success"):
                            st.success("Ticket filed! Alert mapped.")
                            time.sleep(1)
                            st.experimental_rerun()
                    except Exception as e:
                        st.error(f"Cannot dispatch report: {e}")
                else:
                    st.warning("Please fill all properties.")
                    
    with tab_tickets:
        st.write("Active database ticket queue:")
        for c in complaints:
            status_color = "🔴" if c["status"] == "Pending" else "🟡" if c["status"] == "In Progress" else "🟢"
            with st.expander(f"{status_color} {c['priority']} - {c['title']} ({c['category']})"):
                st.write(f"**Ward:** {c['ward']}")
                st.write(f"**Logs:** {c['details']}")
                if c.get("replies"):
                    st.markdown("**Remediation logs:**")
                    for r in c.get("replies", []):
                        st.write(f"- {r}")
                
                if c["status"] != "Resolved":
                    if st.button(f"Command Resolution (Ticket #{c['id']})", key=f"res_{c['id']}"):
                        try:
                            res = requests.post(f"{API_HOST}/api/complaints/{c['id']}/resolve")
                            if res.status_code == 200 and res.json().get("success"):
                                st.success(f"Incident #{c['id']} Resolved!")
                                time.sleep(1)
                                st.experimental_rerun()
                        except Exception as e:
                            st.error(f"Error command: {e}")

st.markdown("<hr style='margin: 1.5rem 0; opacity: 0.15;' />", unsafe_allow_value=True)

# 4. Agent Control Center Module (AgentControlCenter.tsx equivalent)
st.markdown("""
<div class="section-title">🗳️ Autonomous Multi-Agent Coordination Center</div>
<div class="section-subtitle">Tracks joint thinking logs across deployed AI modules</div>
""", unsafe_allow_value=True)

col_run, col_plan = st.columns([5, 6])

with col_run:
    st.write("Demand a complete municipal-wide audit session:")
    if st.button("Trigger Joint Multi-Agent Review", key="run_agents_coordination"):
        with st.spinner("Coordinating ADK Sub-agent states..."):
            try:
                res = requests.post(f"{API_HOST}/api/recommendations")
                if res.status_code == 200 and res.json().get("success"):
                    st.session_state.agent_outputs = res.json().get("data")
                    st.success("Audit complete!")
            except Exception as e:
                st.error(f"Failed coordinate: {e}")

    # Draw individual agent monitors
    if st.session_state.agent_outputs:
        agent_data = st.session_state.agent_outputs
        
        with st.expander("Traffic Intelligent Agent Monitor"):
            st.code(agent_data.get("trafficAgentReport", "Initializing..."))
        with st.expander("Environment Watch Agent Monitor"):
            st.code(agent_data.get("environmentAgentReport", "Initializing..."))
        with st.expander("Public Service Triage Agent Monitor"):
            st.code(agent_data.get("serviceAgentReport", "Initializing..."))
        with st.expander("Critical Emergency Dispatch Agent Monitor"):
            st.code(agent_data.get("emergencyAgentReport", "Initializing..."))
    else:
        st.info("Trigger a review session above to view active agent thinking monitors.")

with col_plan:
    st.write("**Master Coordinated Action Plan:**")
    if st.session_state.agent_outputs:
        plan_list = st.session_state.agent_outputs.get("masterPlan", [])
        for p in plan_list:
            priority_pill = "🔴 Critical" if p["priority"] == "Critical" else "🟡 High" if p["priority"] == "High" else "🔵 Medium"
            st.markdown(f"""
            <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #4f46e5; padding: 12px; border-radius: 4px; margin-bottom: 8px;">
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <b style="color:white; font-size: 0.85rem;">{p['title']}</b>
                    <span style="font-size: 0.7rem; font-family: monospace; background:rgba(255,255,255,0.05); padding: 2px 6px; border-radius:4px;">{p['cost']}</span>
                </div>
                <p style="font-size:0.75rem; color:#94a3b8; margin: 4px 0;">{p['action']}</p>
                <div style="display:flex; justify-content: space-between; font-size:0.65rem; color:#64748b; font-family: monospace;">
                    <span>Impact: {p['impact']}</span>
                    <span>Priority: {priority_pill}</span>
                </div>
            </div>
            """, unsafe_allow_value=True)
    else:
        st.markdown("""
        <div style="background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.1); border-radius:12px; height: 180px; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:0.8rem;">
            Awaiting Multi-Agent session sync...
        </div>
        """, unsafe_allow_value=True)

st.markdown("<hr style='margin: 1.5rem 0; opacity: 0.15;' />", unsafe_allow_value=True)

# 5. Policy Interventions Simulator Sandbox (PolicySimulator.tsx equivalent)
st.markdown("""
<div class="section-title">🎛️ Policy Interventions Simulator Sandbox</div>
<div class="section-subtitle">Test strategic interventions and forecast dynamic municipal changes</div>
""", unsafe_allow_value=True)

col_pol_input, col_pol_out = st.columns([5, 6])

presets = [
    {"name": "Dynamic Transit Frequency Calibration", "desc": "Double public commuter bus fleet frequency during peak traffic corridors to reduce congestion indexes."},
    {"name": "Autonomous Waste Routing Protocols", "desc": "Configure dynamic trash routes checking telemetry weights to prioritize commercial dumpsites."},
    {"name": "Adaptive Congestion Corridors", "desc": "Establish variable toll tariffs across primary industrial border zones during air quality particulate warning spikes."}
]

with col_pol_input:
    st.write("Intervention Presets:")
    col_pre_btn = st.columns(3)
    preset_chosen = None
    for idx, p in enumerate(presets):
        with col_pre_btn[idx]:
            if st.button(p["name"], key=f"pre_{idx}"):
                preset_chosen = p
                
    st.markdown("**Customize Intervention:**")
    with st.form("custom_policy_form"):
        p_name = st.text_input("Proposal Name", value=preset_chosen["name"] if preset_chosen else "", placeholder="e.g. Increase temporary sanitation trucks")
        p_desc = st.text_area("Proposal Details", value=preset_chosen["desc"] if preset_chosen else "", placeholder="Details outlining planning constraints...")
        
        sim_submit = st.form_submit_button("Launch Impact Simulation")
        if sim_submit:
            if p_name and p_desc:
                with st.spinner("Calculating forecast matrix..."):
                    try:
                        payload = {
                            "policyName": p_name,
                            "policyDescription": p_desc,
                            "currentSatisfaction": aggregates["citizenSatisfaction"]
                        }
                        res = requests.post(f"{API_HOST}/api/simulate", json=payload)
                        if res.status_code == 200 and res.json().get("success"):
                            st.session_state.simulation_result = res.json().get("data")
                            st.success("Simulation complete!")
                    except Exception as e:
                        st.error(f"Failed simulate: {e}")
            else:
                st.warning("Please supply details.")

with col_pol_out:
    st.write("**Forecasted Indicator Matrix:**")
    if st.session_state.simulation_result:
        sim = st.session_state.simulation_result
        
        col_delta1, col_delta2, col_delta3, col_delta4 = st.columns(4)
        col_delta1.metric("Traffic reduction", f"-{sim.get('trafficReduction')}%", delta_color="normal")
        col_delta2.metric("Emission savings", f"-{sim.get('emissionSavings')}%", delta_color="normal")
        col_delta3.metric("Satisfaction delta", f"+{sim.get('citizenSatisfactionDelta')}%", delta_color="normal")
        col_delta4.metric("Waste clearance delta", f"+{sim.get('wasteEfficiencyDelta')}%", delta_color="normal")
        
        st.markdown(f"**Budget Estimate:** `{sim.get('financialCostEstimate')}`")
        
        col_pro, col_con = st.columns(2)
        with col_pro:
            st.markdown("<b style='color:#34d399;'>Pros / Benefits:</b>", unsafe_allow_value=True)
            for item in sim.get("pros", []):
                st.write(f"✅ {item}")
        with col_con:
            st.markdown("<b style='color:#f87171;'>Cons / Risks:</b>", unsafe_allow_value=True)
            for item in sim.get("cons", []):
                st.write(f"❌ {item}")
                
        st.markdown("**Planning Report:**")
        st.write(sim.get("detailedAnalysis"))
    else:
        st.markdown("""
        <div style="background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.1); border-radius:12px; height: 260px; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:0.8rem;">
            Awaiting simulation forecast launch...
        </div>
        """, unsafe_allow_value=True)

st.markdown("<br/><br/>", unsafe_allow_value=True)

# Footer
st.markdown("""
<div style="border-t: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; text-align: center; font-family: monospace; font-size: 0.65rem; color: #4b5563;">
    CIVITAS AI • Powered by Google Cloud Run, FastAPI, Streamlit, DuckDB & Gemini 2.5 Pro<br/>
    Strict compliance with smart-city administrative telemetry protocols.
</div>
""", unsafe_allow_value=True)
