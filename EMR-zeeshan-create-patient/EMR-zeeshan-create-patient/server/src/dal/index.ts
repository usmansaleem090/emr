// Consolidated Security DAL exports
export { 
  UserDAL, 
  RoleDAL, 
  ModuleDAL, 
  OperationDAL, 
  ModuleOperationDAL, 
  RolePermissionDAL, 
  UserAccessDAL 
} from './securityDAL';

// Consolidated Clinic Management DAL exports
export {
  ClinicDAL,
  ClinicLocationDAL,
  ClinicDocumentDAL,
  ClinicFaxDAL,
  ClinicModuleDAL,
  ClinicServiceDAL,
  ClinicStaffDAL,
  ClinicSettingsDAL
} from './clinic-management/clinicDAL';

// Specialty DAL exports
export { SpecialtyDAL } from './clinic-management/specialtyDAL';

// Insurance DAL exports
export { InsuranceDAL } from './clinic-management/insuranceDAL';

// Location Service DAL exports
export { LocationServiceDAL } from './clinic-management/locationServiceDAL'; 