import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <HelpCircle className="h-8 w-8" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        404 — Page Not Found
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        The route you are looking for does not exist in the administrative portal or has been relocated.
      </p>
      <div className="mt-6">
        <Button asChild variant="primary" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
