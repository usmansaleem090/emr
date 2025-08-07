import { lazy } from 'react';
import { ReportsPlaceholder, MedicalRecordsPlaceholder, SettingsPlaceholder } from '@/components/PlaceholderPages';

// Lazy load all components
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const PatientsPage = lazy(() => import("@/pages/PatientsPage"));
const AddPatientPage = lazy(() => import("@/pages/AddPatientPage"));
const EditPatientPage = lazy(() => import("@/pages/EditPatientPage"));
const DoctorsPage = lazy(() => import("@/pages/DoctorsPage"));
const AddDoctorPage = lazy(() => import("@/pages/AddDoctorPage"));
const EditDoctorPage = lazy(() => import("@/pages/EditDoctorPage"));
const AppointmentsPage = lazy(() => import("@/pages/AppointmentsPage"));
const BookAppointmentPage = lazy(() => import("@/pages/BookAppointmentPage"));
const ClinicsPage = lazy(() => import("@/pages/ClinicsPage"));
const AddClinicPage = lazy(() => import("@/pages/Clinic Management/AddClinicPage"));
const EditClinicPage = lazy(() => import("@/pages/EditClinicPage"));
const ClinicProfilePage = lazy(() => import("@/pages/ClinicProfilePage"));
const RolesPage = lazy(() => import("@/pages/RolesPage"));
const RolePermissionsPage = lazy(() => import("@/pages/RolePermissionsPage"));
const RolesAccessPage = lazy(() => import("@/pages/RolesAccessPage"));
const UserAccessPage = lazy(() => import("@/pages/UserAccessPage"));
const UserManagementPage = lazy(() => import("@/pages/UserManagementPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const AddTaskPage = lazy(() => import("@/pages/AddTaskPage"));
const TaskDetailPage = lazy(() => import("@/pages/TaskDetailPage"));
const StaffManagementPage = lazy(() => import("@/pages/StaffManagementPage"));
const AddStaffPage = lazy(() => import("@/pages/AddStaffPage"));
const EditStaffPage = lazy(() => import("@/pages/EditStaffPage"));
const PermissionsPage = lazy(() => import("@/pages/PermissionsPage"));
const FormBuilderPage = lazy(() => import("@/pages/FormBuilderPage"));
const FormFillPage = lazy(() => import("@/pages/FormFillPage"));

export interface RoutePermission {
  path: string;
  name: string;
  component?: any;
  requiredModules?: string[];
  requiredOperations?: string[];
  icon?: string;
  isProtected?: boolean;
  showInSidebar?: boolean;
  children?: RoutePermission[];
}

export const ROUTES: RoutePermission[] = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    icon: "LayoutDashboard",
    isProtected: true,
    showInSidebar: true
  },
  {
    path: "/patients",
    name: "Patients",
    component: PatientsPage,
    requiredModules: ["Patient Management"],
    requiredOperations: ["Read"],
    icon: "Users",
    isProtected: true,
    showInSidebar: true,
    children: []
  },
  {
    path: "/Add",
    name: "Add Patient",
    component: AddPatientPage,
    requiredModules: ["User Management"],
    requiredOperations: ["Read"],
    icon: "UserCheck",
    isProtected: true,
    showInSidebar: true,
    children: []
  },
  // {
  //   path: "/doctors",
  //   name: "Doctors",
  //   component: DoctorsPage,
  //   requiredModules: ["User Management"],
  //   requiredOperations: ["Read"],
  //   icon: "UserCheck",
  //   isProtected: true,
  //   showInSidebar: true,
  //   children: []
  // },
  {
    path: "/appointments",
    name: "Appointments",
    component: AppointmentsPage,
    requiredModules: ["Appointment Management"],
    requiredOperations: ["Read"],
    icon: "Calendar",
    isProtected: true,
    showInSidebar: true,
    children: []
  },
  {
    path: "/clinics",
    name: "Clinics",
    component: ClinicsPage,
    requiredModules: ["Clinic Management"],
    requiredOperations: ["Read"],
    icon: "Building2",
    isProtected: true,
    showInSidebar: true,
    children: []
  },
  {
    path: "/clinics/add",
    name: "Add Clinic",
    component: AddClinicPage,
    requiredModules: ["Clinic Management"],
    requiredOperations: ["Create"],
    icon: "Building2",
    isProtected: true,
    showInSidebar: false,
    children: []
  },
  {
    path: "/clinics/edit/:id",
    name: "Edit Clinic",
    component: EditClinicPage,
    requiredModules: ["Clinic Management"],
    requiredOperations: ["Update"],
    icon: "Building2",
    isProtected: true,
    showInSidebar: false,
    children: []
  },
  {
    path: "/reports",
    name: "Reports",
    component: ReportsPlaceholder,
    requiredModules: ["Reports"],
    requiredOperations: ["Read"],
    icon: "FileText",
    isProtected: true,
    showInSidebar: true
  },
  {
    path: "/medical-records",
    name: "Medical Records",
    component: MedicalRecordsPlaceholder,
    requiredModules: ["Medical Records"],
    requiredOperations: ["Read"],
    icon: "FileHeart",
    isProtected: true,
    showInSidebar: true
  },


  // {
  //   path: "/staff",
  //   name: "Staff Management",
  //   component: StaffManagementPage,
  //   requiredModules: ["User Management"],
  //   requiredOperations: ["Read"],
  //   icon: "Users",
  //   isProtected: true,
  //   showInSidebar: true,
  //   children: []
  // },

  {
    path: "/tasks",
    name: "Tasks Management",
    component: TasksPage,
    requiredModules: ["Task Management"],
    requiredOperations: ["Read"],
    icon: "CheckSquare",
    isProtected: true,
    showInSidebar: true,
    children: [
    ]
  },
  {
    path: "/administeration",
    name: "Administration",
    component: PatientsPage,
    requiredModules: ["Patient Management"],
    requiredOperations: ["Read"],
    icon: "Users",
    isProtected: true,
    showInSidebar: true,
    children: [
      {
        path: "/roles",
        name: "Role Management",
        component: RolesPage,
        requiredModules: ["Role Management"],
        requiredOperations: ["Read"],
        icon: "Shield",
        isProtected: true,
        showInSidebar: true
      },
      {
        path: "/permissions",
        name: "Modules/Operatios",
        component: PermissionsPage,
        requiredModules: ["System Settings"],
        requiredOperations: ["Read"],
        icon: "Shield",
        isProtected: true,
        showInSidebar: true
      },
      {
        path: "/roles-access",
        name: "Roles Access",
        component: RolesAccessPage,
        requiredModules: ["Role Access"],
        requiredOperations: ["Update"],
        isProtected: true,
        showInSidebar: true
      },
      {
        path: "/user-access",
        name: "User Access",
        component: UserAccessPage,
        requiredModules: ["User Management"],
        requiredOperations: ["Read"],
        icon: "UserCheck",
        isProtected: true,
        showInSidebar: true
      },
      {
        path: "/user-management",
        name: "User Management",
        component: UserManagementPage,
        requiredModules: ["User Management"],
        requiredOperations: ["Read"],
        icon: "UserCog",
        isProtected: true,
        showInSidebar: true
      },
    ]
  },
  {
    path: "/settings",
    name: "Settings",
    component: SettingsPlaceholder,
    icon: "Settings",
    isProtected: true,
    requiredModules: ["System Settings"],
    requiredOperations: ["Read"],
    showInSidebar: true

  },
  {
    path: "/forms",
    name: "Form Builder",
    component: FormBuilderPage,
    requiredModules: ["Form Management"],
    requiredOperations: ["Read"],
    icon: "FileText",
    isProtected: true,
    showInSidebar: true

  },
  {
    path: "/forms/:id/fill",
    name: "Fill Form",
    component: FormFillPage,
    isProtected: false,
    showInSidebar: true

  }
];

