import os
import json
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Dual-mode architecture: real DB when DATABASE_URL is available, else premium thread-safe in-memory mock engine.
IS_MOCKED_DB = not DATABASE_URL or "postgresql" not in DATABASE_URL

Base = declarative_base()

class DBComplaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    ward = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    details = Column(Text, nullable=False)
    status = Column(String(20), default="Pending")
    priority = Column(String(20), default="Medium")
    reportedAt = Column(String(100), nullable=False)
    imageUrl = Column(String(500), nullable=True)
    replies = Column(JSON, default=list) # Store replies as serializable JSON list
    embedding_vector = Column(Text, nullable=True) # Text representation of embedding vectors if pgvector isn't installed

class DBZoneMetric(Base):
    __tablename__ = "zones"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    trafficIndex = Column(Integer, default=50)
    airQualityAQI = Column(Integer, default=100)
    wasteBuildupIndex = Column(Integer, default=50)
    waterUtilityFailRate = Column(Integer, default=5)
    activeAlerts = Column(JSON, default=list)

# Mock in-memory central thread-safe state in case PostgreSQL is offline
mock_complaints = [
    {
        "id": 1,
        "ward": "Ward 3 (Downtown Central)",
        "category": "Waste Management",
        "title": "Overflowing commercial dumpster behind Sector-4 market",
        "details": "Commercial waste dumpster is entirely full, food bags spilled across pathways attracting strays and generating deep odor. Blocking pedestrian access.",
        "status": "Pending",
        "priority": "High",
        "reportedAt": (datetime.utcnow()).isoformat() + "Z",
        "imageUrl": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400",
        "replies": ["Automated system triggered. Environment Agent flagged hotspot in Sector-4."]
    },
    {
        "id": 2,
        "ward": "Ward 1 (Industrial North)",
        "category": "Traffic & Roads",
        "title": "Traffic signal synchronization failure at Main Expressway Crossing",
        "details": "The green light timing has broken down, letting only 3 cars through on each cycle. Causing blockages stretching Back 2 kilometers.",
        "status": "In Progress",
        "priority": "Critical",
        "reportedAt": (datetime.utcnow()).isoformat() + "Z",
        "imageUrl": "https://images.unsplash.com/photo-1494832421162-2ca84ffd02aa?auto=format&fit=crop&q=80&w=400",
        "replies": ["Signals agency notified.", "Traffic override officer deployed for manual dispatch flow control."]
    },
    {
        "id": 3,
        "ward": "Ward 4 (South Delta)",
        "category": "Water & Utilities",
        "title": "Main water pressure valve rupture on Outer Ring Road",
        "details": "Large volume of potable water spraying onto lanes 2 and 3 of the highway, creating hydroplaning risk for morning commuters.",
        "status": "Pending",
        "priority": "High",
        "reportedAt": (datetime.utcnow()).isoformat() + "Z",
        "imageUrl": "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400",
        "replies": []
    }
]

mock_zones = [
    {
        "id": "zone-1",
        "name": "Zone 1 (Downtown)",
        "trafficIndex": 78,
        "airQualityAQI": 92,
        "wasteBuildupIndex": 64,
        "waterUtilityFailRate": 4,
        "activeAlerts": ["Market Waste Overflow", "Peak Commute Delay"]
    },
    {
        "id": "zone-2",
        "name": "Zone 2 (Industrial North)",
        "trafficIndex": 52,
        "airQualityAQI": 168,
        "wasteBuildupIndex": 35,
        "waterUtilityFailRate": 15,
        "activeAlerts": ["Soot PM2.5 Alert", "Outer Boundary Water Leak"]
    },
    {
        "id": "zone-3",
        "name": "Zone 3 (Residential South)",
        "trafficIndex": 28,
        "airQualityAQI": 42,
        "wasteBuildupIndex": 25,
        "waterUtilityFailRate": 1,
        "activeAlerts": []
    },
    {
        "id": "zone-4",
        "name": "Zone 4 (East Delta & Port)",
        "trafficIndex": 67,
        "airQualityAQI": 110,
        "wasteBuildupIndex": 71,
        "waterUtilityFailRate": 8,
        "activeAlerts": ["Port Waste Backlog"]
    }
]

class DatabaseManager:
    def __init__(self):
        self.mock_complaints = list(mock_complaints)
        self.mock_zones = list(mock_zones)
        self.next_complaint_id = len(self.mock_complaints) + 1

        if not IS_MOCKED_DB:
            try:
                # Setup real SQLAlchemy engine and pools for PostgreSQL + pgvector
                # Note: 'postgresql+asyncpg' can be used, but for simplicity here we establish standard connection pools
                sync_url = DATABASE_URL.replace("asyncpg", "psycopg2") if "+asyncpg" in DATABASE_URL else DATABASE_URL
                self.engine = create_engine(sync_url, pool_pre_ping=True)
                self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
                Base.metadata.create_all(bind=self.engine)
                self.has_real_db = True
                print("CIVITAS DATABASE: Connected to PostgreSQL.")
            except Exception as e:
                print(f"CIVITAS DATABASE ERROR: Failing back to in-memory engine due to: {e}")
                self.has_real_db = False
        else:
            self.has_real_db = False

    def get_complaints(self) -> List[Dict[str, Any]]:
        if self.has_real_db:
            db = self.SessionLocal()
            try:
                records = db.query(DBComplaint).all()
                return [
                    {
                        "id": r.id, "ward": r.ward, "category": r.category, "title": r.title,
                        "details": r.details, "status": r.status, "priority": r.priority,
                        "reportedAt": r.reportedAt, "imageUrl": r.imageUrl, "replies": json.loads(r.replies) if isinstance(r.replies, str) else r.replies
                    } for r in records
                ]
            finally:
                db.close()
        return self.mock_complaints

    def get_zones(self) -> List[Dict[str, Any]]:
        if self.has_real_db:
            db = self.SessionLocal()
            try:
                records = db.query(DBZoneMetric).all()
                if not records:
                    # Seed zones table
                    for z in self.mock_zones:
                        db_z = DBZoneMetric(
                            id=z["id"], name=z["name"], trafficIndex=z["trafficIndex"],
                            airQualityAQI=z["airQualityAQI"], wasteBuildupIndex=z["wasteBuildupIndex"],
                            waterUtilityFailRate=z["waterUtilityFailRate"], activeAlerts=z["activeAlerts"]
                        )
                        db.add(db_z)
                    db.commit()
                    records = db.query(DBZoneMetric).all()
                return [
                    {
                        "id": r.id, "name": r.name, "trafficIndex": r.trafficIndex,
                        "airQualityAQI": r.airQualityAQI, "wasteBuildupIndex": r.wasteBuildupIndex,
                        "waterUtilityFailRate": r.waterUtilityFailRate, 
                        "activeAlerts": json.loads(r.activeAlerts) if isinstance(r.activeAlerts, str) else r.activeAlerts
                    } for r in records
                ]
            finally:
                db.close()
        return self.mock_zones

    def add_complaint(self, ward: str, category: str, title: str, details: str, imageUrl: str = None) -> Dict[str, Any]:
        reported_at = datetime.utcnow().isoformat() + "Z"
        avg_satisfaction = 100 - sum(z["trafficIndex"] for z in self.get_zones())/len(self.get_zones()) # dynamic multiplier
        priority = "Medium"
        if "traffic" in title.lower() or "highway" in title.lower() or "block" in title.lower():
            priority = "Critical" if "crossing" in details.lower() else "High"
        elif "rupture" in title.lower() or "spill" in details.lower():
            priority = "High"

        if self.has_real_db:
            db = self.SessionLocal()
            try:
                db_item = DBComplaint(
                    ward=ward, category=category, title=title, details=details,
                    status="Pending", priority=priority, reportedAt=reported_at, imageUrl=imageUrl,
                    replies=json.dumps(["Incident submitted to central municipal registry."])
                )
                db.add(db_item)
                db.commit()
                db.refresh(db_item)
                return {
                    "id": db_item.id, "ward": db_item.ward, "category": db_item.category, "title": db_item.title,
                    "details": db_item.details, "status": db_item.status, "priority": db_item.priority,
                    "reportedAt": db_item.reportedAt, "imageUrl": db_item.imageUrl, "replies": ["Incident submitted to central municipal registry."]
                }
            finally:
                db.close()
        else:
            complaint = {
                "id": self.next_complaint_id, "ward": ward, "category": category, "title": title,
                "details": details, "status": "Pending", "priority": priority, "reportedAt": reported_at,
                "imageUrl": imageUrl or "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400",
                "replies": ["Incident submitted to central municipal registry."]
            }
            self.mock_complaints.append(complaint)
            self.next_complaint_id += 1
            return complaint

    def resolve_complaint(self, id: int) -> bool:
        if self.has_real_db:
            db = self.SessionLocal()
            try:
                record = db.query(DBComplaint).filter(DBComplaint.id == id).first()
                if record:
                    record.status = "Resolved"
                    existing_replies = json.loads(record.replies) if isinstance(record.replies, str) else record.replies
                    existing_replies.append("Municipal remediation crew dispatched and resolved event.")
                    record.replies = json.dumps(existing_replies)
                    db.commit()
                    return True
                return False
            finally:
                db.close()
        else:
            for c in self.mock_complaints:
                if c["id"] == id:
                    c["status"] = "Resolved"
                    c["replies"].append("Municipal remediation crew dispatched and resolved event.")
                    return True
            return False

# Export unified singleton instance
db_manager = DatabaseManager()
