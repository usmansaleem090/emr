import { useState, useEffect } from "react";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Checkbox } from "@/components/UI/checkbox";
import { api } from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, FileText, Calendar, Shield } from "lucide-react";

interface Module {
  id: number;
  name: string;
  description?: string;
}

interface ClinicModulesProps {
  clinicId?: number;
  selectedModuleIds: number[];
  onModulesChange: (moduleIds: number[]) => void;
}

export function ClinicModules({ clinicId, selectedModuleIds, onModulesChange }: ClinicModulesProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadClinicModules();
    }
  }, [clinicId]);

  const loadClinicModules = async () => {
    if (!clinicId) return;
    
    try {
      const response = await api.get(`/api/clinics/${clinicId}/modules`);
      const assignedModules = response.data.data || [];
      // Extract module IDs from assigned modules
      const moduleIds = assignedModules.map((m: any) => m.module_id);
      console.log('Loaded clinic modules:', assignedModules, 'Module IDs:', moduleIds);
      onModulesChange(moduleIds);
    } catch (error) {
      // No modules assigned yet, that's okay
      console.log('No modules found for clinic');
      onModulesChange([]);
    }
  };

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/modules');
      setModules(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load modules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: number, checked: boolean) => {
    if (checked) {
      onModulesChange([...selectedModuleIds, moduleId]);
    } else {
      onModulesChange(selectedModuleIds.filter(id => id !== moduleId));
    }
  };

  const getModuleIcon = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    if (name.includes('user') || name.includes('staff')) return Users;
    if (name.includes('patient') || name.includes('medical')) return FileText;
    if (name.includes('appointment') || name.includes('schedule')) return Calendar;
    if (name.includes('setting') || name.includes('admin')) return Settings;
    if (name.includes('security') || name.includes('role')) return Shield;
    return Settings;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Module Assignment</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Module Assignment
        </CardTitle>
        <CardDescription>
          Select which modules this clinic should have access to. This determines what features and functionality will be available to clinic users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {selectedModuleIds.length} of {modules.length} modules selected
            </span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {Math.round((selectedModuleIds.length / Math.max(modules.length, 1)) * 100)}% Complete
          </Badge>
        </div>
        
        {modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
            const IconComponent = getModuleIcon(module.name);
            const isSelected = selectedModuleIds.includes(module.id);
          
          return (
            <Card key={module.id} className={`cursor-pointer transition-colors ${
              isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{module.name}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No modules available</p>
          <p className="text-sm">Contact support to enable modules for this clinic</p>
        </div>
      )}

      {selectedModuleIds.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Selected Modules: {selectedModuleIds.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onModulesChange([])}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  );
}