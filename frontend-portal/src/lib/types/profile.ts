export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  name: string;
  initials: string;
  jobTitle: string;
  department: string;
  employmentStatus: "Full-Time Regular" | "Part-Time" | "Contractor" | "On Leave";
  workEmail: string;
  workPhone: string;
  manager: string;
  managerTitle: string;
  officeLocation: string;
  timeZone: string;
  avatarUrl?: string;

  // Personal information
  dateOfBirth: string; // Read-only enterprise field
  gender: string; // Read-only enterprise field
  residentialAddress: string; // Editable permitted field
  personalPhone: string; // Editable permitted field
  emergencyContact: EmergencyContact; // Editable permitted field

  // Employment information (All read-only enterprise fields)
  hireDate: string;
  employmentType: string;
  compensationGrade: string;
  costCenter: string;
  flsaStatus: "Exempt" | "Non-Exempt";
  workAuthorization: string;
}

export interface UpdateProfilePayload {
  personalPhone?: string;
  residentialAddress?: string;
  emergencyContact?: EmergencyContact;
}
