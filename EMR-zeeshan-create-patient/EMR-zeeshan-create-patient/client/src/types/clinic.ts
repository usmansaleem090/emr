export interface ClinicFormData {
  // Admin Account (for edit mode)
  username?: string;
  email?: string;
  password?: string;
  status?: string;
  
  // Basic Clinic Info (simplified - moved settings to separate table)
  clinicName: string;
  address: string;
  phone: string;
  clinicEmail: string;
  
  // Extended Fields
  type: 'group' | 'single';
  groupNpi?: string;
  taxId?: string;
  timeZone: string;
  
  // Practice Specialties
  practiceSpecialties: string[];
  
  // Branding
  practiceLogo?: string;
  primaryColor: string;
  
  // Settings (will be saved to clinic_settings table)
  enableSmsNotifications: boolean;
  enableVoiceCalls: boolean;
  reminderTimeHours: number;
  reminderTimeMinutes: number;
  
  // Payment & Insurance
  acceptedInsurances: string[];
  enableOnlinePayments: boolean;
  stripePublicKey?: string;
}

export interface ClinicLocation {
  id: number;
  clinicId: number;
  name: string;
  address: string;
  hours?: string;
  createdAt: string;
}

export interface ClinicModule {
  id: number;
  clinicId: number;
  moduleId: number;
  moduleName: string;
  moduleDescription?: string;
  createdAt: string;
}

export const PRACTICE_SPECIALTIES = [
  'Internal Medicine',
  'Family Medicine', 
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Psychiatry',
  'Radiology',
  'Emergency Medicine',
  'Anesthesiology',
  'Pathology',
  'Oncology',
  'Endocrinology',
  'Gastroenterology',
  'Pulmonology',
  'Nephrology',
  'Rheumatology',
  'Infectious Disease',
  'General Surgery'
];

export const ACCEPTED_INSURANCES = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Medicaid',
  'Medicare',
  'Tricare',
  'Cigna',
  'United Healthcare',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Molina Healthcare',
  'WellCare',
  'Centene',
  'Independence Blue Cross',
  'HealthFirst',
  'Oscar Health',
  'Bright Health',
  'Friday Health Plans'
];

export const TIME_ZONES = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Phoenix',
  'America/Detroit',
  'America/Indianapolis'
];