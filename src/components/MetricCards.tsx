import React from "react";
import { CityAggregates } from "../types";
import { TrafficCone, Leaf, Trash2, Droplets, Users, AlertCircle, RefreshCw } from "lucide-react";

interface MetricCardsProps {
  aggregates: CityAggregates;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function MetricCards({
  aggregates,
  onRefresh,
  refreshing
}: MetricCardsProps) {
  const secureAggregates = aggregates || {
    trafficCongestionIndex: 0,
    airQualityAQI: 0,
    wasteManagementEfficiency: 0,
    waterUtilityFailRate: 0,
    citizenSatisfaction: 0,
  };

  // Helpers for determining color codes
  const getTrafficStatus = (index: number) => {
    const val = index || 0;
    if (val > 75) return { text: "Heavy Jam", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (val > 50) return { text: "Stray Queues", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Fluid Flow", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getAQIStatus = (aqi: number) => {
    const val = aqi || 0;
    if (val > 150) return { text: "Unhealthy", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (val > 100) return { text: "Sensitive Warning", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Satisfactory", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getWasteStatus = (efficiency: number) => {
    const val = efficiency || 0;
    if (val < 60) return { text: "Critical Backlog", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (val < 80) return { text: "Busy Queues", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Optimal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getUtilityStatus = (rate: number) => {
    const val = rate || 0;
    if (val > 12) return { text: "High Outage Risk", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (val > 5) return { text: "Fluctuations", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Fully Stable", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="main-aggregates-row">
      {/* 1. Traffic Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg shadow-black/10 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-orange-500/15 rounded-2xl text-orange-400">
            <TrafficCone size={18} />
          </div>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${getTrafficStatus(secureAggregates.trafficCongestionIndex).color}`}>
            {getTrafficStatus(secureAggregates.trafficCongestionIndex).text}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Arterial Congestion</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">{secureAggregates.trafficCongestionIndex}%</span>
            <span className="text-xs text-slate-400">load</span>
          </div>
        </div>
      </div>

      {/* 2. Air Quality AQI */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg shadow-black/10 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-emerald-500/15 rounded-2xl text-emerald-400">
            <Leaf size={18} />
          </div>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${getAQIStatus(secureAggregates.airQualityAQI).color}`}>
            {getAQIStatus(secureAggregates.airQualityAQI).text}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ambient Particulates</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">{secureAggregates.airQualityAQI}</span>
            <span className="text-xs text-slate-400">AQI</span>
          </div>
        </div>
      </div>

      {/* 3. Waste Management Efficiency */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg shadow-black/10 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-sky-500/15 rounded-2xl text-sky-400">
            <Trash2 size={18} />
          </div>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${getWasteStatus(secureAggregates.wasteManagementEfficiency).color}`}>
            {getWasteStatus(secureAggregates.wasteManagementEfficiency).text}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Waste Clearance Rate</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">{secureAggregates.wasteManagementEfficiency}%</span>
            <span className="text-xs text-slate-400">cleared</span>
          </div>
        </div>
      </div>

      {/* 4. Water Security / Fail rate */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg shadow-black/10 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-blue-500/15 rounded-2xl text-blue-400">
            <Droplets size={18} />
          </div>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${getUtilityStatus(secureAggregates.waterUtilityFailRate).color}`}>
            {getUtilityStatus(secureAggregates.waterUtilityFailRate).text}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Utility Leaks Ratio</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">{secureAggregates.waterUtilityFailRate}%</span>
            <span className="text-xs text-slate-400">failed</span>
          </div>
        </div>
      </div>

      {/* 5. Citizen Satisfaction */}
      <div className="bg-gradient-to-br from-blue-500/25 to-indigo-500/10 backdrop-blur-md rounded-3xl border border-blue-500/30 p-5 shadow-lg shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 h-16 w-16 bg-blue-400/10 rounded-full -mr-4 -mt-4 animate-pulse" />
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/50">
            <Users size={18} />
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1 text-slate-300 hover:text-white disabled:opacity-40 rounded cursor-pointer transition-colors"
            title="Refresh telemetries"
            id="force-refresh-telemetry"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono text-blue-300 font-bold uppercase tracking-widest">Public Satisfaction Index</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-sans font-extrabold text-white tracking-tight">{secureAggregates.citizenSatisfaction}%</span>
            <span className="text-xs text-blue-200">approval</span>
          </div>
        </div>
      </div>
    </div>
  );
}