// Helper function to flatten routes (including children)
export const getFlattenedRoutes = (routes: RoutePermission[]): RoutePermission[] => {
  const flattened: RoutePermission[] = [];

  routes.forEach(route => {
    flattened.push(route);
    if (route.children) {
      flattened.push(...getFlattenedRoutes(route.children));
    }
  });

  return flattened;
};

// Helper function to get parent routes (routes with children for sidebar)
export const getParentRoutes = (routes: RoutePermission[]): RoutePermission[] => {
  return routes.filter(route => route.children && route.children.length > 0);
};

// Helper function to get sidebar routes (routes that should be shown in sidebar)
export const getSidebarRoutes = (routes: RoutePermission[]): RoutePermission[] => {
  return routes.filter(route => route.showInSidebar !== false);
};

/**
 * Helper function to toggle sidebar visibility for a specific route
 * @param routePath - The path of the route to toggle
 * @param show - Whether to show or hide the route in sidebar
 */
export const toggleRouteSidebarVisibility = (routePath: string, show: boolean): void => {
  const route = ROUTES.find(r => r.path === routePath);
  if (route) {
    route.showInSidebar = show;
  }
};

/**
 * Helper function to hide a route from sidebar
 * @param routePath - The path of the route to hide
 */
export const hideRouteFromSidebar = (routePath: string): void => {
  toggleRouteSidebarVisibility(routePath, false);
};

/**
 * Helper function to show a route in sidebar
 * @param routePath - The path of the route to show
 */
export const showRouteInSidebar = (routePath: string): void => {
  toggleRouteSidebarVisibility(routePath, true);
};

/**
 * Helper function to get all routes that are hidden from sidebar
 */
export const getHiddenSidebarRoutes = (routes: RoutePermission[]): RoutePermission[] => {
  return routes.filter(route => route.showInSidebar === false);
};

export const getUserAllowedRoutes = (userType: string, userPermissions?: any[]): RoutePermission[] => {
  // SuperAdmin gets access to everything
  if (userType === 'SuperAdmin') {
    return ROUTES;
  }

  // Other users access based on their assigned permissions
  return ROUTES.filter(route => {
    // Always allow dashboard and settings
    if (route.path === '/dashboard' || route.path === '/settings') {
      return true;
    }

    // Check specific permissions for other routes
    if (!route.requiredModules || !route.requiredOperations) {
      return true;
    }

    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    console.log("userPermissions", userPermissions);
    // Check if user has required permissions
    return route.requiredModules?.some(requiredModule =>
      route.requiredOperations?.some(requiredOperation =>
        userPermissions.some((permission: any) =>
          permission.moduleName === requiredModule &&
          permission.operationName === requiredOperation
        )
      )
    ) ?? false;
  });
};

export const canAccessRoute = (path: string, userType: string, userPermissions?: any[]): boolean => {
  const flattenedRoutes = getFlattenedRoutes(ROUTES);
  const route = flattenedRoutes.find(r => r.path === path);

  if (!route) return false;

  // SuperAdmin can access all routes
  if (userType === 'SuperAdmin') {
    return true;
  }

  // Always allow dashboard and settings
  if (path === '/dashboard' || path === '/settings') {
    return true;
  }

  // Check specific permissions for other routes
  if (!route.requiredModules || !route.requiredOperations) {
    return true;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Check if user has required permissions
  return route.requiredModules?.some(requiredModule =>
    route.requiredOperations?.some(requiredOperation =>
      userPermissions.some((permission: any) =>
        permission.moduleName === requiredModule &&
        permission.operationName === requiredOperation
      )
    )
  ) ?? false;
};