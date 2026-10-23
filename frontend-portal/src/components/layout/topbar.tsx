"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  User,
  ChevronDown,
  Building2,
  Receipt,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api/auth";
import type { AuthUser } from "@/lib/auth/types";
import { ApiClientError } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Workforce Overview", subtitle: "Employee engagement & operational metrics" },
  "/profile": { title: "Employee Profile", subtitle: "Personal records & employment identity" },
  "/payslips": { title: "Payroll & Compensation", subtitle: "Earnings statements & tax deductions" },
  "/users": { title: "Workforce Directory", subtitle: "Employee roster & department governance" },
  "/projects": { title: "Strategic Initiatives", subtitle: "Workforce deliverables & project progress" },
  "/settings": { title: "Portal Preferences", subtitle: "Appearance, theme & gateway parameters" },
};

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const userRef = React.useRef<HTMLDivElement>(null);

  const currentPage = pageTitles[pathname] || {
    title: pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2),
    subtitle: "PeoplePortal System",
  };

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(({ user }) => {
        if (active) setCurrentUser(user);
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden h-9 w-9 text-muted-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile brand logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-foreground">PeoplePortal</span>
        </div>

        {/* Breadcrumb / Title display */}
        <div className="hidden sm:flex flex-col">
          <h1 className="text-sm font-semibold text-foreground leading-tight">
            {currentPage.title}
          </h1>
          <span className="text-xs text-muted-foreground">
            {currentPage.subtitle}
          </span>
        </div>
      </div>

      {/* Center / Search bar */}
      <div className="hidden md:flex max-w-xs w-full items-center relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search portal directory..."
          className="h-8 w-full rounded-md border border-input bg-background/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Right controls: Theme, Notifications, User Profile */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card p-3 shadow-lg animate-in fade-in-0 zoom-in-95 z-50">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <span className="text-xs font-semibold text-foreground">HR Notifications</span>
                <span className="text-[10px] text-muted-foreground">2 pending</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-md bg-muted/50 p-2 text-left">
                  <p className="font-medium text-foreground">September 2024 Payslip Ready</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Your monthly payroll statement has been disbursed.</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2 text-left">
                  <p className="font-medium text-foreground">Annual Benefit Open Enrollment</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Review your medical and dental elections before Nov 15.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-full p-1 pl-1.5 pr-2.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={showUserMenu}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs border border-primary/30">
              {currentUser?.name
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2) ?? "PP"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-semibold text-xs leading-none">
                {currentUser?.name ?? "PeoplePortal User"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {currentUser?.role === "admin" ? "Administrator" : "Employee"}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card p-2 shadow-lg animate-in fade-in-0 zoom-in-95 z-50">
              <div className="px-2 py-2 border-b border-border mb-1">
                <p className="text-xs font-semibold text-foreground">
                  {currentUser?.name ?? "PeoplePortal User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentUser?.email ?? ""}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {currentUser?.role === "admin" ? "Administrator" : "Employee"}
                  </span>
                </div>
              </div>
              <div className="space-y-0.5 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile & Details</span>
                </Link>
                <Link
                  href="/payslips"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Payslips & Tax Forms</span>
                </Link>
                <div className="border-t border-border pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      void handleSignOut();
                    }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
