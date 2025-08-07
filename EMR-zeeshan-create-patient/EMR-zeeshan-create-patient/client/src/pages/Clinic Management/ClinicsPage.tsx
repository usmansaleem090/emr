import React, { useState, useEffect } from 'react';

import { Link } from 'wouter';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, Edit2, Trash2, Building2, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '@/utils/apiClient';

interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

interface ClinicWithUser extends Clinic {
  user?: {
    id: number;
    username: string;
    email: string;
    status: string;
  };
}

const ClinicsPage: React.FC = () => {
  const { toast } = useToast();

  
  // State
  const [clinics, setClinics] = useState<ClinicWithUser[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [isDeletingClinic, setIsDeletingClinic] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load clinics
  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setClinicsLoading(true);
      const response = await api.get('/api/clinics');
      setClinics(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load clinics',
        variant: 'destructive',
      });
    } finally {
      setClinicsLoading(false);
    }
  };

  const handleDeleteClinic = async (clinic: ClinicWithUser) => {
    if (!confirm(`Are you sure you want to delete the clinic "${clinic.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeletingClinic(true);
      await api.delete(`/api/clinics/${clinic.id}`);
      
      await loadClinics(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Clinic deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete clinic',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingClinic(false);
    }
  };

  // Filter clinics based on search term and status
  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch = 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || clinic.user?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
          <div className="min-h-screen px-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="mb-3">
          <h1 className="text-3xl font-bold dark:text-gray-900 tracking-tight mb-1">Clinic Management</h1>
        </div>
        <Link href="/clinics/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Clinic
          </Button>
        </Link>
      </div>

      {/* Filters */}
     
          <div className="flex flex-col sm:flex-row gap-4 border rounded-lg	 p-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search clinics by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
   

      {/* Clinics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Registered Clinics ({filteredClinics.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clinicsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredClinics.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic Name</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Login Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{clinic.name}</div>
                          {clinic.address && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {clinic.address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {clinic.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {clinic.email}
                            </div>
                          )}
                          {clinic.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {clinic.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {clinic.user ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{clinic.user.username}</div>
                            <div className="text-xs text-muted-foreground">{clinic.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No account</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          clinic.user?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : clinic.user?.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {clinic.user?.status || 'No account'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(clinic.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/clinics/edit/${clinic.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClinic(clinic)}
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
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clinics found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No clinics match your current filters.'
                  : 'Get started by adding your first clinic.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/clinics/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Clinic
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicsPage;