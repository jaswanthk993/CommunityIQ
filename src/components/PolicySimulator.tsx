import React from "react";
import { SimulationResult } from "../types";
import { Sliders, HelpCircle, AlertCircle, ArrowUpRight, ArrowDownRight, Compass, ThumbsUp, ThumbsDown, DollarSign } from "lucide-react";

interface PolicySimulatorProps {
  loading: boolean;
  onRunSimulation: (policy: { name: string; description: string }) => void;
  simulationResult: SimulationResult | null;
}

export default function PolicySimulator({
  loading,
  onRunSimulation,
  simulationResult
}: PolicySimulatorProps) {
  const [customName, setCustomName] = React.useState("");
  const [customDesc, setCustomDesc] = React.useState("");

  const presets = [
    {
      name: "Fleet Fleet Transit Upgrade",
      desc: "Deploy 12 low-emission electric buses across Route 12 on Zone 1 to replace old commuter models.",
    },
    {
      name: "Smart Solar Trash Compressors",
      desc: "Install solar-powered compacting trash containers with dynamic cellular telemetry sensors in Zone 4.",
    },
    {
      name: "Neural Signal Timing Calibration",
      desc: "Upgrade critical express lane intersections in Ward 3 to camera-based adaptive green phase synchronization.",
    },
    {
      name: "Industrial Dust Canopy Bioswales",
      desc: "Instruct perimeter mist cannons and plant thermal cooling trees around heavy construction sites on Zone 2.",
    }
  ];

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onRunSimulation({
      name: customName,
      description: customDesc
    });
  };

  const selectPreset = (p: typeof presets[0]) => {
    setCustomName(p.name);
    setCustomDesc(p.desc);
    onRunSimulation({ name: p.name, description: p.desc });
  };

  const handlePresetKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % presets.length;
      document.getElementById(`preset-btn-${nextIndex}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + presets.length) % presets.length;
      document.getElementById(`preset-btn-${prevIndex}`)?.focus();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg shadow-black/15 flex flex-col h-full text-white" id="decision-simulator-panel">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-white/5 text-blue-400 border border-white/10 shadow-inner rounded-xl animate-pulse">
          <Sliders size={20} />
        </div>
        <div>
          <h3 className="font-sans font-semibold tracking-tight text-white text-base">Municipal Action Intervention Simulator</h3>
          <p className="font-mono text-xs text-slate-400">Vertex AI Forecasting Sandbox • Predict policy outcomes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        {/* Intervention Setup form & presets (LHS) */}
        <div className="xl:col-span-5 space-y-4">
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">Intervention Templates</h4>
            <div className="grid grid-cols-1 gap-2" role="group" aria-label="Intervention preset templates">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPreset(p)}
                  onKeyDown={(e) => handlePresetKeyDown(e, idx)}
                  aria-pressed={customName === p.name}
                  aria-label={`Load preset template: ${p.name}`}
                  className={`p-3 text-left border rounded-2xl transition-all duration-200 cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none ${
                    customName === p.name 
                      ? "border-indigo-500/50 bg-indigo-500/10 text-white font-medium" 
                      : "border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                  id={`preset-btn-${idx}`}
                >
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">Configure Custom Intervention</h4>
            <form onSubmit={handleSubmitCustom} className="space-y-3" aria-label="Custom policy simulator configuration">
              <div>
                <label htmlFor="custom-policy-name-input" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Proposal Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Increase temporary sanitation trucks"
                  className="w-full px-3 py-2 text-xs bg-black/20 border border-white/10 rounded-xl placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-505/50 focus:ring-offset-2 focus:ring-offset-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500"
                  id="custom-policy-name-input"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="custom-policy-desc-textarea" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Intervention description</label>
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="e.g. Introduce three on-demand garbage trucks on the main weekend market cycle."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-black/20 border border-white/10 rounded-xl placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-505/50 focus:ring-offset-2 focus:ring-offset-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                  id="custom-policy-desc-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !customName.trim()}
                id="run-simulation-btn"
                aria-busy={loading}
                aria-label={loading ? "Calculating forecast matrix" : "Launch Impact Simulation"}
                className="w-full py-2.5 text-xs text-center font-sans font-semibold text-white bg-indigo-600 border border-indigo-400/20 rounded-xl hover:bg-indigo-500 hover:shadow-indigo-600/20 shadow-lg active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-550/50 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Calculating forecast matrix..." : "Launch Impact Simulation"}
              </button>
            </form>
          </div>
        </div>

        {/* Prediction Outputs (RHS) */}
        <div className="xl:col-span-7 flex flex-col justify-between">
          {simulationResult ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Estimated Project Budget</h4>
                  <span className="text-xl font-mono font-bold text-white tracking-tight flex items-center gap-1 mt-0.5" id="sim-financial-cost">
                    <DollarSign size={18} className="text-blue-400" /> {simulationResult.financialCostEstimate}
                  </span>
                </div>
                <span className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/15 text-emerald-300 rounded-full font-mono text-[9px] font-bold uppercase shadow-sm">
                  ✓ High Feasibility
                </span>
              </div>

              {/* Dynamic indicators bars mapping */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Anticipated Metric Delta Forecasts</h4>

                {/* Traffic impact */}
                <div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-slate-300 font-sans">Traffic Congestion Reduction</span>
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <ArrowDownRight size={14} /> {simulationResult.trafficReduction}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50" 
                      style={{ width: `${simulationResult.trafficReduction}%` }} 
                    />
                  </div>
                </div>

                {/* AQI/Emission reduction */}
                <div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-slate-300 font-sans">Urban Emission reduction</span>
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <ArrowDownRight size={14} /> {simulationResult.emissionSavings}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50" 
                      style={{ width: `${simulationResult.emissionSavings}%` }} 
                    />
                  </div>
                </div>

                {/* Waste containment increase */}
                <div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-slate-300 font-sans">Waste Collection Efficiency Increase</span>
                    <span className="font-mono text-blue-400 font-bold flex items-center gap-0.5">
                      <ArrowUpRight size={14} /> +{simulationResult.wasteEfficiencyDelta}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full shadow-lg shadow-blue-500/50" 
                      style={{ width: `${simulationResult.wasteEfficiencyDelta}%` }} 
                    />
                  </div>
                </div>

                {/* Satisfaction Delta */}
                <div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-slate-300 font-sans">Public Support Index Delta</span>
                    <span className="font-mono text-blue-400 font-bold flex items-center gap-0.5">
                      <ArrowUpRight size={14} /> +{simulationResult.citizenSatisfactionDelta}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full shadow-lg shadow-blue-500/50" 
                      style={{ width: `${Math.min(100, Math.abs(simulationResult.citizenSatisfactionDelta * 5))}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Qualitative Pros & Cons section */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold font-mono uppercase mb-1.5">
                    <ThumbsUp size={12} /> Strategic Advantages
                  </span>
                  <ul className="space-y-1">
                    {simulationResult.pros.map((pro, index) => (
                      <li key={index} className="text-[10px] text-slate-300 leading-tight flex items-start gap-1">
                        <span className="text-emerald-400">✔</span> <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                  <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold font-mono uppercase mb-1.5">
                    <ThumbsDown size={12} className="text-slate-400" /> Operational Friction
                  </span>
                  <ul className="space-y-1">
                    {simulationResult.cons.map((con, index) => (
                      <li key={index} className="text-[10px] text-slate-300 leading-tight flex items-start gap-1">
                        <span className="text-amber-400">⚠</span> <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Dense Analysis Paragraph */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <h5 className="text-[10px] font-mono text-slate-450 uppercase tracking-widest mb-1 font-bold">Predictive Planners Assessment</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{simulationResult.detailedAnalysis}</p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/20 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3.5 h-full bg-white/5 min-h-[300px]">
              <Compass size={32} className="text-slate-450 animate-spin-slow" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Predictive Intelligence Sandbox</p>
                <p className="text-xs text-slate-400 max-w-[340px] mx-auto mt-1">Select an intervention blueprint template from the LHS panel or write a custom municipal policy directive to simulate systemic indicator shifts before real-world deployment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

