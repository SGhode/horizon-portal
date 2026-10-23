"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  Building,
  MapPin,
  Lock,
  Edit3,
  Shield,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getEmployeeProfile, updateEmployeeProfile } from "@/lib/api/profile";
import { EmployeeProfile, UpdateProfilePayload } from "@/lib/types/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Diagnostic state simulator
  const [simulateMissingOptional, setSimulateMissingOptional] = React.useState(false);

  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [phoneInput, setPhoneInput] = React.useState("");
  const [addressInput, setAddressInput] = React.useState("");
  const [contactNameInput, setContactNameInput] = React.useState("");
  const [contactRelInput, setContactRelInput] = React.useState("");
  const [contactPhoneInput, setContactPhoneInput] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const { toast } = useToast();

  const fetchProfile = React.useCallback(async (triggerFailure = false) => {
    try {
      setLoading(true);
      setError(null);

      if (triggerFailure) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        throw new Error("HTTP 500: Failed to retrieve employee record from identity vault.");
      }

      const res = await getEmployeeProfile();
      setProfile(res);

      // Pre-fill editable state
      setPhoneInput(res.personalPhone);
      setAddressInput(res.residentialAddress);
      setContactNameInput(res.emergencyContact.name);
      setContactRelInput(res.emergencyContact.relationship);
      setContactPhoneInput(res.emergencyContact.phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load employee profile");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        personalPhone: phoneInput,
        residentialAddress: addressInput,
        emergencyContact: {
          name: contactNameInput,
          relationship: contactRelInput,
          phone: contactPhoneInput,
        },
      };

      const updated = await updateEmployeeProfile(payload);
      setProfile(updated);
      setEditDialogOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your personal contact details have been synced to the HR record.",
        type: "success",
      });
    } catch (err: unknown) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to save profile changes.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // State 4: Error state with retry action
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-card p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Employee Record Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {error}
        </p>
        <Button onClick={() => fetchProfile(false)} variant="primary" className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Employee Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Official identity records, departmental reporting structure, and permitted self-service contact details.
          </p>
        </div>

        {/* Action Controls & Diagnostic Simulator */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
            disabled={loading}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Permitted Info
          </Button>

          {/* Diagnostic state controls */}
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulateMissingOptional(!simulateMissingOptional)}
              className="text-xs h-8"
              title="Toggle missing optional information state (State 3)"
            >
              {simulateMissingOptional ? "Full Data" : "Test Missing Info"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProfile(true)}
              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              title="Test error state (State 4)"
            >
              Test Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProfile(false)}
              isLoading={loading}
              className="text-xs h-8"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-900/40 via-primary/20 to-indigo-900/40 border-b border-border" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 gap-4 pb-4 border-b border-border">
            <div className="flex items-end gap-4">
              {/* Avatar or Initials */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground font-bold text-2xl shadow-md overflow-hidden">
                {profile?.initials ?? "SG"}
              </div>
              <div className="space-y-1 mb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {loading ? <Skeleton className="h-6 w-44" /> : profile?.name}
                  </h3>
                  <Badge variant="success" className="text-xs">
                    {profile?.employmentStatus ?? "Active"}
                  </Badge>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground border border-border">
                    {profile?.employeeId ?? "PP-10482"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {loading ? (
                    <Skeleton className="h-4 w-60 mt-1" />
                  ) : (
                    `${profile?.jobTitle} · ${profile?.department}`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md border border-border">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Verified Corporate Identity
              </span>
            </div>
          </div>

          {/* Quick Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{profile?.workEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>{profile?.workPhone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Building className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">Reports to {profile?.manager}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{profile?.officeLocation}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* State 3 Notice Banner when simulated */}
      {simulateMissingOptional && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Incomplete Profile Record:</strong> Optional contact fields (emergency contact & residential address) are currently omitted. Click &apos;Edit Permitted Info&apos; to complete your records.
          </span>
        </div>
      )}

      {/* Two Column Grid: Personal Info (Editable) vs Employment Info (Read-Only) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 1: Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Contact and emergency details. Click edit button above to update permitted items.
              </CardDescription>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-xs">
              Self-Service Allowed
            </span>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {/* Field 1: Date of Birth (Read-only) */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      Date of Birth
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {profile?.dateOfBirth}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Verified</Badge>
                </div>

                {/* Field 2: Legal Gender (Read-only) */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      Legal Gender
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {profile?.gender}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Tax Record</Badge>
                </div>

                {/* Field 3: Residential Address (Editable) */}
                <div className="rounded-md border border-border bg-card p-2.5 flex items-start justify-between">
                  <div>
                    <span className="text-primary font-medium flex items-center gap-1.5">
                      Residential Address
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-xs">Editable</span>
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {simulateMissingOptional
                        ? <span className="text-muted-foreground italic font-normal">Not provided on file</span>
                        : profile?.residentialAddress}
                    </p>
                  </div>
                </div>

                {/* Field 4: Personal Phone (Editable) */}
                <div className="rounded-md border border-border bg-card p-2.5 flex items-start justify-between">
                  <div>
                    <span className="text-primary font-medium flex items-center gap-1.5">
                      Personal Mobile Phone
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-xs">Editable</span>
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {simulateMissingOptional
                        ? <span className="text-muted-foreground italic font-normal">Not provided on file</span>
                        : profile?.personalPhone}
                    </p>
                  </div>
                </div>

                {/* Field 5: Emergency Contact (Editable) */}
                <div className="rounded-md border border-border bg-card p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-primary font-medium flex items-center gap-1.5">
                      Emergency Contact
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-xs">Editable</span>
                    </span>
                  </div>
                  {simulateMissingOptional ? (
                    <p className="text-muted-foreground italic font-normal mt-0.5">
                      No emergency contact registered.
                    </p>
                  ) : (
                    <div className="space-y-1 mt-1">
                      <p className="font-semibold text-foreground text-sm">
                        {profile?.emergencyContact.name}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({profile?.emergencyContact.relationship})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {profile?.emergencyContact.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Employment Information (Strict Enterprise Read-Only) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Employment Information</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Official HR and payroll parameters locked by Enterprise Administration.
              </CardDescription>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-xs flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked by HR
            </span>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {/* Field: Hire Date */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      Original Hire Date
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {profile?.hireDate}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">3.5 yrs tenure</span>
                </div>

                {/* Field: Employment Type */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      Employment Classification
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {profile?.employmentType}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">W-2 Salaried</Badge>
                </div>

                {/* Field: Compensation Grade */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      Compensation Band & Grade
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5 font-mono">
                      {profile?.compensationGrade}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Annual Review: Q4</span>
                </div>

                {/* Field: Cost Center */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      Cost Center Allocation
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5 font-mono">
                      {profile?.costCenter}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Active</Badge>
                </div>

                {/* Field: FLSA Status */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      FLSA Overtime Status
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {profile?.flsaStatus}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Standard</Badge>
                </div>

                {/* Field: Work Authorization */}
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      I-9 Work Authorization
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </span>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {profile?.workAuthorization}
                    </p>
                  </div>
                  <Badge variant="success" className="text-[10px]">E-Verified</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Permitted Contact Information</DialogTitle>
            <DialogDescription>
              In accordance with corporate governance policy, only personal contact and emergency notification details may be directly updated here.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 py-2 text-xs">
            {/* Note on Read-only Fields */}
            <div className="rounded-md bg-muted/60 p-2.5 text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                To modify legal name, job title, tax filing status, or compensation grade, please submit a formal request via the HR Operations Desk.
              </span>
            </div>

            {/* Editable Field 1: Phone */}
            <Input
              label="Personal Mobile Phone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+1 (555) 000-0000"
              helperText="Used for automated emergency communications and secondary 2FA fallback."
            />

            {/* Editable Field 2: Address */}
            <Input
              label="Residential Street Address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="123 Street Name, City, State ZIP"
              helperText="Must match primary residency for state tax withholding and W-2 issuance."
            />

            {/* Editable Field 3: Emergency Contact Details */}
            <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/20">
              <span className="font-semibold text-foreground block text-xs">
                Emergency Contact Details
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  label="Contact Full Name"
                  value={contactNameInput}
                  onChange={(e) => setContactNameInput(e.target.value)}
                  placeholder="e.g. Priya Ghode"
                />
                <Input
                  label="Relationship"
                  value={contactRelInput}
                  onChange={(e) => setContactRelInput(e.target.value)}
                  placeholder="e.g. Spouse, Sibling"
                />
              </div>
              <Input
                label="Contact Phone Number"
                value={contactPhoneInput}
                onChange={(e) => setContactPhoneInput(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
