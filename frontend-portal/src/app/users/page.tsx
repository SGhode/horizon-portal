"use client";

import * as React from "react";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Eye,
  Mail,
  Calendar,
  Building,
} from "lucide-react";
import { getUsers } from "@/lib/api/users";
import { User, UserRole, UserStatus } from "@/lib/types/user";
import { PaginationMeta } from "@/lib/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | "all">("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal inspection state
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchUsers = React.useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUsers({
          page,
          limit: pagination.limit,
          search,
          role: roleFilter,
          status: statusFilter,
        });
        setUsers(res.data);
        setPagination(res.pagination);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, statusFilter, pagination.limit]
  );

  React.useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400 border border-purple-500/20">
            Admin
          </span>
        );
      case "developer":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-500/20">
            Developer
          </span>
        );
      case "editor":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20">
            Editor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-muted-foreground border border-slate-500/20">
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            User Directory
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage authorized team accounts, security privileges, and departmental roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page)}
            isLoading={loading}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={() => {
              // Demonstrates interactive action with Dialog
              setSelectedUser(null);
              setDialogOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Filter by name, email, or department..."
                  value={search}
                  onChange={handleSearchChange}
                  className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm font-semibold text-foreground">Error loading users</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button onClick={() => fetchUsers(1)} variant="outline" size="sm" className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {/* Main Table Card */}
      {!error && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Directory Members</CardTitle>
                <CardDescription>
                  Showing {users.length} of {pagination.total} registered users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                <h4 className="text-sm font-semibold text-foreground">No users found</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  No directory records matched your search query &quot;{search}&quot;. Try adjusting filters.
                </p>
                {(search || roleFilter !== "all" || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearch("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="cursor-pointer hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                              {u.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground text-sm">
                                {u.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderRoleBadge(u.role)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.department}
                        </TableCell>
                        <TableCell>{renderStatusBadge(u.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {formatDate(u.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewUser(u)}
                            aria-label={`View details for ${u.name}`}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && users.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
                  <span className="font-medium text-foreground">{pagination.totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => fetchUsers(pagination.page - 1)}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => fetchUsers(pagination.page + 1)}
                    className="gap-1 text-xs"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Details Modal (Dialog) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "User Record Inspection" : "Invite Team Member"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? `Detailed identity record for ${selectedUser.name}`
                : "Send an invitation email to onboard a new platform user."}
            </DialogDescription>
          </DialogHeader>

          {selectedUser ? (
            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base">
                  {selectedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base">
                    {selectedUser.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {renderRoleBadge(selectedUser.role)}
                    {renderStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </span>
                  <p className="font-medium text-foreground">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-primary" /> Department
                  </span>
                  <p className="font-medium text-foreground">{selectedUser.department}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Joined Platform
                  </span>
                  <p className="font-medium text-foreground">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Last Login
                  </span>
                  <p className="font-medium text-foreground">
                    {selectedUser.lastLoginAt
                      ? formatDate(selectedUser.lastLoginAt)
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <Input label="Full Name" placeholder="e.g. Jane Doe" />
              <Input label="Work Email" type="email" placeholder="jane.doe@growmar.io" />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Assigned Role
                </label>
                <select className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground">
                  <option value="developer">Developer</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            {!selectedUser && (
              <Button
                variant="primary"
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                Send Invite
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
