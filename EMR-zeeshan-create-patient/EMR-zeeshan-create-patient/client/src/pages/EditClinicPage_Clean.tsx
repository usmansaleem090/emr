import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, User, Building2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/utils/apiClient';

interface ClinicData {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    status: string;
  };
}

interface ClinicFormData {
  // Login Information
  username: string;
  email: string;
  password: string;
  status: string;
  
  // Clinic Information
  clinicName: string;
  address: string;
  phone: string;
  clinicEmail: string;
}

const EditClinicPage: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams();
  const clinicId = params.id ? parseInt(params.id) : 0;
  
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [clinic, setClinic] = useState<ClinicData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ClinicFormData>({
    username: '',
    email: '',
    password: '',
    status: 'active',
    clinicName: '',
    address: '',
    phone: '',
    clinicEmail: '',
  });

  // Load clinic data
  useEffect(() => {
    const loadClinic = async () => {
      if (!clinicId) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/api/clinics/${clinicId}`);
        setClinic(response.data);
        
        // Populate form with existing clinic data
        if (response.data) {
          setFormData({
            username: response.data.user?.username || '',
            email: response.data.user?.email || '',
            password: '', // Don't populate password for security
            status: response.data.user?.status || 'active',
            clinicName: response.data.name || '',
            address: response.data.address || '',
            phone: response.data.phone || '',
            clinicEmail: response.data.email || '',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load clinic data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClinic();
  }, [clinicId]);

  const handleInputChange = (field: keyof ClinicFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.clinicName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Clinic name is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.username.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      await api.put(`/api/clinics/${clinicId}`, formData);
      
      toast({
        title: 'Success',
        description: 'Clinic updated successfully',
      });
      setLocation('/clinics');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update clinic',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading clinic data...</span>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Clinic Not Found</h1>
          <p className="text-gray-600 mt-2">The requested clinic could not be found.</p>
          <Button onClick={() => setLocation('/clinics')} className="mt-4">
            Back to Clinics
          </Button>
        </div>
      </div>
    );
  }

  return (
          <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/clinics')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clinics
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Clinic</h1>
              <p className="text-gray-600 dark:text-gray-400">Update clinic information and admin account</p>
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
          <CardDescription>
            Update the clinic details and associated admin account information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Admin Account
              </TabsTrigger>
              <TabsTrigger value="clinic" className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Clinic Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password (leave blank to keep current)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) => handleInputChange('clinicName', e.target.value)}
                    placeholder="Enter clinic name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">Clinic Email</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={formData.clinicEmail}
                    onChange={(e) => handleInputChange('clinicEmail', e.target.value)}
                    placeholder="Enter clinic email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter clinic address"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClinicPage;