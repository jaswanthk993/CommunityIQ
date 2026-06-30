import json
from typing import List, Dict, Any

def render_interactive_svg_map(zones: List[Dict[str, Any]], complaints: List[Dict[str, Any]], active_zone_id: str = None) -> str:
    """
    Renders an interactive high-contrast SVG spatial map using custom CSS styling, flashing
    incident nodes, and responsive hover transitions. Directly matches CityMap.tsx.
    """
    # Define colors based on target AQI/Traffic criticalities
    zone_styles = {}
    for z in zones:
        is_critical = z.get("airQualityAQI", 0) > 150 or z.get("trafficIndex", 0) > 75 or z.get("wasteBuildupIndex", 0) > 70
        is_warning = z.get("airQualityAQI", 0) > 100 or z.get("trafficIndex", 0) > 60 or z.get("wasteBuildupIndex", 0) > 50
        
        if is_critical:
            zone_styles[z["id"]] = "stroke: #ef4444; fill: rgba(239, 68, 68, 0.1);"
        elif is_warning:
            zone_styles[z["id"]] = "stroke: #fbbf24; fill: rgba(251, 191, 36, 0.1);"
        else:
            zone_styles[z["id"]] = "stroke: #34d399; fill: rgba(52, 211, 153, 0.05);"

    # Build active incident dots
    incident_dots_svg = ""
    active_complaints = [c for c in complaints if c["status"] != "Resolved"]
    for idx, c in enumerate(active_complaints):
        cx = 100 + (idx * 60) % 280
        cy = 80 + (idx * 40) % 150

        # Adjust based on ward tags
        if "Zone 1" in c["ward"] or "Ward 3" in c["ward"]:
            cx, cy = 120 + idx * 10, 60 + idx * 5
        elif "Zone 2" in c["ward"] or "Ward 1" in c["ward"]:
            cx, cy = 340 + idx * 8, 70 + idx * 5
        elif "Zone 3" in c["ward"]:
            cx, cy = 140 + idx * 8, 200 + idx * 5
        elif "Zone 4" in c["ward"] or "Ward 4" in c["ward"]:
            cx, cy = 360 + idx * 10, 220 + idx * 5

        dot_color = "#ef4444" if c["priority"] == "Critical" else "#fbbf24" if c["priority"] == "High" else "#3b82f6"
        incident_dots_svg += f"""
        <g class="incident-dot" style="cursor: pointer;" title="{c['category']}: {c['title']}">
            <circle cx="{cx}" cy="{cy}" r="7" fill="{dot_color}" opacity="0.8" class="ping-pulse"></circle>
            <circle cx="{cx}" cy="{cy}" r="4" fill="{dot_color}"></circle>
        </g>
        """

    # Custom styles inside iframe
    html_content = f"""
    <style>
        body {{
            background: transparent;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: 'Inter', system-ui, sans-serif;
            color: #f1f5f9;
        }}
        .map-wrapper {{
            position: relative;
            background: #090d16;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
            aspect-ratio: 16 / 10;
            width: 100%;
            height: 100%;
        }}
        .grid-overlay {{
            position: absolute;
            inset: 0;
            background-image: linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
            background-size: 16px 16px;
            pointer-events: none;
        }}
        svg {{
            width: 100%;
            height: 100%;
        }}
        path {{
            transition: all 0.25s ease;
            stroke-width: 2;
        }}
        path:hover {{
            fill: rgba(59, 130, 246, 0.2) !important;
            stroke: #3b82f6 !important;
        }}
        .ping-pulse {{
            animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
            transform-origin: center;
        }}
        @keyframes pulse-ring {{
            0% {{ transform: scale(0.9); opacity: 0.8; }}
            50% {{ transform: scale(1.4); opacity: 0.2; }}
            100% {{ transform: scale(0.9); opacity: 0.8; }}
        }}
    </style>
    <div class="map-wrapper">
        <div class="grid-overlay"></div>
        <svg viewBox="0 0 500 300">
            <!-- Central highway -->
            <path d="M 15 135 Q 250 148 485 135" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" stroke-dasharray="4,4"></path>
            
            <!-- Zone 1: Downtown Central -->
            <path d="M 15 15 L 240 15 L 240 140 L 150 140 L 15 80 Z" style="{zone_styles.get('zone-1', '')}"></path>
            
            <!-- Zone 2: Industrial North -->
            <path d="M 260 15 L 485 15 L 485 120 L 370 140 L 260 140 Z" style="{zone_styles.get('zone-2', '')}"></path>
            
            <!-- Zone 3: Residential South -->
            <path d="M 15 100 L 130 150 L 240 155 L 240 285 L 15 285 Z" style="{zone_styles.get('zone-3', '')}"></path>
            
            <!-- Zone 4: East Delta -->
            <path d="M 260 155 L 360 155 L 485 135 L 485 285 L 260 285 Z" style="{zone_styles.get('zone-4', '')}"></path>

            <!-- Quad Labels -->
            <text x="45" y="45" fill="rgba(255,255,255,0.7)" font-size="9" font-family="monospace" font-weight="bold">ZONE 1: DOWNTOWN</text>
            <text x="290" y="45" fill="rgba(255,255,255,0.7)" font-size="9" font-family="monospace" font-weight="bold">ZONE 2: INDUSTRIAL</text>
            <text x="45" y="195" fill="rgba(255,255,255,0.7)" font-size="9" font-family="monospace" font-weight="bold">ZONE 3: RESIDENTIAL</text>
            <text x="290" y="195" fill="rgba(255,255,255,0.7)" font-size="9" font-family="monospace" font-weight="bold">ZONE 4: PORT DELTA</text>

            <!-- Active Pending Ticket Sensors -->
            {incident_dots_svg}
        </svg>
    </div>
    """
    return html_content
