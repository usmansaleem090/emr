# Replit.md - EMR Healthcare Management System

## Overview

This is a full-stack Electronic Medical Records (EMR) healthcare management system built with modern web technologies. The application features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM. The system includes a comprehensive role-based permission system with superadmin functionality, clinic management, and modular operations structure.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Styling**: Custom medical theme with healthcare-specific color palette
- **State Management**: Redux Toolkit for global state management
- **Data Fetching**: TanStack React Query for server state management
- **HTTP Client**: Axios with interceptors for API communication
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, and XSS protection middleware
- **Database**: PostgreSQL with Neon serverless connection
- **API Design**: RESTful API with structured error handling

## Key Components

### Database Schema
The system uses a PostgreSQL database with a comprehensive role-based access control structure:
- **Users**: Healthcare professionals with user types (Clinic, Doctor, Patient, Staff) and clinic associations
- **Roles**: Hierarchical role system with customizable permissions
- **Modules**: System modules (User Management, Clinic Management, Patient Management, etc.)
- **Operations**: CRUD and specialized operations (Create, Read, Update, Delete, Export, etc.)
- **Clinics**: Multi-tenant clinic support with individual permission controls
- **Permission System**: Granular module-operation permissions for roles and clinics

Recent Changes (July 2025):
- Created attractive and unique landing page with slider section and medical theme (July 2025):
  - Built comprehensive landing page with 4-slide hero section featuring EMR capabilities
  - Implemented automatic slide transitions with manual navigation controls and slide indicators
  - Added prominent "Proceed" button that navigates to login page as requested
  - Designed modern medical theme with gradient backgrounds and healthcare icons
  - Included features section, testimonials, and call-to-action areas for professional appearance
  - Used responsive design with mobile-friendly navigation and animations
  - Landing page now serves as root route (/) while login remains at /login
  - No changes made to existing APIs or other functionality as requested
- Implemented comprehensive clinic document management system with full CRUD operations and multi-file upload support (July 2025):
  - Created clinic_documents database table with comprehensive file metadata tracking (title, file_path, file_type, file_size, uploaded_by, description, timestamps)
  - Built complete backend API using multer middleware for secure file upload to server directory with path management
  - Developed ClinicDocuments component with upload, edit, delete, and download capabilities supporting multiple file formats
  - Integrated Documents tab into both AddClinicPage and EditClinicPage for complete document lifecycle management
  - Added support for multiple file upload with automatic title generation and file type validation
  - Implemented secure file storage with proper error handling and progress indicators
  - Document management supports PDF, Word, Excel, Images, and Text files with size formatting and type detection
- Implemented complete task management system with CRUD operations and assignment functionality (July 2025):
  - Built comprehensive task database schema with tasks and task_comments tables
  - Created full backend API with TaskDAL for task operations, comments, and user assignments
  - Developed three frontend pages: TasksPage (list/filter), AddTaskPage (create), TaskDetailPage (view/edit/comment)
  - Fixed data rendering issues by improving API response parsing and error handling
  - Enhanced assignable users dropdown with proper data loading from clinic staff
  - Implemented complete task detail page with editing, status updates, and comment system
  - Added task statistics dashboard with status and priority breakdowns
  - Task management fully integrated into clinic workflow with proper permission controls
- Completed comprehensive appointment booking system with time slot management (July 2025):
  - Fixed critical dropdown rendering issues - data loading from APIs but not displaying in UI components
  - Resolved API response structure problems and enhanced data access patterns with fallback logic
  - Completely rebuilt time slots generation system - removed dependency on non-existent "working_hours" database column
  - Simplified time slot system to generate 30-minute intervals from 9 AM to 5 PM with appointment conflict checking
  - Enhanced React Select components with proper data access patterns for patients, doctors, and locations
  - Fixed appointment creation validation by adding missing clinicId and createdBy fields with proper user data mapping
  - Implemented complete appointment booking workflow: patient selection → doctor selection → location selection → date selection → time slot selection → appointment creation
- Successfully debugged and fixed staff management API issues (July 2025):
  - Fixed clinic-staff route registration in server routes.ts - route was missing from API endpoints
  - Corrected database query structure in ClinicStaffDAL.ts with proper query builder syntax
  - Added proper ES module export statements for clinic-staff routes
  - Enhanced error handling and response structure consistency
  - Created test staff data to verify functionality (Sarah Johnson - Nurse, Mike Wilson - Receptionist)
  - Resolved "Cannot read properties of undefined" errors with robust API response handling
  - Staff management now properly integrated into ClinicProfilePage.tsx with three-tab layout
