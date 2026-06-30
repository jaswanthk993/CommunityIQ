import React from "react";
import { Complaint } from "../types";
import { MessageSquare, Send, AlertCircle, Camera, ShieldAlert, Sparkles, User, MapPin, ListFilter, Eye, CheckCircle2, FileImage, Mic } from "lucide-react";

interface CitizenCopilotProps {
  loadingChat: boolean;
  onSendChat: (message: string, language: string) => void;
  chatHistory: { role: "user" | "copilot"; text: string; sources?: any[] }[];
  loadingReport: boolean;
  onFileReport: (report: { ward: string; category: string; title: string; details: string; imagePreset: string }) => void;
  recentComplaints: Complaint[];
  activeZoneId: string | null;
  onResolveIncident: (id: number) => void;
}

export default function CitizenCopilot({
  loadingChat,
  onSendChat,
  chatHistory,
  loadingReport,
  onFileReport,
  recentComplaints,
  activeZoneId,
  onResolveIncident
}: CitizenCopilotProps) {
  const [activeTab, setActiveTab] = React.useState<"chat" | "report" | "tickets">("chat");
  const [chatInput, setChatInput] = React.useState("");
  const [language, setLanguage] = React.useState("en");

  // Report Form State
  const [reportWard, setReportWard] = React.useState("Ward 3 (Downtown Central)");
  const [reportCategory, setReportCategory] = React.useState("Waste Management");
  const [reportTitle, setReportTitle] = React.useState("");
  const [reportDetails, setReportDetails] = React.useState("");
  const [imagePreset, setImagePreset] = React.useState("waste");

  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;
    onSendChat(chatInput, language);
    setChatInput("");
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDetails.trim() || loadingReport) return;
    onFileReport({
      ward: reportWard,
      category: reportCategory,
      title: reportTitle,
      details: reportDetails,
      imagePreset: imagePreset
    });
    // Reset report form
    setReportTitle("");
    setReportDetails("");
    setActiveTab("tickets"); // Flip to tickets tab to see it registered
  };

  const fillQuickMessage = (text: string) => {
    setChatInput(text);
  };

  // Filter complaints based on active map selection if set
  const filteredComplaints = recentComplaints.filter(c => {
    if (!activeZoneId) return true;
    const zoneNumMap: Record<string, string> = {
      "zone-1": "Ward 3",
      "zone-2": "Ward 1",
      "zone-3": "Ward 4",
      "zone-4": "Ward 2"
    };
    const filterKeyword = zoneNumMap[activeZoneId];
    return c.ward.toLowerCase().includes(filterKeyword.toLowerCase());
  });

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg shadow-black/15 flex flex-col h-full text-white" id="citizen-copilot-panel">
      {/* Tab select header */}
      <div className="flex border-b border-white/10 pb-4 mb-4 gap-2 items-center justify-between flex-wrap">
        <div className="flex flex-wrap bg-white/5 p-1 rounded-xl border border-white/10 gap-1" role="tablist" aria-label="Citizen actions panel tabs">
          <button
            onClick={() => setActiveTab("chat")}
            id="tab-btn-copilot"
            role="tab"
            aria-selected={activeTab === "chat"}
            aria-controls="panel-copilot"
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none ${
              activeTab === "chat" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            Citizen Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab("report")}
            id="tab-btn-report"
            role="tab"
            aria-selected={activeTab === "report"}
            aria-controls="panel-report"
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none ${
              activeTab === "report" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            File Active Report
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            id="tab-btn-tickets"
            role="tab"
            aria-selected={activeTab === "tickets"}
            aria-controls="panel-tickets"
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none ${
              activeTab === "tickets" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            Central Tickets ({filteredComplaints.length})
          </button>
        </div>

        {activeZoneId && (
          <span className="text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/20 px-2 py-1 rounded-md font-mono font-bold uppercase tracking-wider shadow-sm">
            Filtered: {activeZoneId === "zone-1" ? "Ward 3" : activeZoneId === "zone-2" ? "Ward 1" : activeZoneId === "zone-3" ? "Ward 4" : "Ward 2"}
          </span>
        )}
      </div>

      {activeTab === "chat" && (
        <div 
          id="panel-copilot"
          role="tabpanel"
          aria-labelledby="tab-btn-copilot"
          className="flex flex-col h-full justify-between flex-1 min-h-[300px]"
        >
          {/* Chat scrolling log */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[350px] min-h-[200px]"
            id="chat-messages-scroll"
          >
            {chatHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-450 text-xs flex flex-col items-center justify-center gap-3 h-full">
                <div className="p-3 bg-white/5 rounded-full text-blue-400 border border-white/10 animate-pulse">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Hi, I'm the Citizen Copilot</h4>
                  <p className="text-[11px] max-w-[280px] text-slate-400 mx-auto mt-1">Ask me about trash schedules, signal repairs, active flooding risks, or report visual potholes</p>
                </div>
              </div>
            ) : (
              chatHistory.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`p-1.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === "user" ? "bg-white/10 text-slate-300 border-white/10" : "bg-white/5 text-blue-400 border-white/10"
                  }`}>
                    {m.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                  </div>

                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-normal font-sans ${
                    m.role === "user" 
                      ? "bg-indigo-600 border border-indigo-400/20 text-white rounded-tr-none shadow-lg shadow-indigo-600/10" 
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none font-medium shadow-md flex flex-col gap-2"
                  }`}>
                    <p>{m.text}</p>
                    {m.role === "copilot" && m.sources && m.sources.length > 0 && (
                      <details className="mt-1 pt-2 border-t border-white/10 group">
                        <summary className="text-[10px] text-slate-400 font-mono cursor-pointer hover:text-indigo-400 select-none">
                          Sources Retrieved ({m.sources.length})
                        </summary>
                        <ul className="mt-2 space-y-1.5 list-disc pl-4">
                          {m.sources.map((src, i) => (
                            <li key={i} className="text-[9px] text-slate-500 font-mono">
                              <strong className="text-slate-400">{src.metadata?.ward || src.metadata?.dataset}:</strong> {src.text.slice(0, 90)}...
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}

            {loadingChat && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="p-1.5 h-7 w-7 rounded-full bg-white/5 text-blue-400 border border-white/10 flex items-center justify-center animate-pulse">
                  <Sparkles size={14} />
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick replies & inputs */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex gap-1.5 flex-wrap mb-3.5" id="chat-quick-suggestions">
              <button
                onClick={() => fillQuickMessage("What are the top 3 unresolved requests in Zone 3?")}
                className="px-2.5 py-1 text-[10px] font-medium border border-white/5 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                Top Priorities
              </button>
              <button
                onClick={() => fillQuickMessage("Compare school upgrade requests against enrollment data")}
                className="px-2.5 py-1 text-[10px] font-medium border border-white/5 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                Ward Summary
              </button>
              <button
                onClick={() => fillQuickMessage("स्वास्थ्य केंद्र से जुड़ी कितनी शिकायतें हैं?")}
                className="px-2.5 py-1 text-[10px] font-medium border border-white/5 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                Healthcare Requests
              </button>
            </div>

            <form onSubmit={handleSend} className="flex flex-col gap-2 relative mt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-slate-400 font-mono">Select Input Language (Translation API)</span>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-black/30 border border-white/10 text-xs text-slate-200 rounded-md px-2 py-0.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                </select>
              </div>
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message Copilot chatbot..."
                  className="w-full pl-3 pr-[5.5rem] py-2.5 text-xs bg-black/20 border border-white/10 text-slate-100 rounded-xl placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                  id="copilot-text-input"
                />
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    type="button"
                    className="p-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 cursor-pointer transition-colors shadow-sm"
                    title="Upload Photo"
                  >
                    <Camera size={12} />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 cursor-pointer transition-colors shadow-sm"
                    title="Voice Input (Cloud Speech-to-Text)"
                  >
                    <Mic size={12} />
                  </button>
                  <button
                    type="submit"
                    disabled={loadingChat || !chatInput.trim()}
                    className="p-1.5 bg-indigo-600 border border-indigo-400/20 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-40 cursor-pointer transition-colors shadow-md"
                    id="send-chat-btn"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "report" && (
        <div 
          id="panel-report"
          role="tabpanel"
          aria-labelledby="tab-btn-report"
          className="flex-1 flex flex-col justify-between min-h-[300px]"
        >
          <form onSubmit={handleReportSubmit} className="space-y-3.5" id="ticket-incident-report-form">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Impacted Ward</label>
                <select
                  value={reportWard}
                  onChange={(e) => setReportWard(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-black/25 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500 bg-zinc-900"
                  id="report-ward-select"
                >
                  <option value="Ward 3 (Downtown Central)">Ward 3 (Downtown)</option>
                  <option value="Ward 1 (Industrial North)">Ward 1 (Industrial)</option>
                  <option value="Ward 4 (South Delta)">Ward 4 (Residential South)</option>
                  <option value="Ward 2 (Residential East)">Ward 2 (Port East)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => {
                    setReportCategory(e.target.value);
                    // Match visual attachment preset to category automatically
                    if (e.target.value === "Waste Management") setImagePreset("waste");
                    else if (e.target.value === "Traffic & Roads") setImagePreset("traffic");
                    else if (e.target.value === "Environmental Hazard") setImagePreset("pothole");
                    else if (e.target.value === "Water & Utilities") setImagePreset("water");
                  }}
                  className="w-full px-2.5 py-2 text-xs bg-black/25 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500 bg-zinc-900"
                  id="report-category-select"
                >
                  <option value="Waste Management">Waste Management</option>
                  <option value="Traffic & Roads">Traffic & Roads</option>
                  <option value="Environmental Hazard">Environmental Hazard</option>
                  <option value="Water & Utilities">Water & Utilities</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Incident Headline</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Overspill garbage pile behind market"
                className="w-full px-3 py-2 text-xs bg-black/20 border border-white/10 text-white rounded-xl placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                id="report-title-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Spatio-Temporal Specifics</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide distinct location tags, extent of danger, blockages, odor indices, etc."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-black/20 border border-white/10 text-white rounded-xl placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                id="report-details-textarea"
              />
            </div>

            {/* Multimodal mock attachment selection */}
            <div>
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Visual Multimodal Attachment</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setImagePreset("waste")}
                  className={`p-2 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    imagePreset === "waste" ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold shadow-inner" : "border-white/5 hover:border-white/10 text-slate-400 bg-white/5 hover:bg-white/10"
                  }`}
                  id="preset-image-waste"
                >
                  <FileImage size={14} />
                  <span className="text-[8px] font-mono text-center leading-none">Garbage Overflow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreset("traffic")}
                  className={`p-2 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    imagePreset === "traffic" ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold shadow-inner" : "border-white/5 hover:border-white/10 text-slate-400 bg-white/5 hover:bg-white/10"
                  }`}
                  id="preset-image-traffic"
                >
                  <FileImage size={14} />
                  <span className="text-[8px] font-mono text-center leading-none">Traffic Gridlock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreset("pothole")}
                  className={`p-2 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    imagePreset === "pothole" ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold shadow-inner" : "border-white/5 hover:border-white/10 text-slate-400 bg-white/5 hover:bg-white/10"
                  }`}
                  id="preset-image-pothole"
                >
                  <FileImage size={14} />
                  <span className="text-[8px] font-mono text-center leading-none">Plaza Fugitive Dust</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreset("water")}
                  className={`p-2 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    imagePreset === "water" ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold shadow-inner" : "border-white/5 hover:border-white/10 text-slate-400 bg-white/5 hover:bg-white/10"
                  }`}
                  id="preset-image-water"
                >
                  <FileImage size={14} />
                  <span className="text-[8px] font-mono text-center leading-none">Water Main Leak</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingReport || !reportTitle.trim()}
              className="w-full py-2.5 text-xs text-center font-sans font-semibold text-white bg-indigo-600 border border-indigo-400/20 rounded-xl hover:bg-indigo-500 hover:shadow-indigo-600/20 shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              id="file-incident-report-btn"
            >
              {loadingReport ? "Analyzing incident via Gemini Vision..." : "Submit Incident Report (Gemini Triggered)"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "tickets" && (
        <div 
          id="panel-tickets"
          role="tabpanel"
          aria-labelledby="tab-btn-tickets"
          className="flex-1 flex flex-col min-h-[300px]"
        >
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">Central Database Incident Logs</h4>

          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 flex-1" id="tickets-list">
            {filteredComplaints.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400 font-mono italic">No complaints registered in this sector grid.</p>
            ) : (
              filteredComplaints.map((c) => (
                <div key={c.id} className="p-3.5 border border-white/10 rounded-2xl bg-white/5 flex flex-col justify-between gap-3 text-xs shadow-lg shadow-black/5 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                          c.status === "Resolved" 
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" 
                            : c.status === "In Progress" 
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/25" 
                              : "bg-red-500/15 text-rose-300 border border-red-500/25"
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">#{c.id}</span>
                      </div>
                      <h5 className="font-semibold text-white text-[13px] tracking-tight mt-1 leading-snug">{c.title}</h5>
                      <span className="text-[9px] font-sans font-medium text-slate-450 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {c.ward}
                      </span>
                    </div>

                    {c.imageUrl && (
                      <img 
                        src={c.imageUrl} 
                        alt="multimodal attachment" 
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 object-cover rounded-md border border-white/10 shadow-sm"
                      />
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-300 font-sans">{c.details}</p>

                  {/* Operational action logs */}
                  {c.replies.length > 0 && (
                    <div className="bg-black/35 rounded-lg p-2.5 font-mono text-[9px] text-slate-400 leading-normal border border-white/5 space-y-1">
                      <strong className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">Dispatcher Telemetry Audit</strong>
                      {c.replies.map((r, i) => (
                        <p key={i}>⏱️ {r}</p>
                      ))}
                    </div>
                  )}

                  {c.status !== "Resolved" && (
                    <button
                      onClick={() => onResolveIncident(c.id)}
                      className="px-2.5 py-1 text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 hover:bg-emerald-500/25 rounded-lg cursor-pointer max-w-fit active:scale-95 transition-all"
                      id={`resolve-btn-${c.id}`}
                    >
                      ✓ Resolve Incident
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

