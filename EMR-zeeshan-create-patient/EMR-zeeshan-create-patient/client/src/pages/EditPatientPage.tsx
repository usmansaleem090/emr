import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, User, Mail, Phone, Shield, FileText, Activity, Stethoscope, FileSearch, FileArchive, CreditCard, AlertCircle, Calendar } from 'lucide-react';

import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/UI/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/utils/apiClient';

// Form validation schema
const editPatientSchema = z.object({
  user: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional()
  }),
  patient: z.object({
    medicalRecordNumber: z.string().min(1, 'Medical record number is required'),
    status: z.enum(['active', 'inactive', 'discharged'])
  }),
  insurance: z.object({
    primary: z.object({
      companyName: z.string().optional(),
      planType: z.string().optional(),
      payerId: z.string().optional(),
      memberId: z.string().optional(),
      groupNumber: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      relationship: z.string().optional()
    }).optional(),
    secondary: z.object({
      companyName: z.string().optional(),
      planType: z.string().optional(),
      payerId: z.string().optional(),
      memberId: z.string().optional(),
      groupNumber: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      relationship: z.string().optional()
    }).optional(),
    insuredPerson: z.object({
      fullName: z.string().optional(),
      dob: z.string().optional(),
      gender: z.string().optional(),
      employer: z.string().optional()
    }).optional()
  }).optional(),
  vitals: z.object({
    date: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    bpSystolic: z.any().optional(),
    bpDiastolic: z.any().optional(),
    pulse: z.any().optional(),
    temperature: z.string().optional(),
    spO2: z.any().optional(),
    respiratoryRate: z.any().optional(),
    painScale: z.any().optional()
  }).optional()
});

type EditPatientFormData = z.infer<typeof editPatientSchema>;

