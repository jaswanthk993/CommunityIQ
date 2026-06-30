import React from "react";
import { RecommendationsResponse, MasterPlanItem } from "../types";
import { Cpu, TrafficCone, Leaf, MessageSquareCode, ShieldAlert, Sparkles, AlertCircle, ChevronDown, ChevronUp, DollarSign, Activity, CheckSquare } from "lucide-react";

interface AgentControlCenterProps {
  loading: boolean;
  onTriggerAgents: () => void;
  agentData: RecommendationsResponse | null;
  onResolveIncident: (id: number) => void;
}

export default function AgentControlCenter({
  loading,
  onTriggerAgents,
  agentData,
  onResolveIncident
}: AgentControlCenterProps) {
  const [expandedAgent, setExpandedAgent] = React.useState<string | null>("traffic");

  const toggleAgent = (slug: string) => {
    setExpandedAgent(expandedAgent === slug ? null : slug);
  };

  const handleAgentKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentSlug: string) => {
    const agentsList = ["traffic", "environment", "service", "emergency", "health", "economic"];
    const currentIndex = agentsList.indexOf(currentSlug);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % agentsList.length;
      document.getElementById(`toggle-${agentsList[nextIndex]}-agent`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + agentsList.length) % agentsList.length;
      document.getElementById(`toggle-${agentsList[prevIndex]}-agent`)?.focus();
    }
  };

  const getPriorityStyles = (prio: string) => {
    switch (prio.toLowerCase()) {
      case "critical":
        return "bg-red-500/15 text-red-300 border-red-500/25";
      case "high":
        return "bg-amber-500/15 text-amber-300 border-amber-500/25";
      default:
        return "bg-white/10 text-slate-300 border-white/10";
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg shadow-black/15 flex flex-col h-full text-white" id="adk-autonomous-agents-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/5 rounded-xl text-blue-400 border border-white/10 shadow-inner">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="font-sans font-semibold tracking-tight text-white text-base">Multi-Agent Decision System (ADK)</h3>
              <p className="font-mono text-xs text-slate-400">Coordinating autonomous municipal analytical agents</p>
            </div>
          </div>
        </div>

        <button
          onClick={onTriggerAgents}
          disabled={loading}
          id="trigger-multi-agents-btn"
          aria-busy={loading}
          aria-label="Trigger joint agent review of current city parameters"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-505 disabled:opacity-50 text-white font-sans text-sm font-semibold transition-all shadow-lg hover:shadow-indigo-600/20 border border-indigo-400/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 self-start cursor-pointer md:self-auto"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Querying City Agents...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Trigger Joint Agent Review</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Agent Thinking Monitors (LHS) */}
        <div className="lg:col-span-5 space-y-3" role="tablist" aria-label="Deployed AI Agents List">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Deployed AI Agents Status</h4>

          {/* Theme Clustering Agent card */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm shadow-inner transition-all">
            <button 
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              onClick={() => toggleAgent("theme")}
              onKeyDown={(e) => handleAgentKeyDown(e, "theme")}
              aria-expanded={expandedAgent === "theme"}
              aria-controls="agent-panel-theme"
              aria-label="Toggle Theme Clustering Agent details"
              id="toggle-theme-agent"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-orange-500/15 text-orange-400 rounded-lg">
                  <MessageSquareCode size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Theme Clustering Agent</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">● ACTIVE • GROUPING CITIZEN VOICES</p>
                </div>
              </div>
              {expandedAgent === "theme" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {expandedAgent === "theme" && (
              <div 
                id="agent-panel-theme"
                role="region"
                aria-labelledby="toggle-theme-agent"
                className="p-3 bg-black/40 font-mono text-[11px] text-slate-300 border-t border-white/10 max-h-40 overflow-y-auto leading-relaxed"
              >
                {agentData ? (
                  agentData.themeClusteringAgentReport
                ) : (
                  <span className="text-slate-500 italic">No compile session active. Trigger joint review above to compile logs.</span>
                )}
              </div>
            )}
          </div>

          {/* Cross-Reference Agent card */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm shadow-inner transition-all">
            <button 
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              onClick={() => toggleAgent("crossref")}
              onKeyDown={(e) => handleAgentKeyDown(e, "crossref")}
              aria-expanded={expandedAgent === "crossref"}
              aria-controls="agent-panel-crossref"
              aria-label="Toggle Cross-Reference Agent details"
              id="toggle-crossref-agent"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-sky-500/15 text-sky-400 rounded-lg">
                  <Activity size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Cross-Reference Agent</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">● ACTIVE • VALIDATING DEMAND</p>
                </div>
              </div>
              {expandedAgent === "crossref" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {expandedAgent === "crossref" && (
              <div 
                id="agent-panel-crossref"
                role="region"
                aria-labelledby="toggle-crossref-agent"
                className="p-3 bg-black/40 font-mono text-[11px] text-slate-300 border-t border-white/10 max-h-40 overflow-y-auto leading-relaxed"
              >
                {agentData ? (
                  agentData.crossReferenceAgentReport
                ) : (
                  <span className="text-slate-500 italic">No compile session active. Trigger joint review above to compile logs.</span>
                )}
              </div>
            )}
          </div>

          {/* Priority Ranking Agent card */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm shadow-inner transition-all">
            <button 
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              onClick={() => toggleAgent("priority")}
              onKeyDown={(e) => handleAgentKeyDown(e, "priority")}
              aria-expanded={expandedAgent === "priority"}
              aria-controls="agent-panel-priority"
              aria-label="Toggle Priority Ranking Agent details"
              id="toggle-priority-agent"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Priority Ranking Agent</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">● ACTIVE • SCORING PROJECTS</p>
                </div>
              </div>
              {expandedAgent === "priority" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {expandedAgent === "priority" && (
              <div 
                id="agent-panel-priority"
                role="region"
                aria-labelledby="toggle-priority-agent"
                className="p-3 bg-black/40 font-mono text-[11px] text-slate-300 border-t border-white/10 max-h-40 overflow-y-auto leading-relaxed"
              >
                {agentData ? (
                  agentData.priorityRankingAgentReport
                ) : (
                  <span className="text-slate-500 italic">No compile session active. Trigger joint review above to compile logs.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Master Priority Action Plan (RHS) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Final Ranked Development Priorities</h4>

            {agentData?.masterPlan ? (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {agentData.masterPlan.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all bg-white/5 flex flex-col justify-between gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white/10">
                    <p className="text-sm text-slate-200 font-sans leading-relaxed">
                      <strong>{item.title}</strong> — {item.ward} — {item.mentions} citizen mentions — cross-referenced against {item.dataset} — Priority Score: {item.score}/10 — Recommended action: {item.action}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/20 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 h-[250px] bg-white/5">
                <AlertCircle size={24} className="text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">Joint Assessment Complete - Decision Awaiting Execution</p>
                  <p className="text-[11px] text-slate-400 max-w-[300px] mx-auto mt-1">Click the 'Trigger Joint Agent Review' button above to consolidate and review current urban metrics into executable plans</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <Activity className="text-blue-400 shrink-0" size={18} />
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong>Autonomous Execution Triage</strong>: Compiles unstructured municipal telemetry and community feedback queues directly to generate ready-to-sign tactical command cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

