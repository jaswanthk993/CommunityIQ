import React from "react";
import { ZoneMetric, Complaint } from "../types";
import { Map, AlertTriangle, CheckCircle, Navigation, Info, Users, ShieldAlert, ThermometerSun } from "lucide-react";

interface CityMapProps {
  zones: ZoneMetric[];
  activeZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  complaints: Complaint[];
  tempSensorStream: { hz: number; pm: number; traffic: number };
}

export default function CityMap({
  zones,
  activeZoneId,
  onSelectZone,
  complaints,
  tempSensorStream
}: CityMapProps) {
  // Coordinates mapping on abstract map
  const getZoneColor = (zone: ZoneMetric | undefined) => {
    if (!zone) return "stroke-slate-700 fill-slate-800/5 hover:fill-slate-800/10";
    const isCritical = zone.airQualityAQI > 150 || zone.trafficIndex > 75 || zone.wasteBuildupIndex > 70;
    if (isCritical) return "stroke-red-500 fill-red-500/10 hover:fill-red-500/20";
    const isWarning = zone.airQualityAQI > 100 || zone.trafficIndex > 60 || zone.wasteBuildupIndex > 50;
    if (isWarning) return "stroke-amber-400 fill-amber-400/10 hover:fill-amber-400/20";
    return "stroke-emerald-400 fill-emerald-400/5 hover:fill-emerald-400/15";
  };

  const getUrgencyText = (zone: ZoneMetric | undefined) => {
    if (!zone) return "NO DATA";
    if (zone.airQualityAQI > 150 || zone.trafficIndex > 75) return "CRITICAL STATUS";
    if (zone.airQualityAQI > 100 || zone.trafficIndex > 60) return "WARNING RANGE";
    return "STABLE GROUND";
  };

  const selectedZoneData = zones.find(z => z.id === activeZoneId);

  const groupedComplaints = React.useMemo(() => {
    const groups: Record<string, { count: number, category: string, ward: string, ids: number[] }> = {};
    complaints.forEach(c => {
      if (c.status === "Resolved") return;
      const key = `${c.ward}-${c.category}`;
      if (!groups[key]) {
        groups[key] = { count: 0, category: c.category, ward: c.ward, ids: [] };
      }
      groups[key].count++;
      groups[key].ids.push(c.id);
    });
    return Object.values(groups);
  }, [complaints]);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg shadow-black/15 flex flex-col h-full justify-between text-white" id="city-tactical-gis-map">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/5 rounded-xl text-blue-400 border border-white/10 shadow-inner">
              <Map size={20} />
            </div>
            <div>
              <h3 className="font-sans font-semibold tracking-tight text-white text-base">Demand Hotspot Mapper</h3>
              <p className="font-mono text-xs text-slate-400">Live Spatial telemetry • Themed clusters by volume</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold uppercase animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> WebSockets Active
          </span>
        </div>

        {/* Tactical interactive SVG GIS grid map */}
        <div className="relative border border-white/10 rounded-2xl bg-black/30 overflow-hidden group aspect-[16/10] mb-5">
          {/* Diagnostic Grid overlays */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />

          {/* SVG Map Layout */}
          <svg viewBox="0 0 500 300" className="w-full h-full relative z-10 transition-all duration-300">
            {/* Compass rose mock */}
            <g transform="translate(60, 240)" className="opacity-30 text-slate-500">
              <circle cx="0" cy="0" r="22" fill="none" className="stroke-white/20" strokeDasharray="2,2" />
              <line r1="-25" r2="25" className="stroke-white/20" />
              <line r1="-25" r2="25" transform="rotate(90)" className="stroke-white/20" />
              <text x="-4" y="-12" className="fill-slate-300 text-[8px] font-mono">N</text>
            </g>

            {/* Zone 1: Downtown Central (Top Left quadrant) */}
            <path
              d="M 15 15 L 240 15 L 240 140 L 150 140 L 15 80 Z"
              className={`cursor-pointer stroke-2 transition-all duration-200 ${
                activeZoneId === "zone-1" 
                  ? "stroke-blue-400 fill-blue-500/20 shadow-lg" 
                  : getZoneColor(zones[0])
              }`}
              onClick={() => onSelectZone("zone-1")}
              id="map-path-zone-1"
            />
            {/* Zone 2: Industrial North (Top Right quadrant) */}
            <path
              d="M 260 15 L 485 15 L 485 120 L 370 140 L 260 140 Z"
              className={`cursor-pointer stroke-2 transition-all duration-200 ${
                activeZoneId === "zone-2" 
                  ? "stroke-blue-400 fill-blue-500/20" 
                  : getZoneColor(zones[1])
              }`}
              onClick={() => onSelectZone("zone-2")}
              id="map-path-zone-2"
            />
            {/* Zone 3: Residential South (Bottom Left quadrant) */}
            <path
              d="M 15 100 L 130 150 L 240 155 L 240 285 L 15 285 Z"
              className={`cursor-pointer stroke-2 transition-all duration-200 ${
                activeZoneId === "zone-3" 
                  ? "stroke-blue-400 fill-blue-500/20" 
                  : getZoneColor(zones[2])
              }`}
              onClick={() => onSelectZone("zone-3")}
              id="map-path-zone-3"
            />
            {/* Zone 4: East Delta & Port (Bottom Right quadrant) */}
            <path
              d="M 260 155 L 360 155 L 485 135 L 485 285 L 260 285 Z"
              className={`cursor-pointer stroke-2 transition-all duration-200 ${
                activeZoneId === "zone-4" 
                  ? "stroke-blue-400 fill-blue-500/20" 
                  : getZoneColor(zones[3])
              }`}
              onClick={() => onSelectZone("zone-4")}
              id="map-path-zone-4"
            />

            {/* Central highway mockup line */}
            <path 
              d="M 15 135 Q 250 148 485 135" 
              fill="none" 
              className="stroke-white/20 stroke-[4px] opacity-70" 
              strokeDasharray="4,4"
            />
            <text x="400" y="150" className="fill-white/30 font-mono text-[7px]">HWY-101 EXPRESS</text>

            {/* Labels overlay */}
            <text x="50" y="55" className="fill-white/80 font-mono text-[10px] font-bold pointer-events-none">Zone 1: Downtown</text>
            <text x="310" y="55" className="fill-white/80 font-mono text-[10px] font-bold pointer-events-none">Zone 2: Industrial</text>
            <text x="50" y="210" className="fill-white/80 font-mono text-[10px] font-bold pointer-events-none">Zone 3: Residential</text>
            <text x="310" y="210" className="fill-white/80 font-mono text-[10px] font-bold pointer-events-none">Zone 4: Port Delta</text>

            {/* Active pending complaints mapped as grouped hotspots */}
            {groupedComplaints.map((g, idx) => {
              // Map categories to specific coordinates on our SVG grid
              let cx = 100 + (idx * 60) % 280;
              let cy = 80 + (idx * 40) % 150;

              if (g.ward.includes("Zone 1") || g.ward.includes("Ward 3")) {
                cx = 120 + (idx * 45) % 80;
                cy = 60 + (idx * 25) % 50;
              } else if (g.ward.includes("Zone 2") || g.ward.includes("Ward 1")) {
                cx = 360 + (idx * 45) % 80;
                cy = 60 + (idx * 25) % 45;
              } else if (g.ward.includes("Zone 3") || g.ward.includes("Ward 4") || g.ward.includes("South")) {
                cx = 100 + (idx * 45) % 90;
                cy = 200 + (idx * 25) % 60;
              } else if (g.ward.includes("Zone 4") || g.ward.includes("East")) {
                cx = 350 + (idx * 45) % 90;
                cy = 200 + (idx * 25) % 65;
              }

              const radius = Math.min(25, 8 + (g.count - 1) * 4);
              const isCritical = g.count >= 2;

              return (
                <g key={`${g.ward}-${g.category}`} className="cursor-pointer group/node">
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={radius + 4} 
                    className={`${isCritical ? 'fill-indigo-500/40' : 'fill-amber-500/30'} animate-ping`} 
                  />
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={radius} 
                    className={`${isCritical ? 'fill-indigo-500 stroke-black/80' : 'fill-amber-400 stroke-black/80'} stroke-2`} 
                  />
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    className="fill-white font-mono text-[8px] font-bold pointer-events-none"
                  >
                    {g.count}
                  </text>
                  <rect 
                    x={cx + radius + 4} 
                    y={cy - 12} 
                    width="140" 
                    height="24" 
                    rx="4" 
                    className="fill-slate-950/90 hover:fill-slate-950 pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 border border-white/10"
                  />
                  <text 
                    x={cx + radius + 8} 
                    y={cy + 2} 
                    className="fill-white font-sans text-[7.5px] font-semibold pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity duration-200"
                  >
                    {g.category} (x{g.count} submissions)
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Instructions */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-300 border border-white/10 shadow-md pointer-events-none">
            🖱️ Click any sector grid to filter local feeds
          </div>
        </div>
      </div>

      {/* Selected Sector Subpanel info */}
      <div className="border-t border-white/10 pt-4 mt-auto">
        {selectedZoneData ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                <h4 className="font-semibold text-white text-sm tracking-tight">{selectedZoneData.name} Telemetry</h4>
              </div>
              <button 
                onClick={() => onSelectZone(null)} 
                className="text-[10px] font-mono text-blue-400 hover:text-blue-300 hover:underline"
                id="reset-zone-filter"
              >
                Clear Filter
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Arterial Traffic</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-base font-bold text-white">{selectedZoneData.trafficIndex}%</span>
                  <span className="text-[9px] text-slate-400">load</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${selectedZoneData.trafficIndex > 70 ? 'bg-red-400' : 'bg-blue-400'}`} 
                    style={{ width: `${selectedZoneData.trafficIndex}%` }} 
                  />
                </div>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Air Quality (AQI)</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-base font-bold text-white">{selectedZoneData.airQualityAQI}</span>
                  <span className="text-[9px] text-slate-400">PM2.5</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${selectedZoneData.airQualityAQI > 120 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                    style={{ width: `${Math.min(100, selectedZoneData.airQualityAQI / 2)}%` }} 
                  />
                </div>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Waste Buildup</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-base font-bold text-white">{selectedZoneData.wasteBuildupIndex}%</span>
                  <span className="text-[9px] text-slate-400">threshold</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${selectedZoneData.wasteBuildupIndex > 65 ? 'bg-red-400' : 'bg-slate-400'}`} 
                    style={{ width: `${selectedZoneData.wasteBuildupIndex}%` }} 
                  />
                </div>
              </div>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Grid Health status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                    getUrgencyText(selectedZoneData).includes("CRITICAL") 
                      ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {getUrgencyText(selectedZoneData)}
                  </span>
                </div>
              </div>
            </div>
            {selectedZoneData.activeAlerts.length > 0 && (
              <div className="mt-2.5 p-2 bg-red-950/20 rounded-xl flex items-start gap-2 border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-mono text-red-300 font-bold">Active Grid Anomalies Detected:</p>
                  <p className="text-[9px] font-sans text-red-200">{selectedZoneData.activeAlerts.join(" • ")}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs flex flex-col items-center gap-2">
            <Info size={16} className="text-slate-400" />
            <p>Select any smart grid sector on the map above to view deep local sensor matrices and active warnings</p>
          </div>
        )}
      </div>
    </div>
  );
}

