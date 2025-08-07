import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Progress } from "@/components/UI/progress";

import {
  ArrowLeft,
  Stethoscope,
  Settings,
  CreditCard,
  MapPin,
  Grid3x3,
  FileText,
  Save,
  Loader2,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import type { ClinicFormData } from "@/types/clinic";

// Import all the clinic components
import { ClinicSpecialties } from "@/components/clinic/ClinicSpecialties";
import { ClinicSettings } from "@/components/clinic/ClinicSettings";
import { ClinicInsurance } from "@/components/clinic/ClinicInsurance";
import { ClinicLocations } from "@/components/clinic/ClinicLocations";
import { ClinicModules } from "@/components/clinic/ClinicModules";
import { ClinicDocuments } from "@/components/clinic/ClinicDocuments";
import { ClinicServices } from "@/components/clinic/ClinicServices";
import { ClinicLocationScheduling } from "@/components/clinic/ClinicLocationScheduling";
import { ClinicUsers } from "@/components/clinic/ClinicUsers";

interface ClinicData {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  groupNpi?: string;
  taxId?: string;
  timeZone?: string;
  practiceSpecialties?: string[];
  practiceLogo?: string;
  primaryColor?: string;
  enableSmsNotifications?: boolean;
  enableVoiceCalls?: boolean;
  reminderTimeHours?: number;
  reminderTimeMinutes?: number;
  acceptedInsurances?: string[];
  enableOnlinePayments?: boolean;
  stripePublicKey?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    status: string;
  };
}

interface EditClinicPageProps {
  mode?: 'edit' | 'setup' | 'complete';
  title?: string;
  subtitle?: string;
}

