export enum VerificationStatus {
  VALID = "valid",
  UNCLEAR = "unclear",
  SUSPECT = "suspect",
}

export interface Verification {
  awardValidity: VerificationStatus;
  universityValidity: VerificationStatus;
  notes: string;
}

export interface TutorProfile {
  id: string;
  fullName: string;
  email?: string; // extracted email from CV
  avatarUrl?: string; // optional URL to avatar (if provided or generated)
  phone?: string; // extracted phone number for contact
  location: {
    city: string;
    district: string;
  };
  salaryPerHour: number | null;
  subjects: string[];
  mode: "online" | "offline" | "hybrid";
  education: {
    university: string;
    degree: string;
  };
  awards: Array<{ name: string; year?: number }>;
  experienceSummary: string;
  evidenceUrls: string[];
  verification: Verification;
}

export interface FilterState {
  salary: {
    min: number;
    max: number;
  };
  subjects: string[];
}