- Successfully converted all React Query dependencies to pure axios (July 2025):
  - Removed @tanstack/react-query completely from the entire application
  - Converted all useQuery and useMutation calls to pure axios with useState/useEffect patterns
  - Updated all pages: ClinicsPage, EditClinicPage, EditPatientPage, AddPatientPage, EditDoctorPage, DoctorSchedulePage, and AddClinicPage
  - All API calls now use standardized axios methods from apiClient.ts with automatic JWT token inclusion
  - Maintains all existing functionality while improving performance and reducing bundle size
  - Fixed all compilation errors and runtime issues during conversion process
- Implemented global role system (July 2025):
  - Removed clinic relationship from roles table - now all roles are application-wide
  - Updated role schema and DAL to remove clinic dependencies
  - Modified roles API routes to handle global roles only
  - Added Roles menu item visible only to SuperAdmin users
  - Updated RolesPage to display and manage global roles without clinic association
  - SuperAdmin can now create global roles and assign permissions across the entire application
  - Fixed role permissions assignment with proper error handling and green success notifications
  - Added comprehensive "Select All" functionality for both global and module-level permission selection
  - Implemented accurate role statistics showing correct permission and user counts in roles table
  - Enhanced permission persistence - assigned permissions now display correctly when revisiting role details
- Implemented comprehensive clinic management system (July 2025):
  - Extended clinic schema with 15+ new fields including type, NPI, tax ID, time zone, specialties, branding, settings
  - Added clinic locations table for multi-location support with services and providers tracking
  - Created clinic modules assignment system for granular feature access control
  - Built modular frontend components: ClinicBasicInfo, ClinicSpecialties, ClinicBranding, ClinicSettings, ClinicInsurance, ClinicLocations, ClinicModules
  - Implemented comprehensive 8-tab clinic creation/editing workflow with validation and navigation
  - Added payment integration preparation with Stripe public key fields and online payments toggle
  - Created insurance acceptance management with 18 major insurance providers
  - Added practice specialties selection from 20 medical specialties
  - Implemented clinic branding with logo upload and primary color customization
  - Added communication settings: SMS notifications, voice calls, reminder timing
  - Built multi-location support with operating hours, services, and provider assignments
  - Created module assignment system allowing clinics to access specific system features
  - Enhanced API routes with comprehensive CRUD operations for locations and module assignments

Previous Changes (January 2025):
- Implemented complete doctors management module with full CRUD operations (January 2025)
- Added doctors table with user relationship, specialty, license number, and status tracking
- Enhanced users table with role_id, first_name, last_name, and phone fields for better profile management
- Created comprehensive API endpoints for doctors with role assignment functionality
- Built responsive frontend pages: DoctorsPage, AddDoctorPage, and EditDoctorPage with role selection
- Integrated specialty selection with predefined medical specialties list
- Added license number uniqueness validation and comprehensive form validation
- Connected doctors module to existing role-based permission system
- Fixed role creation duplicate name validation with proper error handling
- Enhanced role filtering to show both global and clinic-specific roles for proper doctor assignment
- Resolved frontend Select component validation errors and icon import issues
- Successfully tested complete doctors workflow: create, view, edit, delete with role assignment
- Implemented comprehensive doctor scheduling system (July 2025):
  - Added doctor_schedules table with weekly schedule management, break times, and active status
  - Added doctor_time_off table for vacation/sick leave requests with approval workflow  
  - Created complete scheduling API with availability checking and time-off management
  - Built responsive schedule management interface with visual overview and statistics
  - Integrated schedule access directly from doctors page with clock icon button
  - Supports day-of-week scheduling, working hours, break times, and detailed notes
  - Time-off system includes multiple reasons (vacation, sick, conference, etc.) with approval status
