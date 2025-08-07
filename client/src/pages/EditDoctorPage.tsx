import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, User, Mail, Phone, Shield, Stethoscope, CreditCard, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/UI/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/redux/hooks';
import { api } from '@/utils/apiClient';

// Medical specialties
const SPECIALTIES = [
  'General Practice', 'Internal Medicine', 'Pediatrics', 'Surgery', 'Orthopedics',
  'Cardiology', 'Dermatology', 'Neurology', 'Psychiatry', 'Radiology',
  'Emergency Medicine', 'Anesthesiology', 'Pathology', 'Ophthalmology', 'ENT'
];

const editDoctorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  roleId: z.string().optional(),
  specialty: z.string().min(1, "Specialty is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
}).refine(data => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type EditDoctorFormData = z.infer<typeof editDoctorSchema>;

const EditDoctorPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state: any) => state.auth);

  const [doctor, setDoctor] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  const form = useForm<EditDoctorFormData>({
    resolver: zodResolver(editDoctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleId: 'none',
      specialty: '',
      licenseNumber: '',
      status: 'active',
    }
  });

  // Load doctor and roles data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Load doctor and roles in parallel
        const [doctorResponse, rolesResponse] = await Promise.all([
          api.get(`/api/doctors/${id}`),
          api.get(`/api/roles${user?.clinicId ? `?clinicId=${user.clinicId}` : ''}`)
        ]);
        
        const doctorData = doctorResponse.data;
        const rolesData = rolesResponse.data || [];
        
        setDoctor(doctorData);
        setRoles(rolesData);
        
        // Update form with doctor data
        form.reset({
          firstName: doctorData.firstName || '',
          lastName: doctorData.lastName || '',
          email: doctorData.email || '',
          phone: doctorData.phone || '',
          password: '',
          confirmPassword: '',
          roleId: doctorData.roleId ? doctorData.roleId.toString() : 'none',
          specialty: doctorData.specialty || '',
          licenseNumber: doctorData.licenseNumber || '',
          status: doctorData.status || 'active',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load doctor data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user?.clinicId, form, toast]);

  const onSubmit = async (data: EditDoctorFormData) => {
    try {
      setIsUpdating(true);
      
      // Only include password if it's provided
      const submitData: any = { ...data };
      if (!submitData.password || submitData.password.trim() === '') {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      // Convert roleId to number or set to null
      if (submitData.roleId === 'none' || !submitData.roleId) {
        submitData.roleId = null;
      } else {
        submitData.roleId = parseInt(submitData.roleId);
      }

      await api.put(`/api/doctors/${id}`, submitData);
      
      toast({
        title: 'Success',
        description: 'Doctor updated successfully',
      });
      setLocation('/doctors');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update doctor',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading doctor data...</span>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Doctor Not Found</h1>
          <Button onClick={() => setLocation('/doctors')} className="mt-4">
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/doctors')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Doctor</h1>
          <p className="text-gray-600">Update doctor information and account details</p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update the doctor's personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Update medical and role information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter license number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Security Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Information
                </CardTitle>
                <CardDescription>
                  Update login credentials (leave blank to keep current password)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/doctors')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Doctor'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditDoctorPage;