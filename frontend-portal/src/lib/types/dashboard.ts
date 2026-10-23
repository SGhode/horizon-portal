export interface DashboardMetric {
  label: string;
  value: number | string;
  changePercent?: number;
  changeType?: "increase" | "decrease" | "neutral";
  description?: string;
}

export interface SystemStatus {
  status: "operational" | "degraded" | "maintenance";
  uptimePercent: number;
  activeNodes: number;
  latencyMs: number;
}

export interface ActivityItem {
  id: string;
  userName: string;
  userAvatar?: string;
  action: string;
  target: string;
  timestamp: string;
  category: "user" | "project" | "security" | "system";
}

export interface DashboardProjectSummary {
  id: string;
  name: string;
  category: string;
  status: "active" | "completed" | "on_hold" | "planning";
  progress: number;
  lead: string;
}

export interface DashboardData {
  metrics: {
    totalUsers: DashboardMetric;
    activeProjects: DashboardMetric;
    completedTasks: DashboardMetric;
    systemStatus: SystemStatus;
  };
  recentActivities: ActivityItem[];
  projectSummaries: DashboardProjectSummary[];
}
