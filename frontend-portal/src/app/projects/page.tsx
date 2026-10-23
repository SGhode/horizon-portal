"use client";

import * as React from "react";
import {
  FolderKanban,
  Search,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Users as UsersIcon,
  LayoutGrid,
  List,
} from "lucide-react";
import { getProjects } from "@/lib/api/projects";
import { Project, ProjectStatus, ProjectPriority } from "@/lib/types/project";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = React.useState<ProjectPriority | "all">("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjects({
        search,
        status: statusFilter,
        priority: priorityFilter,
      });
      setProjects(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const renderStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>;
      case "review":
        return <Badge variant="warning">In Review</Badge>;
      case "planning":
        return <Badge variant="secondary">Planning</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: ProjectPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400 border border-orange-500/20">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-500/15 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-slate-500/20">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Project Initiatives
          </h2>
          <p className="text-sm text-muted-foreground">
            Track engineering delivery milestones, roadmap progress, and priority assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-md border border-border bg-card p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-sm transition-colors ${
                viewMode === "table"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Table view"
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
            isLoading={loading}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search project name, tags, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="planning">Planning</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as ProjectPriority | "all")}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm font-semibold text-foreground">Error loading projects</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button onClick={fetchProjects} variant="outline" size="sm" className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {!error && (
        <>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-foreground">No Projects Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No active projects match your filter criteria. Try adjusting the search or filters.
              </p>
              {(search || statusFilter !== "all" || priorityFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((proj) => (
                <Card key={proj.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {renderPriorityBadge(proj.priority)}
                      {renderStatusBadge(proj.status)}
                    </div>
                    <CardTitle className="text-base leading-snug line-clamp-1">
                      {proj.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs mt-1">
                      {proj.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0 flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Milestone Progress</span>
                        <span className="font-semibold text-foreground font-mono">
                          {proj.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border pt-3 pb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="h-3.5 w-3.5" />
                      <span>{proj.owner.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(proj.updatedAt)}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((proj) => (
                      <TableRow key={proj.id}>
                        <TableCell>
                          <div>
                            <span className="font-semibold text-foreground text-sm">
                              {proj.name}
                            </span>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {proj.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{renderPriorityBadge(proj.priority)}</TableCell>
                        <TableCell>{renderStatusBadge(proj.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${proj.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono">{proj.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {proj.owner.name}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground font-mono">
                          {formatDate(proj.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
