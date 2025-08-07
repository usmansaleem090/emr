import { useState, useEffect } from "react";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { PRACTICE_SPECIALTIES } from "@/types/clinic";
import { X, Save, Loader2 } from "lucide-react";
import { api } from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";

interface ClinicSpecialtiesProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  clinicId?: number | null;
}

interface Specialty {
  id: number;
  name: string;
  description?: string;
}

export function ClinicSpecialties({ formData, handleInputChange, clinicId }: ClinicSpecialtiesProps) {
  const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load available specialties from API
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/specialties");
        setAvailableSpecialties(response.data || []);
      } catch (error) {
        console.error("Failed to load specialties:", error);
        // Fallback to hardcoded specialties if API fails
        setAvailableSpecialties(PRACTICE_SPECIALTIES.map((name, index) => ({ id: index + 1, name })));
      } finally {
        setIsLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  // Load existing clinic specialties if clinicId is provided
  useEffect(() => {
    const loadClinicSpecialties = async () => {
      if (!clinicId) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/api/clinics/${clinicId}/specialties`);
        const savedSpecialties = response.data || [];
        // Extract specialty names from the response structure
        const specialtyNames = savedSpecialties.map((s: any) => s.specialty?.name || s.name);
        handleInputChange('practiceSpecialties', specialtyNames);
      } catch (error) {
        console.error("Failed to load clinic specialties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClinicSpecialties();
  }, [clinicId]); // Removed handleInputChange from dependencies

  const addSpecialty = (specialtyName: string) => {
    if (!formData.practiceSpecialties.includes(specialtyName)) {
      handleInputChange('practiceSpecialties', [...formData.practiceSpecialties, specialtyName]);
    }
  };

  const removeSpecialty = (specialtyName: string) => {
    handleInputChange('practiceSpecialties',
      formData.practiceSpecialties.filter((s: string) => s !== specialtyName)
    );
  };

  const saveSpecialties = async () => {
    if (!clinicId) {
      toast({
        title: "Error",
        description: "Clinic ID is required to save specialties",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const specialtiesData = {
        clinicId: clinicId,
        specialties: formData.practiceSpecialties
      };

      await api.post(`/api/clinics/${clinicId}/specialties`, specialtiesData);

      toast({
        title: "Success",
        description: "Clinic specialties saved successfully!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      });
    } catch (error: any) {
      console.error("Failed to save specialties:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save specialties",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading specialties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="border-b pb-4 flex items-center justify-between">
           <div className="w-1/3">
              <Select onValueChange={addSpecialty}>
          <SelectTrigger>
            {formData.practiceSpecialties.length > 0 ? formData.practiceSpecialties[formData.practiceSpecialties.length - 1] : 'Select specialties'}
          </SelectTrigger>
          <SelectContent>
            {availableSpecialties.map(specialty => (
              <SelectItem key={specialty.id} value={specialty.name}>
                {specialty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
           </div>
          <Button
            type="button"
            onClick={saveSpecialties}
            disabled={isSaving || !clinicId || formData.practiceSpecialties.length === 0}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Specialties
              </>
            )}
          </Button>
        </div>
      </div>

      {formData.practiceSpecialties.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Specialties ({formData.practiceSpecialties.length})</Label>
          <div className="flex flex-wrap gap-2">
            {formData.practiceSpecialties.map((specialty: string) => (
              <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                {specialty}
                <Button
                  type="button"
                  variant="ghost"
                  
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeSpecialty(specialty)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {formData.practiceSpecialties.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No specialties selected yet.</p>
          <p className="text-sm">Select specialties from the dropdown above to get started.</p>
        </div>
      )}

    </div>
  );
}