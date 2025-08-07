import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
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
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const patientSchema = z.object({
  user: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Valid email format').optional().or(z.literal('')),
    phone: z.string().optional(),
    password: z.string().optional()
  }),
  patient: z.object({
    clinicId: z.number().optional(),
    status: z.enum(['active', 'inactive', 'discharged']).default('active'),
    dateOfBirth: z.string().optional(),
    phone: z.string().optional(),
    homePhone: z.string().optional(),
    gender: z.string().optional(),
    socialSecurityNumber: z.string().optional(),
    ethnicity: z.string().optional(),
    race: z.string().optional(),
    preferredLanguage: z.string().optional(),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }),
  vitals: z.object({
    date: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    bpSystolic: z.string().optional(),
    bpDiastolic: z.string().optional(),
    pulse: z.string().optional(),
    temperature: z.string().optional(),
    spO2: z.string().optional(),
    respiratoryRate: z.string().optional(),
    painScale: z.string().optional()
  }).optional(),
  medicalHistory: z.object({
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
    familyHistory: z.string().optional(),
    currentMedications: z.string().optional(),
    previousSurgeries: z.string().optional(),
    otherConditions: z.string().optional()
  }).optional(),
  surgicalHistory: z.array(z.object({
    surgeryType: z.string().optional(),
    surgeryDate: z.string().optional(),
    surgeon: z.string().optional(),
    hospital: z.string().optional(),
    complications: z.string().optional(),
    outcome: z.string().optional()
  })).optional(),
  surgery: z.object({
    date: z.string().optional(),
    procedure: z.string().optional(),
    notes: z.string().optional()
  }).optional(),
  allergy: z.object({
    allergen: z.string().optional(),
    reaction: z.string().optional(),
    severity: z.string().optional(),
    type: z.string().optional(),
    dateIdentified: z.string().optional()
  }).optional(),
  history: z.object({
    otherConditions: z.string().optional()
  }).optional(),
  medication: z.object({
    name: z.string().optional(),
    dose: z.string().optional(),
    status: z.string().optional(),
    route: z.string().optional(),
    frequency: z.string().optional(),
    startDate: z.string().optional(),
    prescriber: z.string().optional()
  }).optional(),
  labResult: z.object({
    test: z.string().optional(),
    result: z.string().optional(),
    referenceRange: z.string().optional(),
    units: z.string().optional(),
    flag: z.string().optional(),
    trend: z.string().optional(),
    date: z.string().optional()
  }).optional(),
  imaging: z.object({
    studyType: z.string().optional(),
    bodyPart: z.string().optional(),
    finding: z.string().optional(),
    date: z.string().optional(),
    radiologist: z.string().optional(),
    impression: z.string().optional()
  }).optional(),
  medications: z.array(z.object({
    medicationName: z.string().optional(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().nullable(),
    prescribingDoctor: z.string().optional(),
    reason: z.string().optional(),
    isActive: z.boolean().optional()
  })).optional(),
  diagnostics: z.array(z.object({
    testName: z.string().optional(),
    testDate: z.string().optional(),
    result: z.string().optional(),
    normalRange: z.string().optional(),
    interpretation: z.string().optional(),
    orderingDoctor: z.string().optional(),
    lab: z.string().optional()
  })).optional(),
  priorVisit: z.array(z.object({
    date: z.string().optional(),
    reason: z.string().optional(),
    diagnosis: z.string().optional(),
    treatment: z.string().optional(),
    provider: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
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
  }).optional()
});



const AddPatientPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('patient-info');
  const { user } = useAuth();
  const [val, setvak] = useState('');
  // Tab order for navigation
  const tabOrder = ['patient-info', 'clinical-data', 'diagnostics', 'documentation', 'billing-finance'];
  console.log(val, "val")
  // Navigation functions
  const goToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const isFirstTab = () => activeTab === tabOrder[0];
  const isLastTab = () => activeTab === tabOrder[tabOrder.length - 1];

  const defaultValues = useMemo(() => ({
    user: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    },
    patient: {
      status: 'active',
      dateOfBirth: '',
      phone: '',
      homePhone: '',
      gender: '',
      socialSecurityNumber: '',
      ethnicity: '',
      race: '',
      preferredLanguage: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: ''
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
    },
    medicalHistory: {
      allergies: '',
      chronicConditions: '',
      familyHistory: '',
      currentMedications: '',
      previousSurgeries: '',
      otherConditions: ''
    },
    surgery: {
      date: '',
      procedure: '',
      notes: ''
    },
    allergy: {
      allergen: '',
      reaction: '',
      severity: '',
      type: '',
      dateIdentified: ''
    },
    history: {
      otherConditions: ''
    },
    medication: {
      name: '',
      dose: '',
      status: '',
      route: '',
      frequency: '',
      startDate: '',
      prescriber: ''
    },
    labResult: {
      test: '',
      result: '',
      referenceRange: '',
      units: '',
      flag: '',
      trend: '',
      date: ''
    },
    imaging: {
      studyType: '',
      bodyPart: '',
      finding: '',
      date: '',
      radiologist: '',
      impression: ''
    },
    surgicalHistory: [],
    medications: [],
    diagnostics: [],
    priorVisit: [],
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
    }
  }), []);

  const form = useForm<any>({
    resolver: zodResolver(patientSchema),
    mode: 'onSubmit',
    defaultValues
  });
  const onSubmit = async (data: any) => {
    console.log(data ,"data")
    try {
      console.log('Submitting patient data:', data);
      setIsCreating(true);

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

      const patientData = {
        user: {
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          password: data.user.password || ''
        },
        patient: {
          clinicId: user?.clinicId || 1,
          status: data.patient.status || 'active',
          dateOfBirth: data.patient.dateOfBirth || '',
          phone: data.patient.phone || '',
          homePhone: data.patient.homePhone || '',
          gender: data.patient.gender || '',
          socialSecurityNumber: data.patient.socialSecurityNumber || '',
          ethnicity: data.patient.ethnicity || '',
          race: data.patient.race || '',
          preferredLanguage: data.patient.preferredLanguage || '',
          streetAddress: data.patient.streetAddress || '',
          city: data.patient.city || '',
          state: data.patient.state || '',
          zipCode: data.patient.zipCode || ''
        },
        vitals: data.vitals ? {
          date: data.vitals.date && data.vitals.date !== '' ? (() => {
            try {
              const date = new Date(data.vitals.date);
              return isNaN(date.getTime()) ? null : date.toISOString();
            } catch (error) {
              console.warn('Invalid date format:', data.vitals.date);
              return null;
            }
          })() : null,
          height: Number(data.vitals.height) || null,
          weight: Number(data.vitals.weight) || null,
          bmi:  Number(data.vitals.bmi) || null,
          bpSystolic: data.vitals.bpSystolic ? parseInt(data.vitals.bpSystolic) : null,
          bpDiastolic: data.vitals.bpDiastolic ? parseInt(data.vitals.bpDiastolic) : null,
          pulse: data.vitals.pulse ? parseInt(data.vitals.pulse) : null,
          temperature: Number(data.vitals.temperature) || null,
          spO2: data.vitals.spO2 ? parseInt(data.vitals.spO2) : null,
          respiratoryRate: data.vitals.respiratoryRate ? parseInt(data.vitals.respiratoryRate) : null,
          painScale: data.vitals.painScale ? parseInt(data.vitals.painScale) : null
        } : {},
        medicalHistory: data.medicalHistory || {},
        surgicalHistory: data.surgicalHistory || [],
        medications: data.medications || [],
        diagnostics: data.diagnostics || [],
        priorVisit: data.priorVisit || [],
        insurance: insuranceArray
      };

      console.log('Sending patient data to API:', patientData);
      await api.post('/api/patients', patientData);
      toast({
        title: 'Success',
        description: 'Patient created successfully',
        variant: 'default',
      });
      setLocation('/patients');
    } catch (error: any) {
      console.error('Error creating patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create patient';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };
  useEffect(() => {
    form.setValue("patient.gender", val)
    console.log(form.getValues(), val);
  }, [val])

  // Add these handler functions inside your AddPatientPage component:
  const addDiagnostic = () => {
    const current = form.getValues('labResult');
    if (!current.test) return;
    form.setValue('diagnostics', [...(form.getValues('diagnostics') || []), current]);
    form.resetField('labResult');
  };
  const addImaging = () => {
    const current = form.getValues('imaging');
    if (!current.studyType) return;
    form.setValue('diagnostics', [...(form.getValues('diagnostics') || []), current]);
    form.resetField('imaging');
  };
  const addPriorVisit = () => {
    const current = form.getValues('priorVisit');
    if (!current.date && !current.reason && !current.diagnosis && !current.provider && !current.notes) return;
    form.setValue('priorVisit', [...(form.getValues('priorVisit') || []), current]);
    form.resetField('priorVisit');
  };
  const addMedication = () => {
    const current = form.getValues('medication');
    if (!current.name) return;
    form.setValue('medications', [...(form.getValues('medications') || []), current]);
    form.resetField('medication');
  };
  const addSurgicalHistory = () => {
    const current = form.getValues('surgery');
    if (!current.date && !current.procedure) return;
    form.setValue('surgicalHistory', [...(form.getValues('surgicalHistory') || []), current]);
    form.resetField('surgery');
  };

  const addLabResult = () => {
    const current = form.getValues('labResult');
    if (!current.testName) return;
    form.setValue('diagnostics', [...(form.getValues('diagnostics') || []), { ...current, type: 'Lab' }]);
    form.resetField('labResult');
  };
  const addClinicNote = () => {
    const current = form.getValues('clinicNote');
    if (!current.noteTitle) return;
    form.setValue('clinicNotes', [...(form.getValues('clinicNotes') || []), current]);
    form.resetField('clinicNote');
  };
  const addClinicDocument = () => {
    const current = form.getValues('clinicDocument');
    if (!current.documentName) return;
    form.setValue('clinicDocuments', [...(form.getValues('clinicDocuments') || []), current]);
    form.resetField('clinicDocument');
  };

  return (
    <div className="p-4 space-y-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
          <p className="text-gray-600">Create a new patient record with user account</p>
        </div>
      </div>
      {/* Tabbed Form */}
      <Form {...form} >
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                <FileArchive className="h-4 w-4" />
                Documentation
              </TabsTrigger>
              <TabsTrigger value="billing-finance" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing & Finance
              </TabsTrigger>
            </TabsList>



            {/* Patient Info Tab */}
            <TabsContent value="patient-info" className="space-y-4">
              <Tabs defaultValue="demographics" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  <TabsTrigger value="consent">Consent</TabsTrigger>
                </TabsList>

                {/* Demographics Inner Tab */}
                <TabsContent value="demographics" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          <FormField
                            control={form.control}
                            name="user.firstName"
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
                            name="user.lastName"
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
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="patient.dateOfBirth"
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
                          <FormField
                            control={form.control}
                            name="patient.gender"
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <Select
                                    value={""}
                                    onValueChange={(val) => {
                                      setvak(val)
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={field.value ? field.value  :  "Select gender"} />
                                      </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                      <SelectItem key="male" value="male">Male</SelectItem>
                                      <SelectItem key="female" value="female">Female</SelectItem>
                                      <SelectItem key="other" value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}

                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="patient.socialSecurityNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SSN (Last 4 digits only)</FormLabel>
                              <FormControl>
                                <Input placeholder="****" maxLength={4} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="patient.ethnicity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ethnicity</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select ethnicity"} />
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
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="patient.race"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Race</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select race" } />
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
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="patient.preferredLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Language</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select language" } />
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
                          )}
                        />
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
                        <FormField
                          control={form.control}
                          name="patient.status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select status"} />
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
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="user.password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Contact Info Inner Tab */}
                <TabsContent value="contact-info" className="space-y-4">
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
                      <FormField
                        control={form.control}
                        name="user.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="user.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mobile number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="patient.homePhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Home Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter home number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="patient.homePhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Home Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter home number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Address Inner Tab */}
                <TabsContent value="address" className="space-y-4">
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
                      <FormField
                        control={form.control}
                        name="patient.streetAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="patient.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="patient.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select state"} />
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
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="patient.zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter ZIP code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Insurance Inner Tab */}
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select plan type"} />
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
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select relationship"} />
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select plan type"} />
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
                          {/* <FormField
                            control={form.control}
                            name="insurance.insuredPerson.gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select gender"} />
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
                          /> */}
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

                {/* Consent Inner Tab */}
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
                        <Button type="button" className="w-full" onClick={addDiagnostic}>
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
                        <Button type="button" className="w-full" onClick={addSurgicalHistory}>
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
                              {form.watch('surgicalHistory') && form.watch('surgicalHistory').length > 0 ? (
                                form.watch('surgicalHistory').map((surgery: { date: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; procedure: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; notes: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, idx: React.Key | null | undefined) => (
                                  <tr key={idx} className="border-b">
                                    <td className="p-2">{surgery.date}</td>
                                    <td className="p-2">{surgery.procedure}</td>
                                    <td className="p-2">{surgery.notes}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr className="border-b">
                                  <td className="p-2 text-gray-500">No surgeries recorded</td>
                                  <td className="p-2 text-gray-500">--</td>
                                  <td className="p-2 text-gray-500">--</td>
                                </tr>
                              )}
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select severity"} />
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select type"} />
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select status"} />
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select route"} />
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
                        <Button type="button" className="w-full" onClick={addMedication}>
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

                {/* Lab Results Inner Tab */}
                <TabsContent value="lab-results" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Lab Result */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSearch className="w-5 h-5" />
                          Add New Lab Result
                        </CardTitle>
                        <CardDescription>
                          Record laboratory test results
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="labResult.test"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter test name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="labResult.result"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Result</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter test result" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="labResult.referenceRange"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reference Range</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter reference range" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="labResult.units"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Units</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter units" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="labResult.flag"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Flag</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select flag"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="abnormal">Abnormal</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="labResult.trend"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trend</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select trend"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="stable">Stable</SelectItem>
                                    <SelectItem value="increasing">Increasing</SelectItem>
                                    <SelectItem value="decreasing">Decreasing</SelectItem>
                                    <SelectItem value="fluctuating">Fluctuating</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="labResult.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full" onClick={addLabResult}>
                          Add Lab Result
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Lab Results History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSearch className="w-5 h-5" />
                          Lab Results History
                        </CardTitle>
                        <CardDescription>
                          Recent laboratory test results
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Test</th>
                                <th className="text-left p-2">Result</th>
                                <th className="text-left p-2">Flag</th>
                                <th className="text-left p-2">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No lab results recorded</td>
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

                {/* Imaging Inner Tab */}
                <TabsContent value="imaging" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Imaging */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSearch className="w-5 h-5" />
                          Add New Imaging
                        </CardTitle>
                        <CardDescription>
                          Record imaging studies and results
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="imaging.studyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Study Type</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select study type"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="x-ray">X-Ray</SelectItem>
                                  <SelectItem value="ct">CT Scan</SelectItem>
                                  <SelectItem value="mri">MRI</SelectItem>
                                  <SelectItem value="ultrasound">Ultrasound</SelectItem>
                                  <SelectItem value="mammogram">Mammogram</SelectItem>
                                  <SelectItem value="bone-density">Bone Density</SelectItem>
                                  <SelectItem value="angiogram">Angiogram</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="imaging.bodyPart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Body Part/Area</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter body part or area" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="imaging.finding"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Findings</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter imaging findings..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="imaging.date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Study Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="imaging.radiologist"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Radiologist</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter radiologist name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="imaging.impression"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Impression</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter radiologist impression..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full" onClick={addImaging}>
                          Add Imaging
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Imaging History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSearch className="w-5 h-5" />
                          Imaging History
                        </CardTitle>
                        <CardDescription>
                          Recent imaging studies
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Study Type</th>
                                <th className="text-left p-2">Body Part</th>
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No imaging recorded</td>
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

                {/* Prior Visits Inner Tab */}
                <TabsContent value="prior-visits" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Visit */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Add New Visit
                        </CardTitle>
                        <CardDescription>
                          Record prior visit information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="priorVisit.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Visit Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priorVisit.reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason for Visit</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter reason for visit" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priorVisit.diagnosis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Diagnosis</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter diagnosis" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priorVisit.treatment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Treatment</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter treatment provided..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priorVisit.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter provider name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priorVisit.notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter additional notes..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full" onClick={addPriorVisit}>
                          Add Visit
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Prior Visits History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Prior Visits History
                        </CardTitle>
                        <CardDescription>
                          Previous visit records
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Reason</th>
                                <th className="text-left p-2">Diagnosis</th>
                                <th className="text-left p-2">Provider</th>
                              </tr>
                            </thead>
                            <tbody>
                              {form.watch('priorVisit') && form.watch('priorVisit').length > 0 ? (
                                form.watch('priorVisit').map((visit: { date: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; reason: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; diagnosis: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; provider: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, idx: React.Key | null | undefined) => (
                                  <tr key={idx} className="border-b">
                                    <td className="p-2">{visit.date}</td>
                                    <td className="p-2">{visit.reason}</td>
                                    <td className="p-2">{visit.diagnosis}</td>
                                    <td className="p-2">{visit.provider}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr className="border-b">
                                  <td className="p-2 text-gray-500">No prior visits recorded</td>
                                  <td className="p-2 text-gray-500">--</td>
                                  <td className="p-2 text-gray-500">--</td>
                                  <td className="p-2 text-gray-500">--</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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

                {/* Clinical Notes Inner Tab */}
                <TabsContent value="clinical-notes" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Clinical Note */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Add New Clinical Note
                        </CardTitle>
                        <CardDescription>
                          Record clinical observations and notes
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="clinicalNote.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalNote.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note Type</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select note type"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="progress">Progress Note</SelectItem>
                                  <SelectItem value="assessment">Assessment</SelectItem>
                                  <SelectItem value="plan">Care Plan</SelectItem>
                                  <SelectItem value="discharge">Discharge Summary</SelectItem>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="procedure">Procedure Note</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalNote.title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter note title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalNote.content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Clinical Note</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter clinical note content..."
                                  rows={6}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalNote.author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter author name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full" onClick={addClinicNote}>
                          Add Note
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Clinical Notes History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Clinical Notes History
                        </CardTitle>
                        <CardDescription>
                          Previous clinical notes with date filtering
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <FormItem>
                            <FormLabel>Filter by Date</FormLabel>
                            <FormControl>
                              <Input type="date" />
                            </FormControl>
                          </FormItem>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Title</th>
                                <th className="text-left p-2">Author</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No clinical notes recorded</td>
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

                {/* Documents Inner Tab */}
                <TabsContent value="documents" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Documents */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileArchive className="w-5 h-5" />
                          Upload Documents
                        </CardTitle>
                        <CardDescription>
                          Upload medical documents and reports
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="document.title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter document title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="document.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Type</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select document type"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="medical-record">Medical Record</SelectItem>
                                  <SelectItem value="lab-report">Lab Report</SelectItem>
                                  <SelectItem value="imaging-report">Imaging Report</SelectItem>
                                  <SelectItem value="consent-form">Consent Form</SelectItem>
                                  <SelectItem value="insurance-form">Insurance Form</SelectItem>
                                  <SelectItem value="referral">Referral</SelectItem>
                                  <SelectItem value="prescription">Prescription</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="document.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="document.description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter document description..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileArchive className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                          <Button type="button" variant="outline" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                        <Button type="button" className="w-full" onClick={addClinicDocument}>
                          Add Document
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Previous Documents */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileArchive className="w-5 h-5" />
                          Previous Documents
                        </CardTitle>
                        <CardDescription>
                          Previously uploaded documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Title</th>
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No documents uploaded</td>
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

                {/* Faxes Inner Tab */}
                <TabsContent value="faxes" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Send Fax */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Send Fax
                        </CardTitle>
                        <CardDescription>
                          Send fax to healthcare providers or insurance companies
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fax.recipient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter recipient name/organization" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fax.faxNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fax Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter fax number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fax.subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter fax subject" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fax.message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter fax message..."
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                          <Button type="button" variant="outline" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                        <Button type="button" className="w-full">
                          Send Fax
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Previous Faxes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Previous Faxes
                        </CardTitle>
                        <CardDescription>
                          Previously sent faxes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Recipient</th>
                                <th className="text-left p-2">Subject</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No faxes sent</td>
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

                {/* Attachments Inner Tab */}
                <TabsContent value="attachments" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Document */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileArchive className="w-5 h-5" />
                          Upload Document
                        </CardTitle>
                        <CardDescription>
                          Upload files to patient's document library
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="attachment.title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter document title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="attachment.category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select category"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="medical">Medical</SelectItem>
                                  <SelectItem value="administrative">Administrative</SelectItem>
                                  <SelectItem value="financial">Financial</SelectItem>
                                  <SelectItem value="legal">Legal</SelectItem>
                                  <SelectItem value="correspondence">Correspondence</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="attachment.description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter document description..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <FileArchive className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">All file types (max 20MB)</p>
                          <Button type="button" variant="outline" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                        <Button type="button" className="w-full">
                          Upload Document
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Document Library */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileArchive className="w-5 h-5" />
                          Document Library
                        </CardTitle>
                        <CardDescription>
                          All uploaded documents and attachments
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <FormItem>
                            <FormLabel>Search Documents</FormLabel>
                            <FormControl>
                              <Input placeholder="Search by title or description" />
                            </FormControl>
                          </FormItem>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Title</th>
                                <th className="text-left p-2">Category</th>
                                <th className="text-left p-2">Upload Date</th>
                                <th className="text-left p-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No documents uploaded</td>
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

            {/* Billing & Finance Tab */}
            <TabsContent value="billing-finance" className="space-y-6">
              <Tabs defaultValue="payment-history" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                  <TabsTrigger value="claims">Claims</TabsTrigger>
                  <TabsTrigger value="statements">Statements</TabsTrigger>
                </TabsList>

                {/* Payment History Inner Tab */}
                <TabsContent value="payment-history" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Payment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Add New Payment
                        </CardTitle>
                        <CardDescription>
                          Record patient payments and transactions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="payment.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment.amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="Enter amount" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment.method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select payment method"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="credit-card">Credit Card</SelectItem>
                                  <SelectItem value="debit-card">Debit Card</SelectItem>
                                  <SelectItem value="check">Check</SelectItem>
                                  <SelectItem value="insurance">Insurance</SelectItem>
                                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Type</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select payment type"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="copay">Copay</SelectItem>
                                  <SelectItem value="deductible">Deductible</SelectItem>
                                  <SelectItem value="coinsurance">Coinsurance</SelectItem>
                                  <SelectItem value="self-pay">Self Pay</SelectItem>
                                  <SelectItem value="refund">Refund</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment.reference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reference Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter reference number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment.notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter payment notes..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full">
                          Add Payment
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Payment History
                        </CardTitle>
                        <CardDescription>
                          Complete payment transaction history
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Amount</th>
                                <th className="text-left p-2">Method</th>
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No payments recorded</td>
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

                {/* Claims Inner Tab */}
                <TabsContent value="claims" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add New Claim */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Add New Claim
                        </CardTitle>
                        <CardDescription>
                          Submit insurance claims for services
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="claim.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="claim.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter provider name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="claim.service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter service description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="claim.amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Billed Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="Enter amount" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="claim.insurance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Insurance</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                }} value={""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={field.value ? field.value  :  "Select insurance"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                    <SelectItem value="tertiary">Tertiary</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="claim.notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter claim notes..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full">
                          Submit Claim
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Claims History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Claims History
                        </CardTitle>
                        <CardDescription>
                          Submitted insurance claims
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Service</th>
                                <th className="text-left p-2">Amount</th>
                                <th className="text-left p-2">Insurance</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No claims submitted</td>
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

                {/* Statements Inner Tab */}
                <TabsContent value="statements" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Generate Statement */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Generate Statement
                        </CardTitle>
                        <CardDescription>
                          Create patient billing statements
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="statement.date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statement Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="statement.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statement Type</FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                              }} value={""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.value ? field.value  :  "Select statement type" } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="initial">Initial Statement</SelectItem>
                                  <SelectItem value="follow-up">Follow-up Statement</SelectItem>
                                  <SelectItem value="final">Final Notice</SelectItem>
                                  <SelectItem value="collection">Collection Notice</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="statement.amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Amount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="Enter total amount" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="statement.dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="statement.notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full p-2 border rounded-md"
                                  placeholder="Enter statement notes..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" className="w-full">
                          Generate Statement
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Statements History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Statements History
                        </CardTitle>
                        <CardDescription>
                          Generated billing statements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Amount</th>
                                <th className="text-left p-2">Due Date</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2 text-gray-500">No statements generated</td>
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
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Navigation and Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/patients')}
              >
                Cancel
              </Button>
              {!isFirstTab() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousTab}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {!isLastTab() && (
                <Button
                  type="button"
                  onClick={goToNextTab}
                >
                  Next
                </Button>
              )}
              {isLastTab() && (
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Patient'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPatientPage;