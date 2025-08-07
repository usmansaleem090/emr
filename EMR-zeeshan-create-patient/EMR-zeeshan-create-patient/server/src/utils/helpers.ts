import bcrypt from "bcrypt";

// API Response helper
export const createResponse = (
  success: boolean,
  message: string,
  data?: any,
  meta?: any
) => {
  return {
    success,
    message,
    ...(data && { data }),
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
};

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Generate random strings
export const generateRandomString = (length: number): string => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

// Generate Medical Record Number
export const generateMRN = (): string => {
  return generateRandomString(10);
};

// Date formatting helpers
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Age calculation
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
};

// Generate medical record number for patients
export const generateMedicalRecordNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `MRN${year}${month}${random}`;
};

// Generate EMR number for patients with format YYYYMMXXXX
// This function will be called from DAL where db is already imported
export const generateEMRNumber = async (clinicId?: number): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // Create YYYYMM prefix
  const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
  
  // Format as 4-digit sequential string - start with 0001
  // The actual sequence will be calculated in the DAL layer
  return `${yearMonth}0001`;
};

// Parse time to minutes for schedule calculations
export const parseTimeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};