- Completely restructured codebase architecture to follow proper patterns with individual model folders
- Created separate schema and DAL files for each entity (User, Role, Clinic, Module, Operation, UserRole, ModuleOperation, RolePermission, ClinicPermission)
- Removed shared schema approach and implemented model-specific schemas in their respective folders
- Updated database operations to use DAL pattern for all queries
- Created proper index files for easier imports and maintained working superadmin login functionality
- Implemented comprehensive database schema with 9 interconnected tables
- Added superadmin auto-seeding functionality with default permissions
- Set up JWT-based authentication system with secure password hashing
- Redesigned permissions management interface with tree structure (July 2025)
- Replaced tabbed interface with hierarchical module-operation view for better user experience
- Implemented single form for creating modules and selecting operations simultaneously
- Added ability to create new operations on-the-fly during module creation
- Fixed API response handling and TypeScript type definitions for frontend
- Separated SuperAdmin and Clinic operational roles (July 2025):
  - SuperAdmin: Only sees administrative menus (Dashboard, Clinics, User Management, Permissions, Settings)
  - Clinic roles: See operational menus (Patients, Doctors, Appointments, Reports, Medical Records)
  - SuperAdmin role detection based on having 20+ permissions rather than userType field
  - Fixed permissions API to properly query role-based permissions from PostgreSQL database
- Implemented complete role-based menu system (July 2025):
  - SuperAdmin sees only: Dashboard, Permissions, Clinics (identified by having 20+ permissions)
  - Clinic users see all menus except Clinics and Permissions (can create roles and assign modules/operations)
  - Other users (Doctor, Patient, Staff) see menus based on their role permissions
  - Completely removed all clinic permission functionality from frontend and backend
  - Removed clinic_permission table, permissions tabs from clinic forms, and permission endpoints
  - Clean database with implemented modules: Patient Management, User Management, Doctor Management, Clinic Management, System Settings
  - Simplified clinic management: only basic clinic info and admin account creation/editing
  - SuperAdmin credentials: email "superadmin@emr.com", password "superadmin123"

### Authentication System
- JWT token-based authentication with configurable expiration
- Password hashing using bcrypt with 12 salt rounds
- Role-based authorization middleware
- Rate limiting for login attempts to prevent brute force attacks
- Remember me functionality for extended sessions

### Frontend Components
- **LoginBranding**: Medical-themed branding component with healthcare imagery
- **LoginForm**: Comprehensive login form with validation and error handling
- **UI Components**: Complete shadcn/ui component library implementation
- **Redux Slices**: Auth and UI state management

### Backend Services
- **AuthController**: Handles login, logout, and token verification
- **UserDAL**: Data access layer for user operations
- **Middleware**: Security, authentication, error handling, and validation
- **Database Storage**: Abstracted storage layer using Drizzle ORM

## Data Flow

1. **User Authentication**: Client sends credentials → Backend validates → JWT token issued → Client stores token
2. **API Requests**: Client includes JWT in Authorization header → Backend validates token → Processes request
3. **Database Operations**: Backend uses Drizzle ORM → PostgreSQL database operations → Returns structured data
4. **State Management**: Redux for auth state, React Query for server state caching and synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@reduxjs/toolkit**: State management
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Headless UI components
- **axios**: HTTP client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token handling

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **tailwindcss**: Utility-first CSS framework
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript server with hot reload
- Environment variables for configuration
- Database migrations using Drizzle Kit

### Production Build
- Frontend: Vite builds static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Single deployment artifact with Express serving both API and static files
- PostgreSQL database with connection pooling

### Configuration
- Environment-based configuration with validation
- Separate development and production settings
- Database URL and JWT secrets via environment variables
- CORS and security headers configured per environment

### Key Features
- HIPAA-compliant security measures
- Medical-themed UI with healthcare color palette
- Responsive design for desktop and mobile use
- Type-safe development with TypeScript throughout
- Comprehensive error handling and validation
- Rate limiting and security middleware
- Audit trails with timestamps
- Complete doctors management system with CRUD operations and scheduling (July 2025)
- Role-based permissions assignment for doctors
- Medical specialty tracking and license number validation
- Integrated user account creation with doctor profiles
- Comprehensive doctor scheduling system with weekly hours, breaks, and time-off management
- Visual schedule overview with availability checking and approval workflows
- Complete patient management system with full CRUD operations (July 2025)
- Patient records with medical record numbers, clinic assignments, and status tracking
- User account integration with Patient type for login and profile management
- Professional datetime pickers for time-off requests with approval controls