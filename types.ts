
export enum ToothStatus {
  HEALTHY = 'Healthy',
  FILLED = 'Filled',
  TREATED = 'Root Canal',
  CROWN = 'Crown',
  VENEER = 'Veneer',
  MISSING = 'Missing',
  IMPLANT = 'Implant',
  ATTENTION = 'Needs Attention'
}

export enum TreatmentType {
  FILLING = 'Filling',
  ROOT_CANAL = 'Root Canal',
  CROWN = 'Crown',
  EXTRACTION = 'Extraction',
  VENEER = 'Veneer',
  IMPLANT = 'Implant',
  BRACES = 'Braces/Mouthguard',
  HYGIENE = 'Hygiene/Cleaning',
  CHECKUP = 'Checkup',
  OTHER = 'Other'
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // Base64 for this MVP
}

export interface Treatment {
  id: string;
  toothId: number | null; // null means general procedure (like hygiene)
  type: TreatmentType;
  date: string; // ISO date string
  notes: string;
  cost?: number;
  currency: string;
  attachments: Attachment[];
  dentistId?: string; // Reference to local dentist
}

export interface Tooth {
  id: number; // FDI Number (11-18, 21-28, 31-38, 41-48)
  label: string; // "18", "17", etc.
  status: ToothStatus;
}

export interface UserProfile {
  name: string;
  dob: string;
  bloodType: string;
  allergies: string;
  medicalNotes: string;
}

export interface UserSettings {
  name: string;
  nextCheckupDate?: string;
}

export type Quadrant = 'UR' | 'UL' | 'LL' | 'LR'; // Upper Right, Upper Left, etc.

export enum DentistType {
  GENERAL = 'General Dentist',
  SURGEON = 'Oral Surgeon',
  ENDODONTIST = 'Endodontist',
  ORTHODONTIST = 'Orthodontist',
  PERIODONTIST = 'Periodontist',
  PEDIATRIC = 'Pediatric Dentist',
  PROSTHODONTIST = 'Prosthodontist',
  OTHER = 'Other'
}

export interface Dentist {
  id: string;
  name: string;
  clinicName?: string;
  type?: DentistType;
  phone?: string;
  notes?: string;
  isVerified: boolean; // For future matching with verified dentists
}