const EditPatientPage = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [patientData, setPatientData] = useState<any>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('patient-info');

  const form = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      user: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      patient: {
        medicalRecordNumber: '',
        status: 'active'
      },
      insurance: {
        primary: {
          companyName: '',
          planType: '',
          payerId: '',
          memberId: '',
          groupNumber: '',
          effectiveDate: '',
          expiryDate: '',
          relationship: ''
        },
        secondary: {
          companyName: '',
          planType: '',
          payerId: '',
          memberId: '',
          groupNumber: '',
          effectiveDate: '',
          expiryDate: '',
          relationship: ''
        },
        insuredPerson: {
          fullName: '',
          dob: '',
          gender: '',
          employer: ''
        }
      },
      vitals: {
        date: '',
        height: '',
        weight: '',
        bmi: '',
        bpSystolic: '',
        bpDiastolic: '',
        pulse: '',
        temperature: '',
        spO2: '',
        respiratoryRate: '',
        painScale: ''
      }
    }
  });

  // Load patient data
  useEffect(() => {
    const loadPatient = async () => {
      if (!id) return;
      
      try {
        setIsLoadingPatient(true);
        const response = await api.get(`/api/patients/${id}`);
        console.log('Patient edit API response:', response.data);
        const data = response.data.data || response.data;
        console.log('Patient data for editing:', data);
        setPatientData(data);
        
        // Set form values when data is loaded
        if (data) {
          // Transform insurance array to object structure for form
          let insuranceData = {
            primary: {
              companyName: '',
              planType: '',
              payerId: '',
              memberId: '',
              groupNumber: '',
              effectiveDate: '',
              expiryDate: '',
              relationship: ''
            },
            secondary: {
              companyName: '',
              planType: '',
              payerId: '',
              memberId: '',
              groupNumber: '',
              effectiveDate: '',
              expiryDate: '',
              relationship: ''
            },
            insuredPerson: {
              fullName: '',
              dob: '',
              gender: '',
              employer: ''
            }
          };

          // Process insurance data if it exists
          if (data.insurance && Array.isArray(data.insurance)) {
            data.insurance.forEach((ins: any) => {
              if (ins.insuranceType === 'Primary') {
                insuranceData.primary = {
                  companyName: ins.insuranceCompanyName || '',
                  planType: ins.insurancePlanName || '',
                  payerId: ins.payerId || '',
                  memberId: ins.memberId || '',
                  groupNumber: ins.groupNumber || '',
                  effectiveDate: ins.planEffectiveDate || '',
                  expiryDate: ins.planExpiryDate || '',
                  relationship: ins.relationshipToInsured || ''
                };
                insuranceData.insuredPerson = {
                  fullName: ins.insuredPersonFullName || '',
                  dob: ins.insuredPersonDateOfBirth || '',
                  gender: ins.insuredPersonGender || '',
                  employer: ins.insuredPersonEmployer || ''
                };
              } else if (ins.insuranceType === 'Secondary') {
                insuranceData.secondary = {
                  companyName: ins.insuranceCompanyName || '',
                  planType: ins.insurancePlanName || '',
                  payerId: ins.payerId || '',
                  memberId: ins.memberId || '',
                  groupNumber: ins.groupNumber || '',
                  effectiveDate: ins.planEffectiveDate || '',
                  expiryDate: ins.planExpiryDate || '',
                  relationship: ins.relationshipToInsured || ''
                };
              }
            });
          }

          form.reset({
            user: {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              phone: data.phone || '',
            },
            patient: {
              medicalRecordNumber: data.medicalRecordNumber || '',
              status: data.status || 'active',
              dateOfBirth: data.dateOfBirth || '',
              phone: data.phone || '',
              homePhone: data.homePhone || '',
              gender: data.gender || '',
              socialSecurityNumber: data.socialSecurityNumber || '',
              ethnicity: data.ethnicity || '',
              race: data.race || '',
              preferredLanguage: data.preferredLanguage || '',
              streetAddress: data.streetAddress || '',
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zipCode || '',
              // Add more patient fields as needed
            },
            vitals: data.vitals || {},
            medicalHistory: data.medicalHistory || {},
            surgicalHistory: data.surgicalHistory || [],
            medications: data.medications || [],
            diagnostics: data.diagnostics || [],
            insurance: insuranceData,
            // Add more sections as needed
          });
        } else {
          throw new Error('Patient data not found or invalid format');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load patient data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingPatient(false);
      }
    };

    loadPatient();
  }, [id, form, toast]);

  const onSubmit = async (data: EditPatientFormData) => {
    try {
      setIsUpdating(true);

      // Transform insurance object to array for backend compatibility
      let insuranceArray: any[] = [];
      if (data.insurance) {
        if (data.insurance.primary && Object.values(data.insurance.primary).some(v => v)) {
          insuranceArray.push({
            insuranceType: 'Primary',
            insuranceCompanyName: data.insurance.primary.companyName || '',
            insurancePlanName: data.insurance.primary.planType || '',
            payerId: data.insurance.primary.payerId || '',
            memberId: data.insurance.primary.memberId || '',
            groupNumber: data.insurance.primary.groupNumber || '',
            planEffectiveDate: data.insurance.primary.effectiveDate || null,
            planExpiryDate: data.insurance.primary.expiryDate || null,
            relationshipToInsured: data.insurance.primary.relationship || 'Self',
            insuredPersonFullName: data.insurance.insuredPerson?.fullName || '',
            insuredPersonDateOfBirth: data.insurance.insuredPerson?.dob || null,
            insuredPersonGender: data.insurance.insuredPerson?.gender || '',
            insuredPersonEmployer: data.insurance.insuredPerson?.employer || '',
            isActive: true
          });
        }
        if (data.insurance.secondary && Object.values(data.insurance.secondary).some(v => v)) {
          insuranceArray.push({
            insuranceType: 'Secondary',
            insuranceCompanyName: data.insurance.secondary.companyName || '',
            insurancePlanName: data.insurance.secondary.planType || '',
            payerId: data.insurance.secondary.payerId || '',
            memberId: data.insurance.secondary.memberId || '',
            groupNumber: data.insurance.secondary.groupNumber || '',
            planEffectiveDate: data.insurance.secondary.effectiveDate || null,
            planExpiryDate: data.insurance.secondary.expiryDate || null,
            relationshipToInsured: data.insurance.secondary.relationship || 'Self',
            insuredPersonFullName: data.insurance.insuredPerson?.fullName || '',
            insuredPersonDateOfBirth: data.insurance.insuredPerson?.dob || null,
            insuredPersonGender: data.insurance.insuredPerson?.gender || '',
            insuredPersonEmployer: data.insurance.insuredPerson?.employer || '',
            isActive: true
          });
        }
      }

      const updateData = {
        ...data,
        insurance: insuranceArray
      };

      await api.put(`/api/patients/${id}`, updateData);
      
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });
      setLocation('/patients');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update patient';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading patient data...</span>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Patient Not Found</h1>
          <Button onClick={() => setLocation('/patients')} className="mt-4">
            Back to Patients
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
          onClick={() => setLocation('/patients')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-gray-600">Update patient information and account details</p>
        </div>
      </div>

      {/* Tabbed Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="patient-info" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Info
              </TabsTrigger>
              <TabsTrigger value="clinical-data" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Clinical Data
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Diagnostics
              </TabsTrigger>
              <TabsTrigger value="documentation" className="flex items-center gap-2">
                <FileArchive className="w-5 h-5" />
                Documentation
              </TabsTrigger>
              <TabsTrigger value="billing-finance" className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Finance
              </TabsTrigger>
            </TabsList>



            {/* Patient Info Tab */}
            <TabsContent value="patient-info" className="space-y-6">
              <Tabs defaultValue="demographics" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  <TabsTrigger value="consent">Consent</TabsTrigger>
                </TabsList>
                <TabsContent value="demographics" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Enter the patient's personal details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="user.firstName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="user.lastName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="patient.dateOfBirth" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="patient.gender" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="patient.socialSecurityNumber" render={({ field }) => (
                          <FormItem>
                            <FormLabel>SSN (Last 4 digits only)</FormLabel>
                            <FormControl>
                              <Input placeholder="****" maxLength={4} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="patient.ethnicity" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ethnicity</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ethnicity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Hispanic">Hispanic or Latino</SelectItem>
                                  <SelectItem value="Not Hispanic">Not Hispanic or Latino</SelectItem>
                                  <SelectItem value="Unknown">Unknown</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="patient.race" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Race</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select race" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="White">White</SelectItem>
                                  <SelectItem value="Black">Black or African American</SelectItem>
                                  <SelectItem value="Asian">Asian</SelectItem>
                                  <SelectItem value="Native American">American Indian or Alaska Native</SelectItem>
                                  <SelectItem value="Pacific Islander">Native Hawaiian or Pacific Islander</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                  <SelectItem value="Unknown">Unknown</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="patient.preferredLanguage" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                                <SelectItem value="Chinese">Chinese</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Patient Status
                        </CardTitle>
                        <CardDescription>
                          Set patient status and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField control={form.control} name="patient.status" render={({ field }) => (
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
                                <SelectItem value="discharged">Discharged</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="contact-info" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact Information
                      </CardTitle>
                      <CardDescription>
                        Patient's contact details and communication preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField control={form.control} name="user.email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="patient.phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="patient.homePhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter home number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="patient.homePhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter home number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="address" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Address Information
                      </CardTitle>
                      <CardDescription>
                        Patient's residential address details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField control={form.control} name="patient.streetAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="patient.city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="patient.state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AL">Alabama</SelectItem>
                                <SelectItem value="AK">Alaska</SelectItem>
                                <SelectItem value="AZ">Arizona</SelectItem>
                                <SelectItem value="AR">Arkansas</SelectItem>
                                <SelectItem value="CA">California</SelectItem>
                                <SelectItem value="CO">Colorado</SelectItem>
                                <SelectItem value="CT">Connecticut</SelectItem>
                                <SelectItem value="DE">Delaware</SelectItem>
                                <SelectItem value="FL">Florida</SelectItem>
                                <SelectItem value="GA">Georgia</SelectItem>
                                <SelectItem value="HI">Hawaii</SelectItem>
                                <SelectItem value="ID">Idaho</SelectItem>
                                <SelectItem value="IL">Illinois</SelectItem>
                                <SelectItem value="IN">Indiana</SelectItem>
                                <SelectItem value="IA">Iowa</SelectItem>
                                <SelectItem value="KS">Kansas</SelectItem>
                                <SelectItem value="KY">Kentucky</SelectItem>
                                <SelectItem value="LA">Louisiana</SelectItem>
                                <SelectItem value="ME">Maine</SelectItem>
                                <SelectItem value="MD">Maryland</SelectItem>
                                <SelectItem value="MA">Massachusetts</SelectItem>
                                <SelectItem value="MI">Michigan</SelectItem>
                                <SelectItem value="MN">Minnesota</SelectItem>
                                <SelectItem value="MS">Mississippi</SelectItem>
                                <SelectItem value="MO">Missouri</SelectItem>
                                <SelectItem value="MT">Montana</SelectItem>
                                <SelectItem value="NE">Nebraska</SelectItem>
                                <SelectItem value="NV">Nevada</SelectItem>
                                <SelectItem value="NH">New Hampshire</SelectItem>
                                <SelectItem value="NJ">New Jersey</SelectItem>
                                <SelectItem value="NM">New Mexico</SelectItem>
                                <SelectItem value="NY">New York</SelectItem>
                                <SelectItem value="NC">North Carolina</SelectItem>
                                <SelectItem value="ND">North Dakota</SelectItem>
                                <SelectItem value="OH">Ohio</SelectItem>
                                <SelectItem value="OK">Oklahoma</SelectItem>
                                <SelectItem value="OR">Oregon</SelectItem>
                                <SelectItem value="PA">Pennsylvania</SelectItem>
                                <SelectItem value="RI">Rhode Island</SelectItem>
                                <SelectItem value="SC">South Carolina</SelectItem>
                                <SelectItem value="SD">South Dakota</SelectItem>
                                <SelectItem value="TN">Tennessee</SelectItem>
                                <SelectItem value="TX">Texas</SelectItem>
                                <SelectItem value="UT">Utah</SelectItem>
                                <SelectItem value="VT">Vermont</SelectItem>
                                <SelectItem value="VA">Virginia</SelectItem>
                                <SelectItem value="WA">Washington</SelectItem>
                                <SelectItem value="WV">West Virginia</SelectItem>
                                <SelectItem value="WI">Wisconsin</SelectItem>
                                <SelectItem value="WY">Wyoming</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="patient.zipCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter ZIP code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="insurance" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Insurance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Primary Insurance
                        </CardTitle>
                        <CardDescription>
                          Primary insurance information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="insurance.primary.companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="insurance.primary.planType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plan Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ppo">PPO</SelectItem>
                                    <SelectItem value="hmo">HMO</SelectItem>
                                    <SelectItem value="epo">EPO</SelectItem>
                                    <SelectItem value="pos">POS</SelectItem>
                                    <SelectItem value="medicare">Medicare</SelectItem>
                                    <SelectItem value="medicaid">Medicaid</SelectItem>
                                    <SelectItem value="tricare">TRICARE</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="insurance.primary.payerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payer ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter payer ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="insurance.primary.memberId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Member ID / Policy Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter member ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="insurance.primary.groupNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Group Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter group number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="insurance.primary.effectiveDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Effective Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="insurance.primary.expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="insurance.primary.relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship to Insured</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="self">Self</SelectItem>
                                  <SelectItem value="spouse">Spouse</SelectItem>
                                  <SelectItem value="child">Child</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Secondary Insurance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Secondary Insurance
                        </CardTitle>
                        <CardDescription>
                          Secondary insurance information (optional)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="insurance.secondary.companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="insurance.secondary.planType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plan Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ppo">PPO</SelectItem>
                                    <SelectItem value="hmo">HMO</SelectItem>
                                    <SelectItem value="epo">EPO</SelectItem>
                                    <SelectItem value="pos">POS</SelectItem>
                                    <SelectItem value="medicare">Medicare</SelectItem>
                                    <SelectItem value="medicaid">Medicaid</SelectItem>
                                    <SelectItem value="tricare">TRICARE</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="insurance.secondary.memberId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Member ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter member ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Insured Person Details */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Insured Person Details
                        </CardTitle>
                        <CardDescription>
                          Information about the insured person (if different from patient)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="insurance.insuredPerson.fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Insured Person's Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="insurance.insuredPerson.dob"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="insurance.insuredPerson.gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="insurance.insuredPerson.employer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employer (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter employer name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="consent" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Patient Consent & Authorization
                      </CardTitle>
                      <CardDescription>
                        Required consent forms and authorizations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="releaseOfInfo"
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="releaseOfInfo" className="text-sm">
                            Release of Information - I authorize the release of my medical information as necessary for treatment, payment, and healthcare operations.
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="assignmentOfBenefits"
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="assignmentOfBenefits" className="text-sm">
                            Assignment of Benefits - I authorize payment of medical benefits to the healthcare provider for services rendered.
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="financialResponsibility"
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="financialResponsibility" className="text-sm">
                            Financial Responsibility - I understand that I am financially responsible for any charges not covered by my insurance.
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="privacyNotice"
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="privacyNotice" className="text-sm">
                            Privacy Notice - I have received and understand the Notice of Privacy Practices.
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Clinical Data Tab */}
            <TabsContent value="clinical-data" className="space-y-6">
              <Tabs defaultValue="vitals" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                  <TabsTrigger value="history">Medical History</TabsTrigger>
                  <TabsTrigger value="allergies">Allergies</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                </TabsList>

                {/* Vitals Inner Tab */}
                <TabsContent value="vitals" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Vitals */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Add New Vitals
                        </CardTitle>
                        <CardDescription>
                          Record current vital signs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="vitals.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vitals.height"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height (cm)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter height" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vitals.weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter weight" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="vitals.bmi"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BMI (calculated)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Auto-calculated" {...field} disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vitals.bpSystolic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>BP Systolic (mmHg)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter systolic" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vitals.bpDiastolic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>BP Diastolic (mmHg)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter diastolic" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vitals.pulse"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pulse (bpm)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter pulse" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vitals.temperature"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Temperature (°C)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" placeholder="Enter temperature" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vitals.spO2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SpO2 (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter SpO2" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vitals.respiratoryRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Respiratory Rate (rpm)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter respiratory rate" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="vitals.painScale"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pain Scale (0-10)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="10" placeholder="Enter pain scale" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full">
                          Add Vitals
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Vitals History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Vitals History
                        </CardTitle>
                        <CardDescription>
                          Recent vital signs records
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">BP</th>
                                <th className="text-left p-2">Pulse</th>
                                <th className="text-left p-2">Temp</th>
                                <th className="text-left p-2">SpO2</th>
                                <th className="text-left p-2">Weight</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No vitals recorded</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Medical History Inner Tab */}
                <TabsContent value="history" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Medical History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5" />
                          Medical History
                        </CardTitle>
                        <CardDescription>
                          Select conditions that apply
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="hypertension" className="rounded border-gray-300" />
                            <Label htmlFor="hypertension" className="text-sm">Hypertension</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="diabetes" className="rounded border-gray-300" />
                            <Label htmlFor="diabetes" className="text-sm">Diabetes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="copd" className="rounded border-gray-300" />
                            <Label htmlFor="copd" className="text-sm">COPD</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="asthma" className="rounded border-gray-300" />
                            <Label htmlFor="asthma" className="text-sm">Asthma</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="cad" className="rounded border-gray-300" />
                            <Label htmlFor="cad" className="text-sm">CAD</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="chf" className="rounded border-gray-300" />
                            <Label htmlFor="chf" className="text-sm">CHF</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="mi" className="rounded border-gray-300" />
                            <Label htmlFor="mi" className="text-sm">MI</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="stroke" className="rounded border-gray-300" />
                            <Label htmlFor="stroke" className="text-sm">Stroke</Label>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="history.otherConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Other Conditions</FormLabel>
                              <FormControl>
                                <textarea 
                                  className="w-full p-2 border rounded-md" 
                                  placeholder="Enter other medical conditions..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Surgical History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5" />
                          Surgical History
                        </CardTitle>
                        <CardDescription>
                          Add surgical procedures
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="surgery.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="surgery.procedure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Procedure</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter procedure name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="surgery.notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <textarea 
                                  className="w-full p-2 border rounded-md" 
                                  placeholder="Enter surgical notes..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full">
                          Add Surgery
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Surgery History Table */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Surgical History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Procedure</th>
                                <th className="text-left p-2">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No surgeries recorded</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Allergies Inner Tab */}
                <TabsContent value="allergies" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Allergy */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Add New Allergy
                        </CardTitle>
                        <CardDescription>
                          Record patient allergies
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="allergy.allergen"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allergen</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter allergen name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="allergy.reaction"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reaction</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter reaction description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="allergy.severity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Severity</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="mild">Mild</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="severe">Severe</SelectItem>
                                    <SelectItem value="life-threatening">Life-threatening</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="allergy.type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="drug">Drug</SelectItem>
                                    <SelectItem value="food">Food</SelectItem>
                                    <SelectItem value="environmental">Environmental</SelectItem>
                                    <SelectItem value="latex">Latex</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="allergy.dateIdentified"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Identified</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full">
                          Add Allergy
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Allergy History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Allergy History
                        </CardTitle>
                        <CardDescription>
                          Recorded allergies
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Allergen</th>
                                <th className="text-left p-2">Reaction</th>
                                <th className="text-left p-2">Severity</th>
                                <th className="text-left p-2">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No allergies recorded</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Medications Inner Tab */}
                <TabsContent value="medications" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Medication */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5" />
                          Add New Medication
                        </CardTitle>
                        <CardDescription>
                          Record patient medications
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="medication.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter medication name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="medication.dose"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dose</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter dose" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="medication.status"
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
                                    <SelectItem value="discontinued">Discontinued</SelectItem>
                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="medication.route"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Route</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select route" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="oral">Oral</SelectItem>
                                    <SelectItem value="intravenous">Intravenous</SelectItem>
                                    <SelectItem value="intramuscular">Intramuscular</SelectItem>
                                    <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                                    <SelectItem value="topical">Topical</SelectItem>
                                    <SelectItem value="inhalation">Inhalation</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="medication.frequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Twice daily" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="medication.startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="medication.prescriber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prescriber</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter prescriber name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="button" className="w-full">
                          Add Medication
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Medication History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5" />
                          Medication History
                        </CardTitle>
                        <CardDescription>
                          Current and past medications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Medication</th>
                                <th className="text-left p-2">Dose</th>
                                <th className="text-left p-2">Status</th>
                                <th className="text-left p-2">Start Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No medications recorded</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                                <td className="p-2 text-gray-500">--</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Diagnostics Tab */}
            <TabsContent value="diagnostics" className="space-y-6">
              <Tabs defaultValue="lab-results" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
                  <TabsTrigger value="imaging">Imaging</TabsTrigger>
                  <TabsTrigger value="prior-visits">Prior Visits</TabsTrigger>
                </TabsList>
                <TabsContent value="lab-results" className="space-y-6">
                  {/* TODO: Lab Results content */}
                  <div>Lab Results content goes here.</div>
                </TabsContent>
                <TabsContent value="imaging" className="space-y-6">
                  {/* TODO: Imaging content */}
                  <div>Imaging content goes here.</div>
                </TabsContent>
                <TabsContent value="prior-visits" className="space-y-6">
                  {/* TODO: Prior Visits content */}
                  <div>Prior Visits content goes here.</div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="documentation" className="space-y-6">
              <Tabs defaultValue="clinical-notes" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="clinical-notes">Clinical Notes</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="faxes">Faxes</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>
                <TabsContent value="clinical-notes" className="space-y-6">
                  {/* TODO: Clinical Notes content */}
                  <div>Clinical Notes content goes here.</div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-6">
                  {/* TODO: Documents content */}
                  <div>Documents content goes here.</div>
                </TabsContent>
                <TabsContent value="faxes" className="space-y-6">
                  {/* TODO: Faxes content */}
                  <div>Faxes content goes here.</div>
                </TabsContent>
                <TabsContent value="attachments" className="space-y-6">
                  {/* TODO: Attachments content */}
                  <div>Attachments content goes here.</div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Billing & Finance Tab */}
            <TabsContent value="billing-finance" className="space-y-6">
              <Tabs defaultValue="payment-history" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                  <TabsTrigger value="claims">Claims</TabsTrigger>
                  <TabsTrigger value="statements">Statements</TabsTrigger>
                </TabsList>
                <TabsContent value="payment-history" className="space-y-6">
                  {/* TODO: Payment History content */}
                  <div>Payment History content goes here.</div>
                </TabsContent>
                <TabsContent value="claims" className="space-y-6">
                  {/* TODO: Claims content */}
                  <div>Claims content goes here.</div>
                </TabsContent>
                <TabsContent value="statements" className="space-y-6">
                  {/* TODO: Statements content */}
                  <div>Statements content goes here.</div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/patients')}
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
                'Update Patient'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditPatientPage;