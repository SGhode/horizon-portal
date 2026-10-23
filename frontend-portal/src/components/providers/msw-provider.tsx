"use client";

import * as React from "react";

interface MSWProviderProps {
  children: React.ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function initMocks() {
      const isMockingEnabled =
        process.env.NEXT_PUBLIC_API_MOCKING === "enabled" ||
        (process.env.NODE_ENV === "development" &&
          process.env.NEXT_PUBLIC_API_MOCKING !== "disabled");

      if (!(isMockingEnabled && typeof window !== "undefined" && "serviceWorker" in navigator)) {
        if (isMounted) {
          setIsReady(true);
        }
        return;
      }

      try {
        const { worker } = await import("@/mocks/browser");

        if (!(window as typeof window & { __portalMswStarted__?: boolean }).__portalMswStarted__) {
          await Promise.race([
            worker.start({
              serviceWorker: {
                url: "/mockServiceWorker.js",
              },
              onUnhandledFrame: "bypass",
            }),
            new Promise((resolve) => setTimeout(resolve, 1200)),
          ]);

          (window as typeof window & { __portalMswStarted__?: boolean }).__portalMswStarted__ = true;
          console.info("[MSW] Mock Service Worker started successfully.");
        }
      } catch (error) {
        console.error("[MSW] Failed to initialize Mock Service Worker:", error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    initMocks();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Initializing Portal...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
