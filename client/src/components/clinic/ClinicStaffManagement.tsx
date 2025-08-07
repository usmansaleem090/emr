import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Badge } from "@/components/UI/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/UI/alert-dialog";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from '@/utils/apiClient';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import DoctorScheduleModalNew from "../doctors/DoctorScheduleModalNew";

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  position: string;
  department: string;
  employmentStatus: string;
  startDate: string;
  endDate?: string;
  salary?: string;
  hourlyRate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  notes?: string;
  status: string;
  userId: number;
  clinicId: number;
  supervisorId?: number;
  createdAt: string;
  updatedAt: string;
  clinicName?: string;
}

interface ClinicStaffManagementProps {
  clinicId: number;
}

export const ClinicStaffManagement: React.FC<ClinicStaffManagementProps> = ({ clinicId }) => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  // Schedule modal handler
  const handleViewSchedule = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setScheduleModalOpen(true);
  };

  // Load staff data
  const loadStaff = async () => {
    try {
      setIsLoading(true);
      console.log(`Loading staff for clinic ID: ${clinicId}`);
      const response = await api.get(`/api/clinic-staff?clinic_id=${clinicId}`);
      console.log('Raw staff API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      
      // Handle different response structures with more robust checking
      let staffData = [];
      
      if (response?.data) {
        // Try direct data access first (most common case)
        if (response.data.data && Array.isArray(response.data.data)) {
          staffData = response.data.data;
        } 
        // Fallback to direct array if that's the structure
        else if (Array.isArray(response.data)) {
          staffData = response.data;
        } 
        // Handle empty or null data
        else {
          console.warn('Response data is not an array:', response.data);
          staffData = [];
        }
      } else {
        console.warn('No response data received');
        staffData = [];
      }
      
      console.log('Final staff data to set:', staffData);
      console.log('Staff data length:', staffData.length);
      
      setStaff(staffData);
      setFilteredStaff(staffData);
    } catch (error: any) {
      console.error('Failed to load staff:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to load staff members.",
        variant: "destructive",
      });
      // Set empty arrays on error to prevent undefined issues
      setStaff([]);
      setFilteredStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete staff member
  const handleDelete = async (staffMember: StaffMember) => {
    try {
      setDeleteLoading(true);
      await api.delete(`/api/clinic-staff/${staffMember.id}`);
      toast({
        title: "Success",
        description: "Staff member deleted successfully.",
      });
      await loadStaff(); // Reload the staff list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter(staffMember =>
        `${staffMember.firstName || ''} ${staffMember.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  useEffect(() => {
    if (clinicId) {
      loadStaff();
    }
  }, [clinicId]);

  // Utility functions
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.inactive}>
        {status}
      </Badge>
    );
  };

  const getPositionBadge = (position: string) => {
    const positionColors = {
      'Staff': 'bg-blue-100 text-blue-800',
      'Cleaner': 'bg-purple-100 text-purple-800',
      'Receptionist': 'bg-green-100 text-green-800',
      'MA': 'bg-orange-100 text-orange-800',
      'Nurse': 'bg-pink-100 text-pink-800',
      'Manager': 'bg-indigo-100 text-indigo-800',
      'Administrator': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={positionColors[position as keyof typeof positionColors] || 'bg-gray-100 text-gray-800'}>
        {position}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Staff Management</h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage clinic staff members and their information
          </p>
        </div>
        <Link href="/staff/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {staff.filter(s => s.status === 'active').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Full-Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {staff.filter(s => s.employmentStatus === 'Full-time').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {staff.filter(s => {
                  if (!s.createdAt) return false;
                  const createdDate = new Date(s.createdAt);
                  const now = new Date();
                  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return createdDate >= thisMonth;
                }).length}
              </p>
            </div>
            <UserPlus className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, employee ID, position, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="text-base font-medium">All Staff Members</h4>
          <p className="text-sm text-gray-600">
            {filteredStaff.length > 0 
              ? `${filteredStaff.length} staff member${filteredStaff.length === 1 ? '' : 's'} found`
              : searchTerm ? 'No staff members match your search' : 'No staff members found'
            }
          </p>
        </div>
        <div className="p-4">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No staff members match your search criteria.' : 'No staff members found.'}
              </p>
              {!searchTerm && (
                <Link href="/staff/add">
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Your First Staff Member
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((staffMember) => (
                <div
                  key={staffMember.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {staffMember.firstName && staffMember.lastName
                          ? `${staffMember.firstName} ${staffMember.lastName}`
                          : staffMember.email?.split("@")[0]}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getPositionBadge(staffMember.position)} • {staffMember.department}
                      </div>
                      <div className="text-sm text-gray-500">
                        {staffMember.email} • {staffMember.phone || "No phone"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        staffMember.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {staffMember.status}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSchedule(staffMember)}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/staff/${staffMember.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {staffMember.firstName || ''} {staffMember.lastName || ''}? 
                            This action cannot be undone and will remove all staff records and their user account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(staffMember)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    {/* Staff Schedule Modal */}
    {selectedStaff && (
      <DoctorScheduleModalNew
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedStaff(null);
        }}
        type={'staff'}
        clinicId={clinicId}
        doctorId={selectedStaff.userId || 0}
        doctorName={selectedStaff.firstName && selectedStaff.lastName ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : selectedStaff.email?.split("@")[0]}
      />
    )}
  </div>
  );
};