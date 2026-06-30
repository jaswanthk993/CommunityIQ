export interface Complaint {
  id: number;
  ward: string;
  category: "Waste Management" | "Traffic & Roads" | "Environmental Hazard" | "Water & Utilities";
  title: string;
  details: string;
  status: "Pending" | "In Progress" | "Resolved";
  priority: "Critical" | "High" | "Medium" | "Low";
  reportedAt: string;
  imageUrl?: string;
  replies: string[];
}

export interface ZoneMetric {
  id: string;
  name: string;
  trafficIndex: number;
  airQualityAQI: number;
  wasteBuildupIndex: number;
  waterUtilityFailRate: number;
  activeAlerts: string[];
}

export interface CityAggregates {
  trafficCongestionIndex: number;
  airQualityAQI: number;
  wasteManagementEfficiency: number;
  waterUtilityFailRate: number;
  citizenSatisfaction: number;
  activeAlertsCount: number;
  lastUpdate: string;
}

export interface SimulationResult {
  trafficReduction: number;
  emissionSavings: number;
  citizenSatisfactionDelta: number;
  wasteEfficiencyDelta: number;
  financialCostEstimate: string;
  pros: string[];
  cons: string[];
  detailedAnalysis: string;
}

export interface MasterPlanItem {
  title: string;
  ward: string;
  mentions: number;
  dataset: string;
  score: string;
  action: string;
}

export interface RecommendationsResponse {
  themeClusteringAgentReport: string;
  crossReferenceAgentReport: string;
  priorityRankingAgentReport: string;
  masterPlan: MasterPlanItem[];
}
