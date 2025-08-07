import { z, ZodSchema } from "zod";

export const validateRequest = <T>(schema: ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

export const validatePartialRequest = <T>(schema: ZodSchema<T>, data: unknown): Partial<T> => {
  // For now, just validate with the full schema
  // This can be improved with proper partial validation if needed
  return schema.parse(data) as Partial<T>;
};

// Common validation schemas
export const emailSchema = z.string().email("Invalid email format");
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number format");

// Date validation helpers
export const validateDateOfBirth = (date: Date): boolean => {
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120); // Max age 120 years
  
  return date <= today && date >= minDate;
};

// Medical Record Number validation
export const mrnSchema = z.string()
  .regex(/^[A-Z0-9]{8,12}$/, "MRN must be 8-12 alphanumeric characters");
