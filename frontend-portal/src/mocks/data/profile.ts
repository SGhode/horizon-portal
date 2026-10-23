import { EmployeeProfile } from "@/lib/types/profile";

export const mockEmployeeProfile: EmployeeProfile = {
  id: "emp-001",
  employeeId: "PP-10482",
  name: "Shivraj Ghode",
  initials: "SG",
  jobTitle: "Lead Full-Stack Software Engineer",
  department: "Product Engineering",
  employmentStatus: "Full-Time Regular",
  workEmail: "shivraj.ghode@peopleportal.internal",
  workPhone: "+1 (555) 234-8901",
  manager: "Marcus Vance",
  managerTitle: "VP of Engineering & Platform",
  officeLocation: "San Francisco HQ — Bldg B, Fl 4",
  timeZone: "America/Los_Angeles (PST)",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",

  // Personal Information
  dateOfBirth: "October 14, 1992",
  gender: "Male",
  residentialAddress: "742 Evergreen Terrace, San Francisco, CA 94107",
  personalPhone: "+1 (555) 987-6543",
  emergencyContact: {
    name: "Priya Ghode",
    relationship: "Spouse",
    phone: "+1 (555) 345-6789",
  },

  // Employment Information (Enterprise Read-Only)
  hireDate: "March 15, 2021",
  employmentType: "Regular Exempt (Salary)",
  compensationGrade: "IC-5 / Senior Staff",
  costCenter: "CC-8041 (Core Platform Engineering)",
  flsaStatus: "Exempt",
  workAuthorization: "US Citizen",
};
