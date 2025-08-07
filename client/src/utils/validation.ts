import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Password must contain at least one letter and one number");

export const nameSchema = z
  .string()
  .min(1, "This field is required")
  .min(2, "Must be at least 2 characters long")
  .max(50, "Must be less than 50 characters long")
  .regex(/^[a-zA-Z\s-']+$/, "Only letters, spaces, hyphens, and apostrophes are allowed");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number");

// Form validation helpers
export const validateEmail = (email: string): string | null => {
  try {
    emailSchema.parse(email);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid email";
    }
    return "Invalid email";
  }
};

export const validatePassword = (password: string): string | null => {
  try {
    passwordSchema.parse(password);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid password";
    }
    return "Invalid password";
  }
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
};

// Medical specific validations
export const mrnSchema = z
  .string()
  .min(1, "Medical Record Number is required")
  .regex(/^[A-Z0-9]{8,12}$/, "MRN must be 8-12 alphanumeric characters");

export const validateMRN = (mrn: string): string | null => {
  try {
    mrnSchema.parse(mrn);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid MRN";
    }
    return "Invalid MRN";
  }
};

// Date validation
export const validateDateOfBirth = (dateString: string): string | null => {
  if (!dateString) return "Date of birth is required";
  
  const date = new Date(dateString);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);
  
  if (isNaN(date.getTime())) {
    return "Please enter a valid date";
  }
  
  if (date > today) {
    return "Date of birth cannot be in the future";
  }
  
  if (date < minDate) {
    return "Please enter a valid date of birth";
  }
  
  return null;
};

// Generic form validation
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => string | null>
): Record<keyof T, string | null> => {
  const errors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
  
  for (const key in rules) {
    errors[key] = rules[key](data[key]);
  }
  
  return errors;
};

// Check if form has any errors
export const hasFormErrors = <T extends Record<string, any>>(
  errors: Record<keyof T, string | null>
): boolean => {
  return Object.values(errors).some(error => error !== null);
};
