export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "archived";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  owner: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  teamSize: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  tags: string[];
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus | "all";
  priority?: ProjectPriority | "all";
}
