import { DashboardData } from "@/lib/types/dashboard";

export const mockDashboardData: DashboardData = {
  metrics: {
    totalUsers: {
      label: "Total Users",
      value: "2,845",
      changePercent: 12.5,
      changeType: "increase",
      description: "vs. last month (+316 users)",
    },
    activeProjects: {
      label: "Active Projects",
      value: "38",
      changePercent: 5.4,
      changeType: "increase",
      description: "6 projects pending launch",
    },
    completedTasks: {
      label: "Completed Tasks",
      value: "1,248",
      changePercent: 18.2,
      changeType: "increase",
      description: "94.2% completion rate",
    },
    systemStatus: {
      status: "operational",
      uptimePercent: 99.98,
      activeNodes: 8,
      latencyMs: 24,
    },
  },
  recentActivities: [
    {
      id: "act-1",
      userName: "Shivraj Ghode",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
      action: "deployed release candidate",
      target: "v2.4.0 to production",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
      category: "project",
    },
    {
      id: "act-2",
      userName: "Elena Rostova",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
      action: "invited new member",
      target: "alex.kumar@growmar.io",
      timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // ~1 hr ago
      category: "user",
    },
    {
      id: "act-3",
      userName: "Marcus Vance",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
      action: "updated role permissions for",
      target: "DevOps Engineering team",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
      category: "security",
    },
    {
      id: "act-4",
      userName: "System Sentinel",
      action: "completed automated backup",
      target: "DB Cluster Primary (2.4 GB)",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hrs ago
      category: "system",
    },
    {
      id: "act-5",
      userName: "Sarah Jenkins",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=faces",
      action: "resolved security audit issue",
      target: "AUTH-SEC-412 (OAuth2 Scope)",
      timestamp: new Date(Date.now() - 1000 * 60 * 540).toISOString(), // 9 hrs ago
      category: "security",
    },
  ],
  projectSummaries: [
    {
      id: "proj-1",
      name: "Cloud Migration Phase 2",
      category: "Infrastructure",
      status: "active",
      progress: 74,
      lead: "Marcus Vance",
    },
    {
      id: "proj-2",
      name: "Python API Integration",
      category: "Backend Services",
      status: "active",
      progress: 45,
      lead: "Shivraj Ghode",
    },
    {
      id: "proj-3",
      name: "Design System Revamp",
      category: "Design System",
      status: "completed",
      progress: 100,
      lead: "Elena Rostova",
    },
    {
      id: "proj-4",
      name: "Customer Analytics Pipeline",
      category: "Data Platform",
      status: "planning",
      progress: 15,
      lead: "David Chen",
    },
    {
      id: "proj-5",
      name: "Audit & Compliance Check",
      category: "Security",
      status: "on_hold",
      progress: 60,
      lead: "Sarah Jenkins",
    },
  ],
};
