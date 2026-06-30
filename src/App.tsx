/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CityAggregates, ZoneMetric, Complaint, RecommendationsResponse, SimulationResult } from "./types";
import MetricCards from "./components/MetricCards";
import CityMap from "./components/CityMap";
import AgentControlCenter from "./components/AgentControlCenter";
import PolicySimulator from "./components/PolicySimulator";
import CitizenCopilot from "./components/CitizenCopilot";
import { Shield, Sparkles, Clock, RefreshCw, AlertTriangle, HelpCircle, Laptop } from "lucide-react";

export default function App() {
  const [aggregates, setAggregates] = React.useState<CityAggregates>({
    trafficCongestionIndex: 56,
    airQualityAQI: 102,
    wasteManagementEfficiency: 74,
    waterUtilityFailRate: 7,
    citizenSatisfaction: 68,
    activeAlertsCount: 3,
    lastUpdate: new Date().toISOString()
  });

  const [zones, setZones] = React.useState<ZoneMetric[]>([]);
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [activeZoneId, setActiveZoneId] = React.useState<string | null>(null);

  // Loading & Action states
  const [loadingStatus, setLoadingStatus] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingChat, setLoadingChat] = React.useState(false);
  const [loadingReport, setLoadingReport] = React.useState(false);
  const [loadingAgents, setLoadingAgents] = React.useState(false);
  const [loadingSimulation, setLoadingSimulation] = React.useState(false);

  // Chat memory
  const [chatHistory, setChatHistory] = React.useState<{ role: "user" | "copilot"; text: string; sources?: any[] }[]>([]);

  // AI Outputs state
  const [agentOutputs, setAgentOutputs] = React.useState<RecommendationsResponse | null>(null);
  const [simulationResult, setSimulationResult] = React.useState<SimulationResult | null>(null);

  // Error notifications
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Real-time ticking sensor mock stream
  const [sensorTicks, setSensorTicks] = React.useState({ hz: 44, pm: 85, traffic: 52 });

  // Current real client time clock
  const [cityTime, setCityTime] = React.useState("");

  // Retrieve current state from Express central database
  const loadPlatformData = async (isSilent = false) => {
    if (!isSilent) setLoadingStatus(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/status");
      const result = await res.json();
      if (result.success) {
        setAggregates(result.data.aggregates);
        setZones(result.data.zones);
        setComplaints(result.data.complaints);
      } else {
        throw new Error(result.error || "Failed to load database index.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Municipal database network offline. Displaying sandbox fallback state.");
    } finally {
      setLoadingStatus(false);
    }
  };

  // Tick local clocks and sensor stream mockup
  React.useEffect(() => {
    loadPlatformData();

    // Clock ticker local time
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCityTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Sensor ticker
    const sensorInterval = setInterval(() => {
      setSensorTicks({
        hz: Math.round(40 + Math.random() * 8),
        pm: Math.round(75 + Math.random() * 25),
        traffic: Math.round(45 + Math.random() * 15)
      });
    }, 4000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(sensorInterval);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlatformData(true);
    setRefreshing(false);
  };

  // Submit dynamic Citizen Copilot message
  const handleSendChat = async (message: string, language: string) => {
    const nextHistory = [...chatHistory, { role: "user" as const, text: message }];
    setChatHistory(nextHistory);
    setLoadingChat(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, chatHistory: nextHistory, language })
      });
      const result = await res.json();
      if (result.success) {
        setChatHistory([
          ...nextHistory,
          { role: "copilot", text: result.data.reply, sources: result.data.sources }
        ]);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(err);
      setChatHistory([
        ...nextHistory,
        { role: "copilot", text: "I'm having trouble connecting to the municipal core. Please test your Gemini API Key configuration." }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Submit direct incident report
  const handleFileReport = async (report: { ward: string; category: string; title: string; details: string; imagePreset: string }) => {
    setLoadingReport(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report)
      });
      const result = await res.json();
      if (result.success) {
        // Re-route to tickets list and refresh metrics
        await loadPlatformData(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Incident reporting transmission error.");
    } finally {
      setLoadingReport(false);
    }
  };

  // Trigger autonomous agent session
  const handleTriggerAgents = async () => {
    setLoadingAgents(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json();
      if (result.success) {
        setAgentOutputs(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Autonomous coordination sync error. Verify API status.");
    } finally {
      setLoadingAgents(false);
    }
  };

  // Simulate policy proposal outcome
  const handleRunSimulation = async (policy: { name: string; description: string }) => {
    setLoadingSimulation(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyName: policy.name,
          policyDescription: policy.description,
          currentSatisfaction: aggregates.citizenSatisfaction
        })
      });
      const result = await res.json();
      if (result.success) {
        setSimulationResult(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Prediction simulator sandbox offline.");
    } finally {
      setLoadingSimulation(false);
    }
  };

  // Admin incident resolution
  const handleResolveIncident = async (id: number) => {
    try {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: "POST"
      });
      const result = await res.json();
      if (result.success) {
        await loadPlatformData(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to command ticket resolution.");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-x-hidden select-none" id="communityiq-root-layout">
      {/* Premium ambient decorative blurred background orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* 1. Brand Command Header */}
      <header className="sticky top-0 z-40 bg-[#030712]/50 backdrop-blur-md border-b border-white/10 px-6 py-4 mr-0 shadow-lg shadow-black/10" id="central-platform-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Visual Brand Logo */}
            <div className="p-3 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25 border border-indigo-400/20">
              <Shield size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-extrabold text-lg tracking-tight text-white leading-none">CIVITAS AI</h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-sm">
                  Track 1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Built for Track 1 — People's Priorities: Helping MPs consolidate citizen feedback into ranked, data-backed development priorities.</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● Reduces grievance triage time from weeks to minutes across thousands of submissions.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap select-none">
            {/* Dynamic Clock Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 shadow-inner">
              <Clock size={14} className="text-slate-400 anim-pulse" />
              <span className="font-mono text-xs font-bold">{cityTime || "07:07:03 AM"}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Local</span>
            </div>

            {/* active alarms count pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/25 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-mono text-xs font-bold leading-none">{aggregates.activeAlertsCount}</span>
              <span className="text-[10px] font-sans font-semibold">Active Alarms</span>
            </div>

            {/* User profile identifier */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 flex items-center justify-center font-bold text-xs font-mono select-none shadow-sm" title="Logged in as Auditor">
                JK
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Stage container */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6 relative z-10" id="dashboard-content-main">
        {/* Network/Error notification bar */}
        {errorMessage && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl flex items-center gap-3 text-xs justify-between animate-fade-in" id="error-notification-banner">
            <span className="font-medium flex items-center gap-1.5">
              <AlertTriangle size={15} className="shrink-0" /> {errorMessage}
            </span>
            <button onClick={() => loadPlatformData()} className="text-amber-200 font-bold hover:underline font-mono">
              Retry Sync
            </button>
          </div>
        )}

        {/* 2. Highlighted top metric aggregator indicators */}
        <MetricCards 
          aggregates={aggregates} 
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* 3. Primary layout split: Interactive GIS Map & Citizen feedback portal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left panel (Citizen chat and ticket reporter) - 5 columns width */}
          <div className="lg:col-span-5 h-full">
            <CitizenCopilot 
              loadingChat={loadingChat}
              onSendChat={handleSendChat}
              chatHistory={chatHistory}
              loadingReport={loadingReport}
              onFileReport={handleFileReport}
              recentComplaints={complaints}
              activeZoneId={activeZoneId}
              onResolveIncident={handleResolveIncident}
            />
          </div>

          {/* Right panel (Tactical GIS active map) - 7 columns width */}
          <div className="lg:col-span-7 h-full">
            <CityMap 
              zones={zones}
              activeZoneId={activeZoneId}
              onSelectZone={setActiveZoneId}
              complaints={complaints}
              tempSensorStream={sensorTicks}
            />
          </div>
        </div>

        {/* 4. Autonomous multi-agent coordination panel */}
        <AgentControlCenter 
          loading={loadingAgents}
          onTriggerAgents={handleTriggerAgents}
          agentData={agentOutputs}
          onResolveIncident={handleResolveIncident}
        />

        {/* 5. Policy Interventions Simulator Sandbox environment */}
        <PolicySimulator 
          loading={loadingSimulation}
          onRunSimulation={handleRunSimulation}
          simulationResult={simulationResult}
        />
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-white/10 bg-black/40 py-8 mt-12 text-center text-xs text-slate-500 font-mono backdrop-blur-md" id="system-dashboard-footer">
        <p>CIVITAS AI • Powered by Google Cloud Vertex AI, AlloyDB & Agent Development Kit (ADK)</p>
        <p className="mt-1 opacity-70">Strict compliance with smart-city administrative telemetry protocols.</p>
      </footer>
    </div>
  );
}


