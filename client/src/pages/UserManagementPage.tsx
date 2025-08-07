import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Badge } from '@/components/UI/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/UI/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Search, Plus, Trash2, User, Building2, Stethoscope, Users, Shield, UserCheck, UserX, UserPlus } from 'lucide-react';
import { api } from '@/utils/apiClient';
import { Textarea } from '@/components/UI/textarea';
import { useClinic } from '@/hooks/useClinic';
import { SearchableDropdown } from '@/components/UI/SearchableDropdown';

interface User {
  id: number;
  username: string;
  email: string;
  userType: 'SuperAdmin' | 'HawkLogix' | 'Clinic';
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: string;
  clinicId?: number;
  roleId?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    status: string;
  };
}

interface ClinicLocation {
  id: number;
  name: string;
  address: string;
  clinicId: number;
  createdAt: string;
}

interface ClinicStaff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  employmentStatus?: string;
  status: string;
  clinicId: number;
  locationId?: number;
  clinicName?: string;
  locationName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty: string;
  licenseNumber: string;
  status: string;
  clinicId: number;
  locationId?: number;
  clinicName?: string;
  locationName?: string;
  createdAt: string;
  updatedAt: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicLocations, setClinicLocations] = useState<ClinicLocation[]>([]);
  const [clinicStaff, setClinicStaff] = useState<ClinicStaff[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateSuperAdminDialogOpen, setIsCreateSuperAdminDialogOpen] = useState(false);
  const [isCreateDoctorDialogOpen, setIsCreateDoctorDialogOpen] = useState(false);
  const [isCreateStaffDialogOpen, setIsCreateStaffDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('SuperAdmin');
  const [selectedLocation, setSelectedLocation] = useState<ClinicLocation | null>(null);
  const [clinicSubTab, setClinicSubTab] = useState('ClinicalStaff');
  const [saving, setSaving] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [isClinicDropdownOpen, setIsClinicDropdownOpen] = useState(false);
  const clinicDropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get selected clinic from Redux
  const { selectedClinic } = useClinic();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'HawkLogix' as const,
    firstName: '',
    lastName: '',
    phone: '',
    roleId: 0, // Changed from string to number
    clinicIds: [] as number[], // Add clinicIds field for multi-select
  });

  const [superAdminFormData, setSuperAdminFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'SuperAdmin' as const,
  });

  const [doctorFormData, setDoctorFormData] = useState({
    user: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
    doctor: {
      specialty: '',
      licenseNumber: '',
      locationId: '',
    },
    roleId: 0,
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [staffFormData, setStaffFormData] = useState({
    user: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
    staff: {
      employeeId: '',
      roleId: '',
      department: 'Administration',
      employmentStatus: 'Full-time',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      salary: '',
      hourlyRate: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      notes: '',
      locationId: '',
    },
  });

  const userTypeConfig = {
    SuperAdmin: { label: 'Super Admin', icon: Shield, color: 'bg-red-100 text-red-800' },
    HawkLogix: { label: 'HawkLogix', icon: Building2, color: 'bg-blue-100 text-blue-800' },
    Clinic: { label: 'Clinic', icon: Building2, color: 'bg-green-100 text-green-800' },
  };

  const departments = [
    "Administration",
    "Reception",
    "Nursing",
    "Medical",
    "Housekeeping",
    "Management",
    "Other",
  ];

  const employmentStatuses = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Intern",
  ];

  const genders = ["Male", "Female", "Other", "Prefer not to say"];

  const relationshipTypes = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Friend",
    "Other",
  ];

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Family Medicine',
    'Internal Medicine',
    'Neurology',
    'Obstetrics and Gynecology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Other'
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUsers(),
          fetchClinics(),
          fetchRoles(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load clinic locations when selected clinic changes
  useEffect(() => {
    if (selectedClinic) {
      fetchClinicLocations(selectedClinic.id);
    } else {
      setClinicLocations([]);
      setSelectedLocation(null);
    }
  }, [selectedClinic]);

  // Load staff and doctors when selected location changes
  useEffect(() => {
    if (selectedLocation && selectedClinic) {
      fetchClinicStaff(selectedClinic.id, selectedLocation.id);
      fetchDoctors(selectedClinic.id, selectedLocation.id);
    } else {
      setClinicStaff([]);
      setDoctors([]);
    }
  }, [selectedLocation, selectedClinic]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  const fetchClinics = async () => {
    try {
      setClinicsLoading(true);
      const response = await api.get('/api/clinics');
      setClinics(response.data || []);
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch clinics',
        variant: 'destructive',
      });
    } finally {
      setClinicsLoading(false);
    }
  };

  const fetchClinicLocations = async (clinicId: number) => {
    try {
      setLocationsLoading(true);
      const response = await api.get(`/api/clinics/${clinicId}/locations`);
      setClinicLocations(response.data || []);
    } catch (error: any) {
      console.error('Error fetching clinic locations:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch clinic locations',
        variant: 'destructive',
      });
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchClinicStaff = async (clinicId: number, locationId: number) => {
    try {
      setStaffLoading(true);
      const response = await api.get(`/api/clinic-staff?clinic_id=${clinicId}&location_id=${locationId}`);
      
      console.log('Raw clinic staff API response:', response.data);
      
      // Transform the nested API response to flat structure
      const flattenedStaff = (response.data || []).map((item: any) => ({
        id: item.staff.id,
        firstName: item.user?.firstName || '',
        lastName: item.user?.lastName || '',
        email: item.user?.email || '',
        phone: item.user?.phone || '',
        employeeId: item.staff.employeeId || '',
        position: item.staff.position || '',
        department: item.staff.department || '',
        employmentStatus: item.staff.employmentStatus || '',
        status: item.staff.status || 'active',
        clinicId: item.staff.clinicId,
        locationId: item.staff.locationId,
        clinicName: item.clinic?.name || '',
        locationName: item.location?.name || '',
        createdAt: item.staff.createdAt,
        updatedAt: item.staff.updatedAt,
      }));
      
      console.log('Flattened staff data:', flattenedStaff);
      setClinicStaff(flattenedStaff);
    } catch (error: any) {
      console.error('Error fetching clinic staff:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch clinic staff',
        variant: 'destructive',
      });
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchDoctors = async (clinicId: number, locationId: number) => {
    try {
      setDoctorsLoading(true);
      const response = await api.get(`/api/doctors?clinic_id=${clinicId}&location_id=${locationId}`);
      
      console.log('Raw doctors API response:', response.data);
      
      // Transform the nested API response to flat structure
      const flattenedDoctors = (response.data || []).map((item: any) => ({
        id: item.doctor.id,
        firstName: item.user?.firstName || '',
        lastName: item.user?.lastName || '',
        email: item.user?.email || '',
        phone: item.user?.phone || '',
        specialty: item.doctor.specialty || '',
        licenseNumber: item.doctor.licenseNumber || '',
        status: item.doctor.status || 'active',
        clinicId: item.doctor.clinicId,
        locationId: item.doctor.locationId,
        clinicName: item.clinic?.name || '',
        locationName: item.location?.name || '',
        createdAt: item.doctor.createdAt,
        updatedAt: item.doctor.updatedAt,
      }));
      
      console.log('Flattened doctors data:', flattenedDoctors);
      setDoctors(flattenedDoctors);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch doctors',
        variant: 'destructive',
      });
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/roles');
      setRoles(response.data || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch roles',
        variant: 'destructive',
      });
    }
  };

  const handleCreateDoctor = async () => {
    if (!selectedClinic || !selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select a clinic and location',
        variant: 'destructive',
      });
      return;
    }

    if (!doctorFormData.doctor.locationId) {
      toast({
        title: 'Error',
        description: 'Please select a location for the doctor',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingDoctor(true);
      console.log('Current doctorFormData before creating payload:', JSON.stringify(doctorFormData, null, 2));
      
      const payload = {
        ...doctorFormData,
        doctor: {
          ...doctorFormData.doctor,
          clinicId: selectedClinic.id,
          locationId: parseInt(doctorFormData.doctor.locationId, 10),
        }
      };

      console.log('Creating doctor with payload:', JSON.stringify(payload, null, 2));
      console.log('Selected clinic:', selectedClinic.id);
      console.log('Selected location:', selectedLocation.id);

      await api.post('/api/doctors', payload);

      toast({
        title: 'Success',
        description: 'Doctor created successfully',
      });

      setIsCreateDoctorDialogOpen(false);
      setDoctorFormData({
        user: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
        },
        doctor: {
          specialty: '',
          licenseNumber: '',
          locationId: '',
        },
        roleId: 0,
        status: 'active',
      });
      
      // Refresh doctors list
      await fetchDoctors(selectedClinic.id, selectedLocation.id);
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create doctor',
        variant: 'destructive',
      });
    } finally {
      setCreatingDoctor(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!selectedClinic || !selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select a clinic and location',
        variant: 'destructive',
      });
      return;
    }

    if (!staffFormData.staff.locationId) {
      toast({
        title: 'Error',
        description: 'Please select a location for the staff member',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingStaff(true);
      console.log('Current staffFormData before creating payload:', JSON.stringify(staffFormData, null, 2));
      
      // Ensure end date has a value - if empty, set to "01/01/0001" as placeholder
      const endDateValue = staffFormData.staff.endDate || '0001-01-01';
      
      const payload = {
        ...staffFormData,
        staff: {
          ...staffFormData.staff,
          clinicId: selectedClinic.id,
          locationId: parseInt(staffFormData.staff.locationId, 10),
          roleId: parseInt(staffFormData.staff.roleId, 10),
          endDate: endDateValue
        }
      };

      console.log('Creating staff with payload:', JSON.stringify(payload, null, 2));
      console.log('Selected clinic:', selectedClinic.id);
      console.log('Selected location:', selectedLocation.id);

      await api.post('/api/clinic-staff', payload);

      toast({
        title: 'Success',
        description: 'Staff member created successfully',
      });

      setIsCreateStaffDialogOpen(false);
      setStaffFormData({
        user: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
        },
        staff: {
          employeeId: '',
          roleId: '',
          department: 'Administration',
          employmentStatus: 'Full-time',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          salary: '',
          hourlyRate: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          notes: '',
          locationId: '',
        },
      });
      
      // Refresh staff list
      await fetchClinicStaff(selectedClinic.id, selectedLocation.id);
    } catch (error: any) {
      console.error('Error creating staff member:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create staff member',
        variant: 'destructive',
      });
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.username || !formData.email || !formData.password || !formData.roleId) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields including role',
          variant: 'destructive',
        });
        return;
      }

      // Prepare the data to send to backend
      const userData = {
        username: formData.username,
        email: formData.email,
        passwordHash: formData.password, // Change from 'password' to 'passwordHash'
        userType: formData.userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        roleId: formData.roleId, // roleId is already a number
        clinicIds: formData.clinicIds.length > 0 ? formData.clinicIds : undefined
      };

      await api.post('/api/users', userData);

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      setIsCreateDialogOpen(false);
      setIsClinicDropdownOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        userType: 'HawkLogix',
        firstName: '',
        lastName: '',
        phone: '',
        roleId: 0,
        clinicIds: [],
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSuperAdmin = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!superAdminFormData.username || !superAdminFormData.email || !superAdminFormData.password) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      // Prepare the data to send to backend
      const userData = {
        username: superAdminFormData.username,
        email: superAdminFormData.email,
        passwordHash: superAdminFormData.password, // Change from 'password' to 'passwordHash'
        userType: superAdminFormData.userType,
        firstName: superAdminFormData.firstName,
        lastName: superAdminFormData.lastName,
        phone: superAdminFormData.phone,
      };

      await api.post('/api/users', userData);

      toast({
        title: 'Success',
        description: 'Super Admin created successfully',
      });

      setIsCreateSuperAdminDialogOpen(false);
      setSuperAdminFormData({
        username: '',
        email: '',
        password: '',
        userType: 'SuperAdmin',
        firstName: '',
        lastName: '',
        phone: '',
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating Super Admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create Super Admin',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await api.delete(`/api/users/${userId}`);

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    try {
      await api.delete(`/api/doctors/${doctorId}`);

      toast({
        title: 'Success',
        description: 'Doctor deleted successfully',
      });

      // Refresh doctors list if we have selected clinic and location
      if (selectedClinic && selectedLocation) {
        await fetchDoctors(selectedClinic.id, selectedLocation.id);
      }
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete doctor',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = user.userType === activeTab;

    return matchesSearch && matchesTab;
  });

  const filteredClinicStaff = clinicStaff.filter(staff => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
    const email = staff.email.toLowerCase();
    const position = staff.position?.toLowerCase() || '';
    const department = staff.department?.toLowerCase() || '';
    
    const matches = fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           position.includes(searchTerm.toLowerCase()) ||
           department.includes(searchTerm.toLowerCase());
    
    console.log('Staff filtering:', { 
      staff: `${staff.firstName} ${staff.lastName}`, 
      searchTerm, 
      matches 
    });
    
    return matches;
  });

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const email = doctor.email.toLowerCase();
    const specialty = doctor?.specialty?.toLowerCase() || '';
    
    const matches = fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           specialty.includes(searchTerm.toLowerCase());
    
    console.log('Doctor filtering:', { 
      doctor: `${doctor.firstName} ${doctor.lastName}`, 
      searchTerm, 
      matches 
    });
    
    return matches;
  });

  // Debug logging
  console.log('Current state:', {
    selectedClinic,
    selectedLocation,
    clinicSubTab,
    clinicStaff: clinicStaff.length,
    doctors: doctors.length,
    staffLoading,
    doctorsLoading,
    filteredClinicStaff: filteredClinicStaff.length,
    filteredDoctors: filteredDoctors.length,
    searchTerm
  });

  const getUsersByType = (userType: string) => {
    return users.filter(user => user.userType === userType);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleClinicChange = (clinicId: string) => {
    console.log('Clinic selected:', clinicId);
    const clinicIdNum = clinicId ? parseInt(clinicId) : null;
    console.log('Clinic ID number:', clinicIdNum);
    // setSelectedClinic(clinicIdNum); // This is now handled by Redux
    if (clinicIdNum) {
      setClinicSubTab('ClinicalStaff');
    }
  };

  // Filter roles based on practice/non-practice
  const nonPracticeRoles = roles.filter(role => !role.isPracticeRole);
  const practiceRoles = roles.filter(role => role.isPracticeRole);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage users, roles, and permissions across the system
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="SuperAdmin">Super Admin</TabsTrigger>
          <TabsTrigger value="HawkLogix">HawkLogix</TabsTrigger>
          <TabsTrigger value="Clinic">Clinic</TabsTrigger>
        </TabsList>

        {/* Super Admin Tab */}
        <TabsContent value="SuperAdmin" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Super Admin Users</CardTitle>
                  <CardDescription>
                    Manage super admin users across the system
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateSuperAdminDialogOpen(true)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Add Super Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search super admin users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HawkLogix Tab */}
        <TabsContent value="HawkLogix" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>HawkLogix Users</CardTitle>
                  <CardDescription>
                    Manage HawkLogix users across the system
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Add HawkLogix User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search HawkLogix users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Tab */}
        <TabsContent value="Clinic" className="mt-6">
          <div className="mb-6">
            <Label htmlFor="clinic-select" className="text-sm font-medium">
              Selected Clinic: {selectedClinic?.name || 'No clinic selected'}
            </Label>
            {selectedClinic && (
              <div className="mt-4">
                <Label htmlFor="location-select" className="text-sm font-medium">
                  Select Location
                </Label>
                <div className="mt-2">
                  <SearchableDropdown
                    options={clinicLocations}
                    value={selectedLocation}
                    onSelect={(option) => setSelectedLocation(option as ClinicLocation | null)}
                    placeholder="Select a location"
                    loading={locationsLoading}
                    className="w-full max-w-md"
                    icon={Building2}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedLocation && (
            <div className="mb-6">
              <Tabs value={clinicSubTab} onValueChange={setClinicSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ClinicalStaff">Clinical Staff</TabsTrigger>
                  <TabsTrigger value="Doctors">Doctors</TabsTrigger>
                </TabsList>

                {/* Clinical Staff Sub-tab */}
                <TabsContent value="ClinicalStaff" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Clinical Staff</CardTitle>
                          <CardDescription>
                            Manage clinical staff members for {selectedClinic?.name} - {selectedLocation.name}
                          </CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateStaffDialogOpen(true)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Staff
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {staffLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Position</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredClinicStaff.map((staff) => (
                              <TableRow key={staff.id}>
                                <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                                <TableCell>{staff.email}</TableCell>
                                <TableCell>{staff.position}</TableCell>
                                <TableCell>{staff.department}</TableCell>
                                <TableCell>{getStatusBadge(staff.status)}</TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Doctors Sub-tab */}
                <TabsContent value="Doctors" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Doctors</CardTitle>
                          <CardDescription>
                            Manage doctors for {selectedClinic?.name} - {selectedLocation.name}
                          </CardDescription>
                        </div>
                        <Button onClick={() => setIsCreateDoctorDialogOpen(true)}>
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Add Doctor
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {doctorsLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Specialty</TableHead>
                              <TableHead>License</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDoctors.map((doctor) => (
                              <TableRow key={doctor.id}>
                                <TableCell>{`${doctor.firstName} ${doctor.lastName}`}</TableCell>
                                <TableCell>{doctor.email}</TableCell>
                                <TableCell>{doctor.specialty}</TableCell>
                                <TableCell>{doctor.licenseNumber}</TableCell>
                                <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      Edit
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this doctor? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteDoctor(doctor.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rest of the dialogs and forms remain the same */}

      {/* SuperAdmin Dialog */}
      <Dialog open={isCreateSuperAdminDialogOpen} onOpenChange={setIsCreateSuperAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Super Admin</DialogTitle>
            <DialogDescription>
              Add a new Super Admin to the system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="superadmin-username">Username *</Label>
                <Input
                  id="superadmin-username"
                  value={superAdminFormData.username}
                  onChange={(e) => setSuperAdminFormData({ ...superAdminFormData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="superadmin-email">Email *</Label>
                <Input
                  id="superadmin-email"
                  type="email"
                  value={superAdminFormData.email}
                  onChange={(e) => setSuperAdminFormData({ ...superAdminFormData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="superadmin-firstName">First Name</Label>
                <Input
                  id="superadmin-firstName"
                  value={superAdminFormData.firstName}
                  onChange={(e) => setSuperAdminFormData({ ...superAdminFormData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="superadmin-lastName">Last Name</Label>
                <Input
                  id="superadmin-lastName"
                  value={superAdminFormData.lastName}
                  onChange={(e) => setSuperAdminFormData({ ...superAdminFormData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="superadmin-password">Password *</Label>
                <Input
                  id="superadmin-password"
                  type="password"
                  value={superAdminFormData.password}
                  onChange={(e) => setSuperAdminFormData({ ...superAdminFormData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="superadmin-phone">Phone</Label>
                <Input
                  id="superadmin-phone"
                  value={superAdminFormData.phone}
                  onChange={(e) => setSuperAdminFormData({ ...superAdminFormData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSuperAdminDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSuperAdmin} disabled={saving}>
              {saving ? 'Creating...' : 'Create Super Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HawkLogix User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          setIsClinicDropdownOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleId">Roles *</Label>
              <Select
                value={formData.roleId !== undefined && formData.roleId !== null ? formData.roleId.toString() : ''}
                onValueChange={(value: string) => setFormData({ ...formData, roleId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role">
                    {formData.roleId !== undefined && formData.roleId !== null
                      ? (nonPracticeRoles.find(role => role.id === Number(formData.roleId))?.name || '')
                      : 'Select role'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {nonPracticeRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinicIds">Clinics</Label>
              <div className="relative" ref={clinicDropdownRef}>
                <div
                  className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setIsClinicDropdownOpen(!isClinicDropdownOpen)}
                >
                  <span className={formData.clinicIds.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                    {formData.clinicIds.length > 0 
                      ? `${formData.clinicIds.length} clinic(s) selected`
                      : "Select clinics..."
                    }
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isClinicDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isClinicDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {clinics.length > 0 && (
                      <div className="flex gap-2 p-2 border-b">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            clinicIds: clinics.map(clinic => clinic.id)
                          })}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            clinicIds: []
                          })}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                    
                    {clinics.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No clinics available</div>
                    ) : (
                      <div className="p-1">
                        {clinics.map((clinic) => (
                          <div key={clinic.id} className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-2 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              id={`clinic-${clinic.id}`}
                              checked={formData.clinicIds.includes(clinic.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    clinicIds: [...formData.clinicIds, clinic.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    clinicIds: formData.clinicIds.filter(id => id !== clinic.id)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor={`clinic-${clinic.id}`} className="text-sm cursor-pointer flex-1">
                              {clinic.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected clinics display below dropdown */}
              {formData.clinicIds.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium text-foreground">Selected Clinics:</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.clinicIds.map((clinicId) => {
                      const clinic = clinics.find(c => c.id === clinicId);
                      return clinic ? (
                        <Badge
                          key={clinicId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {clinic.name}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              clinicIds: formData.clinicIds.filter(id => id !== clinicId)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsClinicDropdownOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Staff Dialog */}
      <Dialog open={isCreateStaffDialogOpen} onOpenChange={setIsCreateStaffDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff member for this clinic. Fill in all required information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* User Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-firstName">First Name *</Label>
                  <Input
                    id="staff-firstName"
                    value={staffFormData.user.firstName}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      user: { ...prev.user, firstName: e.target.value }
                    }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-lastName">Last Name *</Label>
                  <Input
                    id="staff-lastName"
                    value={staffFormData.user.lastName}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      user: { ...prev.user, lastName: e.target.value }
                    }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email Address *</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={staffFormData.user.email}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      user: { ...prev.user, email: e.target.value }
                    }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Phone Number</Label>
                  <Input
                    id="staff-phone"
                    value={staffFormData.user.phone}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      user: { ...prev.user, phone: e.target.value }
                    }))}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password *</Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={staffFormData.user.password}
                  onChange={(e) => setStaffFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, password: e.target.value }
                  }))}
                  placeholder="Enter password (minimum 6 characters)"
                  minLength={6}
                />
              </div>
            </div>

            {/* Staff Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Staff Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-employeeId">Employee ID</Label>
                  <Input
                    id="staff-employeeId"
                    value={staffFormData.staff.employeeId}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, employeeId: e.target.value }
                    }))}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-roleId">Position *</Label>
                  <Select
                    value={staffFormData.staff.roleId ? staffFormData.staff.roleId.toString() : ''}
                    onValueChange={(value) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, roleId: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder="Select position"
                        // Show the selected role name in the input
                        // If a role is selected, display its name, else show placeholder
                        >
                          {roles.find(role => role.id.toString() === (staffFormData.staff.roleId ? staffFormData.staff.roleId.toString() : ''))?.name || ''}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-department">Department *</Label>
                  <Select
                    value={staffFormData.staff.department || ''}
                    onValueChange={(value) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, department: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {staffFormData.staff.department
                          ? staffFormData.staff.department
                          : "Select department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-locationId">Location *</Label>
                  <Select
                    value={staffFormData.staff.locationId || ''}
                    onValueChange={(value) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, locationId: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location">
                        {clinicLocations.find(location => location.id.toString() === staffFormData.staff.locationId)?.name || ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {clinicLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-employmentStatus">Employment Status *</Label>
                  <Select
                    value={staffFormData.staff.employmentStatus || ''}
                    onValueChange={(value) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, employmentStatus: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status">
                        {staffFormData.staff.employmentStatus
                          ? staffFormData.staff.employmentStatus
                          : "Select employment status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-startDate">Start Date</Label>
                  <Input
                    id="staff-startDate"
                    type="date"
                    value={staffFormData.staff.startDate}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, startDate: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-endDate">End Date</Label>
                  <Input
                    id="staff-endDate"
                    type="date"
                    value={staffFormData.staff.endDate || ''}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, endDate: e.target.value }
                    }))}
                    placeholder="01/01/0001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-salary">Salary</Label>
                  <Input
                    id="staff-salary"
                    value={staffFormData.staff.salary}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, salary: e.target.value }
                    }))}
                    placeholder="Enter salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-hourlyRate">Hourly Rate</Label>
                  <Input
                    id="staff-hourlyRate"
                    value={staffFormData.staff.hourlyRate}
                    onChange={(e) => setStaffFormData(prev => ({
                      ...prev,
                      staff: { ...prev.staff, hourlyRate: e.target.value }
                    }))}
                    placeholder="Enter hourly rate"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-emergencyContactName">Contact Name</Label>
                    <Input
                      id="staff-emergencyContactName"
                      value={staffFormData.staff.emergencyContactName}
                      onChange={(e) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, emergencyContactName: e.target.value }
                      }))}
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="staff-emergencyContactPhone"
                      value={staffFormData.staff.emergencyContactPhone}
                      onChange={(e) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, emergencyContactPhone: e.target.value }
                      }))}
                      placeholder="Enter contact phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-emergencyContactRelation">Relationship</Label>
                    <Select
                      value={staffFormData.staff.emergencyContactRelation || undefined}
                      onValueChange={(value) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, emergencyContactRelation: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder="Select relationship"
                          // Show selected value explicitly
                          // If value is set, show it, else show placeholder
                          >
                            {staffFormData.staff.emergencyContactRelation
                              ? staffFormData.staff.emergencyContactRelation
                              : "Select relationship"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipTypes.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-address">Address</Label>
                    <Textarea
                      id="staff-address"
                      value={staffFormData.staff.address}
                      onChange={(e) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, address: e.target.value }
                      }))}
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-notes">Notes</Label>
                    <Textarea
                      id="staff-notes"
                      value={staffFormData.staff.notes}
                      onChange={(e) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, notes: e.target.value }
                      }))}
                      placeholder="Enter notes"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-dateOfBirth">Date of Birth</Label>
                    <Input
                      id="staff-dateOfBirth"
                      type="date"
                      value={staffFormData.staff.dateOfBirth || ''}
                      onChange={(e) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, dateOfBirth: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-gender">Gender</Label>
                    <Select
                      value={staffFormData.staff.gender || ''}
                      onValueChange={(value) => setStaffFormData(prev => ({
                        ...prev,
                        staff: { ...prev.staff, gender: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender">
                          {staffFormData.staff.gender
                            ? staffFormData.staff.gender
                            : "Select gender"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateStaffDialogOpen(false)}
              disabled={creatingStaff}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStaff} disabled={creatingStaff}>
              {creatingStaff ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Staff Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Doctor Dialog */}
      <Dialog open={isCreateDoctorDialogOpen} onOpenChange={setIsCreateDoctorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Create a new doctor for this clinic. Fill in all required information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-firstName">First Name *</Label>
                <Input
                  id="doctor-firstName"
                  value={doctorFormData.user.firstName}
                  onChange={(e) => setDoctorFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, firstName: e.target.value }
                  }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-lastName">Last Name *</Label>
                <Input
                  id="doctor-lastName"
                  value={doctorFormData.user.lastName}
                  onChange={(e) => setDoctorFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, lastName: e.target.value }
                  }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-email">Email Address *</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  value={doctorFormData.user.email}
                  onChange={(e) => setDoctorFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, email: e.target.value }
                  }))}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-phone">Phone Number</Label>
                <Input
                  id="doctor-phone"
                  value={doctorFormData.user.phone}
                  onChange={(e) => setDoctorFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, phone: e.target.value }
                  }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-password">Password *</Label>
              <Input
                id="doctor-password"
                type="password"
                value={doctorFormData.user.password}
                onChange={(e) => setDoctorFormData(prev => ({
                  ...prev,
                  user: { ...prev.user, password: e.target.value }
                }))}
                placeholder="Enter password (minimum 6 characters)"
                minLength={6}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-specialty">Medical Specialty *</Label>
                <Select
                  value={doctorFormData.doctor.specialty || ''}
                  onValueChange={(value) => setDoctorFormData(prev => ({
                    ...prev,
                    doctor: { ...prev.doctor, specialty: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty">
                      {doctorFormData.doctor.specialty
                        ? doctorFormData.doctor.specialty
                        : "Select specialty"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-licenseNumber">Medical License Number *</Label>
                <Input
                  id="doctor-licenseNumber"
                  value={doctorFormData.doctor.licenseNumber}
                  onChange={(e) => setDoctorFormData(prev => ({
                    ...prev,
                    doctor: { ...prev.doctor, licenseNumber: e.target.value }
                  }))}
                  placeholder="Enter license number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-roleId">Position *</Label>
                <Select
                  value={doctorFormData.roleId ? doctorFormData.roleId.toString() : ''}
                  onValueChange={(value) => setDoctorFormData(prev => ({
                    ...prev,
                    roleId: parseInt(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position">
                      {practiceRoles.find(role => role.id.toString() === (doctorFormData.roleId ? doctorFormData.roleId.toString() : ''))?.name || ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {practiceRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-locationId">Location *</Label>
                <Select
                  value={doctorFormData.doctor.locationId || ''}
                  onValueChange={(value) => setDoctorFormData(prev => ({
                    ...prev,
                    doctor: { ...prev.doctor, locationId: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location">
                      {clinicLocations.find(location => location.id.toString() === doctorFormData.doctor.locationId)?.name || ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clinicLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-status">Status</Label>
              <Select
                value={doctorFormData.status || ''}
                onValueChange={(value: 'active' | 'inactive' | 'suspended') => setDoctorFormData(prev => ({
                  ...prev,
                  status: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status">
                    {doctorFormData.status
                      ? doctorFormData.status.charAt(0).toUpperCase() + doctorFormData.status.slice(1)
                      : "Select status"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDoctorDialogOpen(false)}
              disabled={creatingDoctor}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDoctor} disabled={creatingDoctor}>
              {creatingDoctor ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Doctor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteUser(selectedClinic?.id || 0)} // Assuming user.id is the clinic ID for deletion
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagementPage; 