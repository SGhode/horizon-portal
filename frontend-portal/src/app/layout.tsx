import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { MSWProvider } from "@/components/providers/msw-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Portal — Administrative Platform & Design System",
  description:
    "A production-oriented frontend foundation built with Next.js App Router, TypeScript, Tailwind CSS, MSW, and Docker.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <MSWProvider>
              <AppShell>{children}</AppShell>
            </MSWProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
