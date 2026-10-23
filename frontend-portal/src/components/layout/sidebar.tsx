"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle2,
  Receipt,
  Users,
  FolderKanban,
  Settings,
  ShieldCheck,
  Activity,
  Building2,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/profile",
    icon: UserCircle2,
  },
  {
    title: "Payslips & Tax",
    href: "/payslips",
    icon: Receipt,
  },
  {
    title: "Workforce Directory",
    href: "/users",
    icon: Users,
  },
  {
    title: "Initiatives",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && (error.status ?? 0) > 0) {
        router.replace("/login?error=logout-unconfirmed");
        router.refresh();
        return;
      }
      toast({
        title: "Sign-out failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not contact the server to sign out.",
        type: "error",
      });
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-foreground">
            PeoplePortal
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Enterprise Workforce
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Portal Navigation
        </div>
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-primary dark:text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                    {item.badge}
                  </span>
                ) : (
                  isActive && (
                    <ChevronRight className="h-3.5 w-3.5 text-primary opacity-60" />
                  )
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System status pill in footer */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              HR Gateway
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Online
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">SOC2 Compliant</span>
          </div>
        </div>

        {/* Quick Sign Out Link */}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void handleSignOut();
          }}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
