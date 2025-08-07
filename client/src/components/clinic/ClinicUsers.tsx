import { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/UI/table";
import { Badge } from "@/components/UI/badge";
import { Input } from "@/components/UI/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  Briefcase,
  Loader2,
  Filter,
} from "lucide-react";

interface ClinicUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  userType: 'physician' | 'non-physician';
  status: 'active' | 'inactive' | 'pending';
  specialization?: string;
  department?: string;
  position?: string;
  joinedAt: string;
  lastLogin?: string;
}

interface ClinicUsersProps {
  clinicId: number;
}

export function ClinicUsers({ clinicId }: ClinicUsersProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<ClinicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeUserTab, setActiveUserTab] = useState('physician');

  useEffect(() => {
    loadUsers();
  }, [clinicId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await api.get(`/api/clinics/${clinicId}/users`);

      // Mock data for now
      const mockUsers: ClinicUser[] = [
        {
          id: 1,
          username: "dr.smith",
          email: "dr.smith@clinic.com",
          firstName: "John",
          lastName: "Smith",
          phone: "(555) 123-4567",
          role: "Physician",
          userType: "physician",
          status: "active",
          specialization: "Cardiology",
          department: "Cardiology",
          joinedAt: "2023-01-15",
          lastLogin: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          username: "dr.johnson",
          email: "dr.johnson@clinic.com",
          firstName: "Sarah",
          lastName: "Johnson",
          phone: "(555) 234-5678",
          role: "Physician",
          userType: "physician",
          status: "active",
          specialization: "Pediatrics",
          department: "Pediatrics",
          joinedAt: "2023-02-20",
          lastLogin: "2024-01-14T15:45:00Z"
        },
        {
          id: 3,
          username: "nurse.wilson",
          email: "nurse.wilson@clinic.com",
          firstName: "Michael",
          lastName: "Wilson",
          phone: "(555) 345-6789",
          role: "Nurse",
          userType: "non-physician",
          status: "active",
          department: "Emergency",
          position: "Registered Nurse",
          joinedAt: "2023-03-10",
          lastLogin: "2024-01-15T08:15:00Z"
        },
        {
          id: 4,
          username: "admin.davis",
          email: "admin.davis@clinic.com",
          firstName: "Emily",
          lastName: "Davis",
          phone: "(555) 456-7890",
          role: "Administrator",
          userType: "non-physician",
          status: "active",
          department: "Administration",
          position: "Office Manager",
          joinedAt: "2023-01-05",
          lastLogin: "2024-01-15T09:00:00Z"
        },
        {
          id: 5,
          username: "dr.brown",
          email: "dr.brown@clinic.com",
          firstName: "Robert",
          lastName: "Brown",
          phone: "(555) 567-8901",
          role: "Physician",
          userType: "physician",
          status: "pending",
          specialization: "Orthopedics",
          department: "Orthopedics",
          joinedAt: "2024-01-10",
          lastLogin: null
        }
      ];

      setUsers(mockUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: ClinicUser) => {
    if (!confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from this clinic?`)) {
      return;
    }

    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // await api.delete(`/api/clinics/${clinicId}/users/${user.id}`);

      // Mock deletion
      setUsers(prev => prev.filter(u => u.id !== user.id));

      toast({
        title: "Success",
        description: "User removed from clinic successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (userType: string) => {
    return userType === 'physician' ? (
      <Stethoscope className="w-4 h-4" />
    ) : (
      <Briefcase className="w-4 h-4" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter users based on search term, status, and user type
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesUserType = user.userType === activeUserTab;

    return matchesSearch && matchesStatus && matchesUserType;
  });

  const physicianUsers = users.filter(user => user.userType === 'physician');
  const nonPhysicianUsers = users.filter(user => user.userType === 'non-physician');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading users...</span>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinic Users</h2>
          <p className="text-muted-foreground">
            Manage physicians and staff members associated with this clinic
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Physicians</p>
                <p className="text-2xl font-bold">{physicianUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">{nonPhysicianUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage clinic users by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeUserTab} onValueChange={setActiveUserTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="physician" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Physicians ({physicianUsers.length})
              </TabsTrigger>
              <TabsTrigger value="non-physician" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Staff ({nonPhysicianUsers.length})
              </TabsTrigger>
            </TabsList>

            {/* Physician Users Tab */}
            <TabsContent value="physician" className="mt-6">
              {filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                {getRoleIcon(user.userType)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {user.specialization || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.department || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(user.joinedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(user.lastLogin)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No physicians found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No physicians match your current filters.'
                      : 'No physicians have been added to this clinic yet.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Physician
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Non-Physician Users Tab */}
            <TabsContent value="non-physician" className="mt-6">
              {filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                {getRoleIcon(user.userType)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {user.position || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.department || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(user.joinedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(user.lastLogin)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No staff members match your current filters.'
                      : 'No staff members have been added to this clinic yet.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Staff Member
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 