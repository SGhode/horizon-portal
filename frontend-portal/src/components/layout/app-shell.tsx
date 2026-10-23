"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { X } from "lucide-react";
import { safeReturnTo } from "@/lib/auth/redirect";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If on login screen, render outside the authenticated application shell
  const isAuthPage = pathname === "/login";

  React.useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const detail = (event as CustomEvent<{ returnTo?: string }>).detail;
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("returnTo", safeReturnTo(detail?.returnTo));
      router.replace(`${loginUrl.pathname}${loginUrl.search}`);
    };
    window.addEventListener("peopleportal:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("peopleportal:unauthorized", handleUnauthorized);
  }, [router]);

  // Close mobile drawer on resize to desktop
  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex h-full w-72 flex-col bg-sidebar shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-4 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Right main area: Topbar + Page Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onToggleSidebar={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
