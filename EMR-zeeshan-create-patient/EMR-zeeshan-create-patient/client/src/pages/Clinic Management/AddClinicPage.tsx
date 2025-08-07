import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import {
  ArrowLeft,
  Building2,
  Stethoscope,
  Palette,
  Settings,
  CreditCard,
  MapPin,
  Grid3x3,
  FileText,
  Save,
  Loader2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";
import type { ClinicFormData } from "@/types/clinic";
import { TIME_ZONES } from "@/types/clinic";

// Import all the clinic components
import { ClinicSpecialties } from "@/components/clinic/ClinicSpecialties";
import { ClinicBranding } from "@/components/clinic/ClinicBranding";
import { ClinicSettings } from "@/components/clinic/ClinicSettings";
import { ClinicInsurance } from "@/components/clinic/ClinicInsurance";
import { ClinicLocations } from "@/components/clinic/ClinicLocations";
import { ClinicModules } from "@/components/clinic/ClinicModules";
import { ClinicDocuments } from "@/components/clinic/ClinicDocuments";
import { ClinicServices } from "@/components/clinic/ClinicServices";
import { ClinicLocationScheduling } from "@/components/clinic/ClinicLocationScheduling";
import { SimpleDropdown } from "@/components/UI/SimpleDropdown";

export default function AddClinicPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("specialties");
  const [isCreatingClinic, setIsCreatingClinic] = useState(false);
  const [isClinicSaved, setIsClinicSaved] = useState(false);
  const [savedClinicId, setSavedClinicId] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});

  // Updated form data structure to match new backend schema
  const [formData, setFormData] = useState<ClinicFormData>({
    // Basic Clinic Info (simplified - moved settings to separate table)
    clinicName: "",
    address: "",
    phone: "",
    clinicEmail: "",
    type: "single" as 'single' | 'group',
    groupNpi: "",
    taxId: "",
    timeZone: "America/New_York",

    // Practice Specialties
    practiceSpecialties: [],

    // Branding
    practiceLogo: "",
    primaryColor: "#0066cc",

    // Settings (will be saved to clinic_settings table)
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

  const handleInputChange = (field: string, value: any) => {
    console.log(`handleInputChange called: field=${field}, value=${value}`);
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log(`Updated formData for ${field}:`, newData);
      return newData;
    });
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateClinicForm = () => {
    const newErrors: any = {};
    if (!formData.clinicName.trim())
      newErrors.clinicName = "Clinic name is required";
    if (!formData.address.trim())
      newErrors.address = "Address is required";
    if (!formData.phone.trim())
      newErrors.phone = "Phone is required";
    if (!formData.clinicEmail.trim())
      newErrors.clinicEmail = "Clinic email is required";
    if (!formData.type)
      newErrors.type = "Clinic type is required";
    if (!formData.timeZone)
      newErrors.timeZone = "Time zone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === "specialties") {
      setActiveTab("branding");
    } else if (activeTab === "branding") {
      setActiveTab("settings");
    } else if (activeTab === "settings") {
      setActiveTab("insurance");
    } else if (activeTab === "insurance") {
      setActiveTab("locations");
    } else if (activeTab === "locations") {
      setActiveTab("documents");
    } else if (activeTab === "documents") {
      setActiveTab("modules");
    }
  };

  const handleBack = () => {
    if (activeTab === "branding") setActiveTab("specialties");
    else if (activeTab === "settings") setActiveTab("branding");
    else if (activeTab === "insurance") setActiveTab("settings");
    else if (activeTab === "locations") setActiveTab("insurance");
    else if (activeTab === "documents") setActiveTab("locations");
    else if (activeTab === "modules") setActiveTab("documents");
  };

  const createClinic = async () => {
    if (!validateClinicForm()) {
      return;
    }

    try {
      setIsCreatingClinic(true);

      // Create clinic with basic info only
      const clinicData = {
        name: formData.clinicName,
        address: formData.address,
        phone: formData.phone,
        email: formData.clinicEmail, // Backend expects 'email', not 'clinicEmail'
        type: formData.type,
        groupNpi: formData.groupNpi || "",
        taxId: formData.taxId || "",
        timeZone: formData.timeZone,
      };

      const response = await api.post("/api/clinics", clinicData);
      const clinicId = response.data.id;
      setSavedClinicId(clinicId);

      // Create clinic settings
      // const settingsData = {
      //   clinicId: clinicId,
      //   practiceLogo: formData.practiceLogo,
      //   primaryColor: formData.primaryColor,
      //   enableSmsNotifications: formData.enableSmsNotifications,
      //   enableVoiceCalls: formData.enableVoiceCalls,
      //   reminderTimeHours: formData.reminderTimeHours,
      //   reminderTimeMinutes: formData.reminderTimeMinutes,
      //   acceptedInsurances: formData.acceptedInsurances,
      //   enableOnlinePayments: formData.enableOnlinePayments,
      //   stripePublicKey: formData.stripePublicKey,
      // };

      // await api.post(`/api/clinics/${clinicId}/settings`, settingsData);

      // setIsClinicSaved(true);
      toast({
        title: "Success",
        description: "Clinic created successfully! Redirecting to edit page...",
        variant: "default",
        className:
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      });

      // Navigate to the edit page after successful creation
      setTimeout(() => {
        setLocation(`/clinics/edit/${clinicId}?mode=setup`);
      }, 1500); // Small delay to show the success message

    } catch (error: any) {
      console.error('Error creating clinic:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create clinic",
        variant: "destructive",
      });
    } finally {
      setIsCreatingClinic(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClinic();
  };

  const tabConfig = [
    { id: "specialties", label: "Specialties", icon: Stethoscope },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "insurance", label: "Insurance", icon: CreditCard },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "services", label: "Services", icon: Stethoscope },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "scheduling", label: "Scheduling", icon: Clock },
    { id: "modules", label: "Modules", icon: Grid3x3 },
  ];

  return (
    <div className="min-h-screen px-2">
      <div className="flex items-center mb-6">
        <Button
          onClick={() => setLocation("/clinics")}
          className="px-3 py-0.5 h-8 bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-3 h-3" />
        </Button>


        <h1 className="text-3xl ms-4 font-bold dark:text-gray-900 tracking-tight mb-1">Add New Clinic</h1>
      </div>

      {/* Clinic Basic Info Form - Always visible at the top */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name *</Label>
                <Input
                  id="clinicName"
                  value={formData.clinicName}
                  onChange={(e) =>
                    handleInputChange("clinicName", e.target.value)
                  }
                  placeholder="Enter clinic name"
                  className={errors.clinicName ? "border-red-500" : ""}
                  required
                />
                {errors.clinicName && (
                  <p className="text-sm text-red-500">{errors.clinicName}</p>
                )}
              </div>

              <SimpleDropdown
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                options={[
                  { value: "single", label: "Single Practice" },
                  { value: "group", label: "Group Practice" }
                ]}
                placeholder="Select clinic type"
                error={errors.type}
                label="Clinic Type *"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  handleInputChange("address", e.target.value)
                }
                placeholder="123 Main St, City, State 12345"
                className={errors.address ? "border-red-500" : ""}
                required
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                  placeholder="(555) 123-4567"
                  className={errors.phone ? "border-red-500" : ""}
                  required
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Clinic Email *</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  value={formData.clinicEmail}
                  onChange={(e) =>
                    handleInputChange("clinicEmail", e.target.value)
                  }
                  placeholder="contact@clinic.com"
                  className={errors.clinicEmail ? "border-red-500" : ""}
                  required
                />
                {errors.clinicEmail && (
                  <p className="text-sm text-red-500">{errors.clinicEmail}</p>
                )}
              </div>


              <SimpleDropdown
                value={formData.timeZone}
                onValueChange={(value) => handleInputChange("timeZone", value)}
                options={TIME_ZONES.map(tz => ({
                  value: tz,
                  label: tz.replace('America/', '').replace('_', ' ')
                }))}
                placeholder="Select time zone"
                error={errors.timeZone}
                label="Time Zone *"
              />

            </div>

            {formData.type === 'group' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupNpi">Group NPI</Label>
                  <Input
                    id="groupNpi"
                    value={formData.groupNpi}
                    onChange={(e) =>
                      handleInputChange("groupNpi", e.target.value)
                    }
                    placeholder="1234567890"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) =>
                      handleInputChange("taxId", e.target.value)
                    }
                    placeholder="12-3456789"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={isCreatingClinic}
                className="min-w-[120px]"
              >
                {isCreatingClinic ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Clinic
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Configuration Tabs - Only visible after clinic is saved */}
      {isClinicSaved && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
            <CardDescription>
              Configure additional settings and features for your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
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
                  clinicId={savedClinicId}
                />
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="mt-6">
                <ClinicBranding
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <ClinicSettings
                  clinicId={savedClinicId || 0}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </TabsContent>

              {/* Insurance Tab */}
              <TabsContent value="insurance" className="mt-6">
                <ClinicInsurance
                  clinicId={savedClinicId || 0}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </TabsContent>

              {/* Locations Tab */}
              <TabsContent value="locations" className="mt-6">
                <ClinicLocations
                  clinicId={savedClinicId || 0}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6">
                <ClinicServices clinicId={savedClinicId || 0} />
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-6">
                <ClinicDocuments clinicId={savedClinicId} />
              </TabsContent>

              {/* Scheduling Tab */}
              <TabsContent value="scheduling" className="mt-6">
                {savedClinicId ? (
                  <ClinicLocationScheduling clinicId={savedClinicId} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Please save the clinic first to configure scheduling</p>
                  </div>
                )}
              </TabsContent>

              {/* Modules Tab */}
              <TabsContent value="modules" className="mt-6">
                <ClinicModules
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

                {/* Hide Next button on specialties tab since it has its own Save button */}
                {activeTab !== "specialties" && (
                  <Button type="button" onClick={handleNext} disabled={activeTab === "modules"}>
                    Next
                  </Button>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
