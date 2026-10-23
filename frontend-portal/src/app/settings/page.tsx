"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Monitor,
  Server,
  Bell,
  Code2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const triggerToast = (type: "success" | "error" | "info") => {
    if (type === "success") {
      toast({
        title: "Settings Saved Successfully",
        description: "Your appearance and runtime configurations have been synced.",
        type: "success",
      });
    } else if (type === "error") {
      toast({
        title: "Configuration Sync Failed",
        description: "Simulated validation error: please verify your parameters.",
        type: "error",
      });
    } else {
      toast({
        title: "Portal System Diagnostic",
        description: "MSW mock service worker is running in active interception mode.",
        type: "info",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Portal Settings & System Config
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage appearance themes, view API connectivity specs, and test interface components.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance & Theming Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <CardTitle>Appearance & Theme</CardTitle>
            </div>
            <CardDescription>
              Select your preferred visual appearance. Themes persist across browser sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-3 text-center transition-all ${
                  mounted && theme === "light"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Sun className="h-5 w-5 mb-2" />
                <span className="text-xs font-semibold">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-3 text-center transition-all ${
                  mounted && theme === "dark"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Moon className="h-5 w-5 mb-2" />
                <span className="text-xs font-semibold">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-3 text-center transition-all ${
                  mounted && theme === "system"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Monitor className="h-5 w-5 mb-2" />
                <span className="text-xs font-semibold">System</span>
              </button>
            </div>

            <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              Current active theme mode:{" "}
              <span className="font-semibold text-foreground capitalize">
                {mounted ? theme : "loading..."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Component & Toast Testing Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Interactive Toast Triggers</CardTitle>
            </div>
            <CardDescription>
              Test notification triggers and toast state dispatchers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerToast("success")}
                className="text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerToast("error")}
                className="text-xs border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
              >
                Trigger Error Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerToast("info")}
                className="text-xs border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
              >
                Trigger Info Toast
              </Button>
            </div>

            <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              Click any button above to test toast dispatches.
            </div>
          </CardContent>
        </Card>

        {/* Runtime & Environment Parameters (No Secrets) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Environment & Backend Gateway Configuration</CardTitle>
            </div>
            <CardDescription>
              Provisional API parameters and client runtime properties. Secrets are redacted and kept server-side.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <span className="text-xs font-medium text-muted-foreground">API Base URL</span>
                <p className="font-mono text-sm font-semibold text-foreground mt-1">
                  /api
                </p>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Same-origin Next.js routes
                </span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <span className="text-xs font-medium text-muted-foreground">Browser Mock Handlers</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    None (server routes)
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Authentication always runs server-side
                </span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <span className="text-xs font-medium text-muted-foreground">Deployment Runtime</span>
                <p className="font-mono text-sm font-semibold text-foreground mt-1">
                  Next.js App Router (Standalone)
                </p>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Multi-stage Docker container
                </span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <span className="text-xs font-medium text-muted-foreground">Container Health Probe</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    GET /health (HTTP 200)
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Monitored via Docker Compose
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span>Python Authentication Backend</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When the Python FastAPI backend is ready, update your <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">.env</code>:
              </p>
              <pre className="mt-2 rounded-md bg-card p-3 font-mono text-xs text-foreground border border-border overflow-x-auto">
{`AUTH_BACKEND_URL=http://localhost:8000
AUTH_DEV_MOCK_ENABLED=false`}
              </pre>
              <p className="text-[11px] text-muted-foreground mt-2">
                Authentication requests are proxied server-side; the backend URL is never exposed to the browser.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
