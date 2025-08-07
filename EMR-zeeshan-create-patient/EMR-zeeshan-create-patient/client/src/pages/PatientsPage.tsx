import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Badge } from '@/components/UI/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/UI/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { api } from '@/utils/apiClient';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { useAppSelector } from '@/redux/hooks';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  emrNumber: string;
  userId: number;
  clinicId: number;
  status: 'active' | 'inactive' | 'archived';
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PatientsPage: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load patients data
  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/patients${user?.clinicId ? `?clinicId=${user.clinicId}` : ''}`);
      console.log('Raw patients API response:', response.data);
      
      // Handle different response structures - could be response.data.data or response.data
      const patientsData = response.data.data || response.data || [];
      console.log('Patients data to set:', patientsData);
      
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error: any) {
      console.error('Failed to load patients:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load patients.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete patient
  const handleDelete = async (patientData: Patient) => {
    try {
      setDeleteLoading(true);
      await api.delete(`/api/patients/${patientData.id}`);
      toast({
        title: "Success",
        description: "Patient deleted successfully.",
      });
      await loadPatients(); // Reload the patients list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter patients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patientData =>
        `${patientData.firstName || ''} ${patientData.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientData.emrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  useEffect(() => {
    loadPatients();
  }, [user?.clinicId]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      archived: "bg-red-100 text-red-800"
    };
    
    // Handle undefined or null status
    const safeStatus = status || 'inactive';
    
    return (
      <Badge className={statusColors[safeStatus as keyof typeof statusColors] || statusColors.inactive}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
          <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage patient records and information
          </p>
        </div>
        <Link href="/patients/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {patients.filter(p => p.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {patients.filter(p => {
                if (!p.createdAt) return false;
                const createdDate = new Date(p.createdAt);
                const now = new Date();
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return createdDate >= thisMonth;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, EMR number, or medical record number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            {filteredPatients.length > 0 
              ? `${filteredPatients.length} patient${filteredPatients.length === 1 ? '' : 's'} found`
              : searchTerm ? 'No patients match your search' : 'No patients found'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
                </>
              ) : (
                <>
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a new patient.</p>
                  <div className="mt-6">
                    <Link href="/patients/add">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Patient
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>EMR Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patientData) => (
                  <TableRow key={patientData.id}>
                    <TableCell className="font-medium">
                      {patientData.firstName || ''} {patientData.lastName || ''}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold text-blue-600">
                      {patientData.emrNumber || '-'}
                    </TableCell>
                    <TableCell>{patientData.email || '-'}</TableCell>
                    <TableCell>{patientData.phone || '-'}</TableCell>
                    <TableCell>
                      {getStatusBadge(patientData.status || 'inactive')}
                    </TableCell>
                    <TableCell>
                      {patientData.createdAt ? formatDate(patientData.createdAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/patients/${patientData.id}/edit`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {patientData.firstName || ''} {patientData.lastName || ''}? 
                                This action cannot be undone and will remove all patient records and their user account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(patientData)}
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? "Deleting..." : "Delete"}
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
    </div>
  );
};

export default PatientsPage;