export default function EditClinicPage({ title, subtitle }: EditClinicPageProps) {
  const [, setLocation] = useLocation();
  const params = useParams();
  const clinicId = params.id ? parseInt(params.id) : 0;

  // Get mode from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') as 'edit' | 'setup' | 'complete' || 'edit';
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("specialties");
  const [isUpdatingClinic, setIsUpdatingClinic] = useState(false);
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState<ClinicFormData>({
    // Basic Clinic Info
    clinicName: "",
    address: "",
    phone: "",
    clinicEmail: "",

    // Extended Fields
    type: "single",
    groupNpi: "",
    taxId: "",
    timeZone: "America/New_York",

    // Practice Specialties
    practiceSpecialties: [],

    // Branding
    practiceLogo: "",
    primaryColor: "#0066cc",

    // Settings
    enableSmsNotifications: true,
    enableVoiceCalls: false,
    reminderTimeHours: 24,
    reminderTimeMinutes: 0,

    // Payment & Insurance
    acceptedInsurances: [],
    enableOnlinePayments: false,
    stripePublicKey: "",
  });

  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [clinic, setClinic] = useState<ClinicData | null>(null);

  // Progress calculation
  const calculateProgress = () => {
    const totalTabs = tabConfig.length;
    const currentTabIndex = tabConfig.findIndex(tab => tab.id === activeTab);
    return Math.round(((currentTabIndex + 1) / totalTabs) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'text-red-500';
    if (progress < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress < 30) return 'Getting Started';
    if (progress < 70) return 'In Progress';
    return 'Almost Complete';
  };

  const getDefaultTitle = () => {
    switch (mode) {
      case 'setup':
        return 'Complete Clinic Setup';
      case 'complete':
        return 'Finalize Clinic Configuration';
      default:
        return 'Edit Clinic';
    }
  };

  const getDefaultSubtitle = () => {
    switch (mode) {
      case 'setup':
        return 'Complete the setup process to activate your clinic';
      case 'complete':
        return 'Review and finalize your clinic configuration';
      default:
        return 'Update clinic profile with all settings and configurations';
    }
  };

  useEffect(() => {
    console.log(
      "Selected modules state changed:",
      selectedModuleIds.length,
      selectedModuleIds,
    );
  }, [selectedModuleIds]);

  useEffect(() => {
    if (clinicId) {
      loadClinic();
    }
  }, [clinicId]);

  const loadClinic = async () => {
    if (!clinicId) return;

    try {
      setIsLoadingClinic(true);
      const response = await api.get(`/api/clinics/${clinicId}`);
      const clinicData = response.data;
      setClinic(clinicData);

      // Populate form with clinic data
      setFormData({
        clinicName: clinicData.name || "",
        address: clinicData.address || "",
        phone: clinicData.phone || "",
        clinicEmail: clinicData.email || "",
        type: clinicData.type || "single",
        groupNpi: clinicData.groupNpi || "",
        taxId: clinicData.taxId || "",
        timeZone: clinicData.timeZone || "America/New_York",
        practiceSpecialties: clinicData.practiceSpecialties || [],
        practiceLogo: clinicData.practiceLogo || "",
        primaryColor: clinicData.primaryColor || "#0066cc",
        enableSmsNotifications: clinicData.enableSmsNotifications ?? true,
        enableVoiceCalls: clinicData.enableVoiceCalls ?? false,
        reminderTimeHours: clinicData.reminderTimeHours ?? 24,
        reminderTimeMinutes: clinicData.reminderTimeMinutes ?? 0,
        acceptedInsurances: clinicData.acceptedInsurances || [],
        enableOnlinePayments: clinicData.enableOnlinePayments ?? false,
        stripePublicKey: clinicData.stripePublicKey || "",
      });

      // Note: Locations and modules are loaded by their respective components
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load clinic data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClinic(false);
    }
  };

  // const handleInputChange = (field: string, value: any) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  //   if (errors[field]) {
  //     setErrors((prev: any) => ({ ...prev, [field]: "" }));
  //   }
  // };

  const handleInputChange = (field: string, value: any) => {
    if (field === "practiceSpecialties") {
      // Ensure value is an array and filter out empty or duplicate entries
      const newSpecialties = Array.isArray(value)
        ? value.filter((specialty) => specialty && !formData.practiceSpecialties.includes(specialty))
        : [value].filter((specialty) => specialty && !formData.practiceSpecialties.includes(specialty));
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev.practiceSpecialties, ...newSpecialties],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateClinicTab = () => {
    const newErrors: any = {};
    if (!formData.clinicName.trim())
      newErrors.clinicName = "Clinic name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === "specialties") {
      setActiveTab("settings");
    } else if (activeTab === "settings") {
      setActiveTab("insurance");
    } else if (activeTab === "insurance") {
      setActiveTab("locations");
    } else if (activeTab === "locations") {
      setActiveTab("services");
    } else if (activeTab === "services") {
      setActiveTab("scheduling");
    } else if (activeTab === "scheduling") {
      setActiveTab("users");
    } else if (activeTab === "users") {
      setActiveTab("modules");
    }
  };

  const handleBack = () => {
    if (activeTab === "specialties") setActiveTab("specialties");
    else if (activeTab === "settings") setActiveTab("specialties");
    else if (activeTab === "insurance") setActiveTab("settings");
    else if (activeTab === "locations") setActiveTab("insurance");
    else if (activeTab === "services") setActiveTab("locations");
    else if (activeTab === "scheduling") setActiveTab("services");
    else if (activeTab === "users") setActiveTab("scheduling");
    else if (activeTab === "modules") setActiveTab("users");
  };

  const updateClinic = async () => {
    if (!validateClinicTab()) {
      setActiveTab("specialties");
      return;
    }

    try {
      setIsUpdatingClinic(true);

      // Update clinic with all the new fields
      const clinicData = {
        ...formData,
        moduleIds: selectedModuleIds,
      };

      await api.put(`/api/clinics/${clinicId}`, clinicData);

      // Always save modules (even if empty to clear previous data)
      await api.post(`/api/clinics/${clinicId}/modules`, {
        moduleIds: selectedModuleIds,
      });

      toast({
        title: "Success",
        description: "Clinic updated successfully",
        variant: "default",
        className:
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      });

      setLocation("/clinics");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update clinic",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingClinic(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinic();
  };

  const tabConfig = [
    { id: "specialties", label: "Specialties", icon: Stethoscope },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "insurance", label: "Insurance", icon: CreditCard },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "services", label: "Services", icon: Stethoscope },
    { id: "scheduling", label: "Scheduling", icon: Clock },
    { id: "users", label: "Users", icon: Users },
    // { id: "documents", label: "Documents", icon: FileText },
    { id: "modules", label: "Modules", icon: Grid3x3 },
  ];

  if (isLoadingClinic) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2">
      <div className="flex items-center mb-6">
        <Button
          onClick={() => setLocation("/clinics")}
          className="px-3 py-0.5 h-8 bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-3 h-3" />
        </Button>


        <h1 className="text-3xl ms-4 font-bold dark:text-gray-900 tracking-tight mb-1">Edit Clinic</h1>
      </div>

      {/* Progress Bar */}
      {mode === 'setup' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Setup Progress
            </span>
            <span className="text-sm font-medium text-blue-600">
              {calculateProgress()}% Complete
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      )}

      {/* <form onSubmit={handleSubmit}> */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8 gap-2">
              {tabConfig.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>



            {/* Specialties Tab */}
            <TabsContent value="specialties" className="mt-6">
              <ClinicSpecialties
                formData={formData}
                handleInputChange={handleInputChange}
                clinicId={clinicId}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <ClinicSettings
                clinicId={clinicId}
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            {/* Insurance Tab */}
            <TabsContent value="insurance" className="mt-6">
              <ClinicInsurance
                clinicId={clinicId}
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="mt-6">
              <ClinicLocations
                clinicId={clinicId}
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-6">
              <ClinicServices clinicId={clinicId} clinicName={formData.clinicName} />
            </TabsContent>

            {/* Scheduling Tab */}
            <TabsContent value="scheduling" className="mt-6">
              <ClinicLocationScheduling clinicId={clinicId} />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <ClinicUsers clinicId={clinicId} />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <ClinicDocuments clinicId={clinicId} clinicName={formData.clinicName} />
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules" className="mt-6">
              <ClinicModules
                clinicId={clinicId}
                selectedModuleIds={selectedModuleIds}
                onModulesChange={setSelectedModuleIds}
              />
            </TabsContent>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={activeTab === "specialties"}
              >
                Back
              </Button>

              {activeTab === "modules" ? (
                <Button
                  type="submit"
                  disabled={isUpdatingClinic}
                  className="min-w-[120px]"
                >
                  {isUpdatingClinic ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Clinic
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      {/* </form> */}
    </div>
  );
}


