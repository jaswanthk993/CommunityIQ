from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ComplaintBase(BaseModel):
    ward: str
    category: str
    title: str
    details: str
    imageUrl: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    imagePreset: Optional[str] = None

class Complaint(ComplaintBase):
    id: int
    status: str
    priority: str
    reportedAt: str
    replies: List[str] = []

    class Config:
        from_attributes = True

class ZoneMetric(BaseModel):
    id: str
    name: str
    trafficIndex: int
    airQualityAQI: int
    wasteBuildupIndex: int
    waterUtilityFailRate: int
    activeAlerts: List[str]

    class Config:
        from_attributes = True

class CityAggregates(BaseModel):
    trafficCongestionIndex: int
    airQualityAQI: int
    wasteManagementEfficiency: int
    waterUtilityFailRate: int
    citizenSatisfaction: int
    activeAlertsCount: int
    lastUpdate: str

class SimulationResult(BaseModel):
    trafficReduction: int
    emissionSavings: int
    citizenSatisfactionDelta: int
    wasteEfficiencyDelta: int
    financialCostEstimate: str
    pros: List[str]
    cons: List[str]
    detailedAnalysis: str

class SimulationRequest(BaseModel):
    policyName: str
    policyDescription: Optional[str] = None
    currentSatisfaction: Optional[int] = 70

class MasterPlanItem(BaseModel):
    title: str
    agency: str
    impact: str
    cost: str
    priority: str
    action: str

class RecommendationsResponse(BaseModel):
    trafficAgentReport: str
    environmentAgentReport: str
    serviceAgentReport: str
    emergencyAgentReport: str
    masterPlan: List[MasterPlanItem]
