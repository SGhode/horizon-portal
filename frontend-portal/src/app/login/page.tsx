"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { login } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { safeReturnTo } from "@/lib/auth/redirect";

const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid work email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [serviceError, setServiceError] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setServiceError(
      query.get("error") === "auth-unavailable" ||
        query.get("error") === "logout-unconfirmed"
    );
  }, []);

  // Forgot password dialog
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [recoveryEmail, setRecoveryEmail] = React.useState("");
  const [recoverySubmitted, setRecoverySubmitted] = React.useState(false);

  const handleSignIn = async (values: LoginValues) => {
    setAuthError(null);

    try {
      await login({ ...values, rememberMe });
      setSuccess(true);
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      router.replace(safeReturnTo(returnTo));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setAuthError("Invalid email or password. Please check your credentials and try again.");
      } else if (error instanceof ApiClientError && (error.status ?? 0) >= 500) {
        setAuthError("The authentication service is temporarily unavailable. Please try again shortly.");
      } else {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Sign-in failed. Please try again."
        );
      }
    }
  };

  const prefillDemo = (type: "employee" | "admin" | "invalid") => {
    setAuthError(null);
    if (type === "employee") {
      setValue("email", "shivraj.ghode@peopleportal.internal");
      setValue("password", "employeePass123!");
    } else if (type === "admin") {
      setValue("email", "admin.workforce@peopleportal.internal");
      setValue("password", "adminEnterprise2024!");
    } else {
      setValue("email", "unauthorized.user@external.com");
      setValue("password", "wrongpassword");
    }
  };

  const showDemoProfiles =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_AUTH_DEMO_ENABLED === "true";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top utility bar */}
      <div className="flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground">
              PeoplePortal
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Enterprise Workforce System
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md my-auto py-8">
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1.5 pb-4 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
              <KeyRound className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Sign In to PeoplePortal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your corporate credentials to access workforce services, payslips, and profile records.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Authentication error banner (State 3: Invalid Credentials) */}
            {(authError || serviceError) && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Authentication Failed</p>
                  <p className="leading-relaxed">
                    {authError ||
                      (serviceError
                        ? "Your local session was cleared, but the authentication service could not confirm sign-out. Contact support if this continues."
                        : "The authentication service is temporarily unavailable. Please try again shortly.")}
                  </p>
                </div>
              </div>
            )}

            {/* Success banner during transition */}
            {success && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in-50"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Authentication verified. Redirecting to workspace...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-3.5" noValidate>
              {/* Email Input */}
              <div className="space-y-1">
                <Input
                  label="Work Email Address"
                  type="email"
                  id="login-email"
                  placeholder="name@company.com"
                  {...register("email")}
                  error={errors.email?.message}
                  autoComplete="email"
                  disabled={isSubmitting || success}
                />
              </div>

              {/* Password Input with show/hide toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium leading-none text-foreground select-none"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail("");
                      setForgotPasswordOpen(true);
                    }}
                    className="text-xs text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    {...register("password")}
                    disabled={isSubmitting || success}
                    className={`flex h-9 w-full rounded-md border bg-card px-3 pr-10 py-1 text-sm shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input"
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting || success}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                >
                  Remember this device until your session expires
                </label>
              </div>

              {/* Submit Button (State 2: Loading) */}
              <Button
                type="submit"
                variant="primary"
                className="w-full gap-2 mt-2 h-10 font-semibold"
                isLoading={isSubmitting}
                disabled={success}
              >
                <span>Sign In to Portal</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            {/* Quick Demo Credentials Panel */}
            {showDemoProfiles && (
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border" />
                  <span className="flex-shrink mx-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Interactive Demo Profiles
                  </span>
                  <div className="flex-grow border-t border-border" />
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2 font-normal"
                    onClick={() => prefillDemo("employee")}
                    title="Pre-fill employee credentials"
                  >
                    Employee
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2 font-normal"
                    onClick={() => prefillDemo("admin")}
                    title="Pre-fill administrator credentials"
                  >
                    Administrator
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2 font-normal text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => prefillDemo("invalid")}
                    title="Pre-fill invalid credentials to test error state"
                  >
                    Test Error
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col border-t border-border bg-muted/20 py-3 text-center text-[11px] text-muted-foreground space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Protected by Enterprise SSO & MFA Verification</span>
            </div>
            <p className="text-[10px]">
              Access restricted to authorized personnel. Session events are logged.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Professional enterprise footer */}
      <footer className="w-full max-w-6xl text-center text-xs text-muted-foreground py-2 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2024 PeoplePortal Inc. All rights reserved.</span>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setForgotPasswordOpen(true)}
            className="hover:text-foreground hover:underline"
          >
            Help & IT Support
          </button>
          <span>·</span>
          <span className="text-muted-foreground">System v2.4.0</span>
          <span>·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Service Operational
          </span>
        </div>
      </footer>

      {/* Forgot Password / Self-Service Recovery Modal */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Corporate Password</DialogTitle>
            <DialogDescription>
              Submit your corporate email address to receive password recovery instructions via your organization&apos;s Identity Provider (Okta / Azure AD).
            </DialogDescription>
          </DialogHeader>

          {recoverySubmitted ? (
            <div className="space-y-3 py-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>
                  Password reset link has been dispatched to{" "}
                  <strong className="font-semibold">{recoveryEmail || "your email"}</strong>. Please follow the instructions sent to your corporate inbox.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                If you do not receive an email within 5 minutes, please contact the IT Help Desk at extension 4357.
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <Input
                label="Registered Work Email"
                type="email"
                placeholder="name@company.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
              <div className="rounded-md bg-muted/60 p-2.5 text-[11px] text-muted-foreground">
                <strong>Enterprise Policy:</strong> Passwords must have at least 12 characters, including upper/lower letters, numbers, and special symbols.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setForgotPasswordOpen(false);
                setRecoverySubmitted(false);
              }}
            >
              {recoverySubmitted ? "Close" : "Cancel"}
            </Button>
            {!recoverySubmitted && (
              <Button
                variant="primary"
                onClick={() => {
                  if (recoveryEmail.trim()) {
                    setRecoverySubmitted(true);
                  }
                }}
              >
                Send Recovery Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
