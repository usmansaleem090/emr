import { useState, useEffect } from "react";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/apiClient";

interface ClinicInsuranceProps {
  clinicId: number;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function ClinicInsurance({ clinicId, formData, handleInputChange }: ClinicInsuranceProps) {
  const { toast } = useToast();
  const [availableInsurances, setAvailableInsurances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [insurancesLoaded, setInsurancesLoaded] = useState(false);

  // Load available insurances and clinic insurances on component mount
  useEffect(() => {
    if (clinicId && !insurancesLoaded) {
      loadInsurances();
    }
  }, [clinicId, insurancesLoaded]);

  // Debug: Log when availableInsurances changes
  useEffect(() => {
    console.log('Available insurances state changed:', availableInsurances);
  }, [availableInsurances]);

  const loadInsurances = async () => {
    if (!clinicId) return;

    setIsLoading(true);
    try {
      // Load available insurance providers
      const providersResponse = await api.get('/api/insurance-providers');
      console.log('Insurance providers response:', providersResponse.data);

      // Handle both response formats: direct array or {success, data} structure
      let insuranceData = [];
      console.log('Response type check:', typeof providersResponse.data, Array.isArray(providersResponse.data));

      if (Array.isArray(providersResponse.data)) {
        // Direct array response
        insuranceData = providersResponse.data;
        console.log('Using direct array response');
      } else if (providersResponse.data.success && providersResponse.data.data) {
        // Wrapped response structure
        insuranceData = providersResponse.data.data;
        console.log('Using wrapped response structure');
      } else {
        console.log('Unknown response format:', providersResponse.data);
      }

      console.log('Final insurance data:', insuranceData);
      console.log('Insurance data length:', insuranceData.length);

      if (insuranceData.length > 0) {
        setAvailableInsurances(insuranceData);
        console.log('Available insurances set:', insuranceData);
      } else {
        console.log('No insurance data to set');
      }

      // Load clinic insurances
      const clinicInsurancesResponse = await api.get(`/api/clinics/${clinicId}/insurances`);
      console.log('Clinic insurances response:', clinicInsurancesResponse.data);

      // Handle both response formats for clinic insurances
      let clinicInsuranceData = [];
      if (Array.isArray(clinicInsurancesResponse.data)) {
        clinicInsuranceData = clinicInsurancesResponse.data;
      } else if (clinicInsurancesResponse.data.success && clinicInsurancesResponse.data.data) {
        clinicInsuranceData = clinicInsurancesResponse.data.data;
      }

      if (clinicInsuranceData.length > 0) {
        const insuranceNames = clinicInsuranceData.map((ci: any) => ci.insurance?.name || ci.name);
        handleInputChange('acceptedInsurances', insuranceNames);
        console.log('Clinic insurance names set:', insuranceNames);
      }

      setInsurancesLoaded(true);

    } catch (error: any) {
      console.error('Error loading insurances:', error);
      // Don't show error toast if insurances don't exist yet (404 is expected for new clinics)

    } finally {
      setIsLoading(false);
    }
  };

  const saveInsurances = async () => {
    if (!clinicId) return;

    setIsSaving(true);
    try {
      const insurancesData = {
        insurances: formData.acceptedInsurances || []
      };

      // Always use POST - backend will handle create vs update
      const response = await api.post(`/api/clinics/${clinicId}/insurances`, insurancesData);

      if (response.success) {
        toast({
          title: "Insurances saved",
          description: "Clinic specialties saved successfully!",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
        });
        setInsurancesLoaded(true);
      }
    } catch (error: any) {
      console.error('Error saving clinic insurances:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save clinic insurances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addInsurance = (insurance: string) => {
    // Skip if the value is empty
    if (!insurance || insurance.trim() === '') return;

    const current = formData.acceptedInsurances || [];
    if (!current.includes(insurance)) {
      handleInputChange('acceptedInsurances', [...current, insurance]);
    }
  };

  const removeInsurance = (insurance: string) => {
    const current = formData.acceptedInsurances || [];
    handleInputChange('acceptedInsurances', current.filter((ins: string) => ins !== insurance));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading clinic insurances...</span>
      </div>
    );
  }

  // console.log('select insurance', formData.acceptedInsurances);

  return (
    <div className="space-y-6">

      {/* Insurance Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
           <p className="text-sm text-muted-foreground">
            Select the insurance providers your clinic accepts
          </p>
          <div className="border-b pb-4 flex items-center justify-between">
            <div className="w-1/4">
              <Select onValueChange={addInsurance} disabled={availableInsurances.length === 0} defaultValue="">
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableInsurances.length === 0
                        ? "No insurance providers available"
                        : formData.acceptedInsurances?.length > 0
                          ? formData.acceptedInsurances[formData.acceptedInsurances.length - 1]
                          : "Select accepted insurances"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableInsurances.length > 0 ? (
                    availableInsurances
                      .filter(insurance => !(formData.acceptedInsurances || []).includes(insurance.name))
                      .map(insurance => (
                        <SelectItem key={insurance.id} value={insurance.name}>
                          {insurance.name}
                        </SelectItem>
                      ))
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={saveInsurances}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Insurances"}
            </Button>
          </div>
          {/* {formData.practiceSpecialties.length > 0 ? formData.practiceSpecialties[formData.practiceSpecialties.length - 1] : 'Select specialties'} */}
        </div>

        {/* Selected Insurances */}
        {formData.acceptedInsurances && formData.acceptedInsurances.length > 0 ? (
          <div className="space-y-2">
            <Label>Selected Insurances ({formData.acceptedInsurances.length})</Label>
            <div className="flex flex-wrap gap-2">
              {formData.acceptedInsurances.map((insurance: string) => (
                <Badge key={insurance} variant="secondary" className="flex items-center gap-1">
                  {insurance}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeInsurance(insurance)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No insurances selected</p>
            <p className="text-sm">Select insurance providers from the dropdown above</p>
          </div>
        )}
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Insurance Management</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Select all insurance providers your clinic accepts</p>
            <p>• Patients will be able to see which insurances you accept</p>
            <p>• You can update this list at any time</p>
            <p>• The first insurance selected will be marked as primary</p>
          </div>
        </div>
      </div>
    </div>
  );
}