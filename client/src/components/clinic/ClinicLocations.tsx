import { useState, useEffect } from "react";
import { api } from "@/utils/apiClient";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";

import { Plus, X, MapPin, Clock, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ClinicLocation } from "@/types/clinic";

interface ClinicLocationsProps {
  clinicId: number;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function ClinicLocations({ clinicId, formData, handleInputChange }: ClinicLocationsProps) {
  const { toast } = useToast();
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (clinicId && !locationsLoaded) {
      loadClinicLocations();
    }
  }, [clinicId, locationsLoaded]);

  const loadClinicLocations = async () => {
    if (!clinicId) return;
    
    try {
      setIsLoading(true);
      const response = await api.get(`/api/clinics/${clinicId}/locations`);
      console.log('Raw locations response:', response.data);
      
      // Handle both response formats: direct array or {data: [...]} structure
      let savedLocations = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        savedLocations = response.data;
        console.log('Using direct array response');
             } else if (response.data) {
         // Wrapped response structure
         savedLocations = response.data;
         console.log('Using wrapped response structure');
      } else {
        console.log('Unknown response format:', response.data);
        savedLocations = [];
      }
      
      console.log('Loaded clinic locations:', savedLocations);
      
      // Convert database format to component format
      const convertedLocations = savedLocations.map((loc: any) => ({
        id: loc.id,
        clinicId: loc.clinicId || loc.clinic_id,
        name: loc.name,
        address: loc.address,
        hours: loc.hours,
        createdAt: loc.createdAt || loc.created_at
      }));
      
      console.log('Converted locations:', convertedLocations);
      setLocations(convertedLocations);
      setLocationsLoaded(true);
    } catch (error) {
      console.log('No locations found for clinic', error);
      setLocations([]);
      setLocationsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocations = async () => {
    if (!clinicId) return;
    
    try {
      setIsSaving(true);
      const locationsData = locations.map(location => ({
        name: location.name,
        address: location.address,
        hours: location.hours
      }));

      await api.post(`/api/clinics/${clinicId}/locations`, { locations: locationsData });
      
      toast({
        title: "Success",
        description: "Clinic locations saved successfully",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save clinic locations",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    hours: ''
  });

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address) {
      const location: ClinicLocation = {
        id: Date.now(), // Temporary ID for new locations
        clinicId: clinicId,
        name: newLocation.name,
        address: newLocation.address,
        hours: newLocation.hours || undefined,
        createdAt: new Date().toISOString()
      };
      
      setLocations([...locations, location]);
      setNewLocation({
        name: '',
        address: '',
        hours: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading locations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex items-center justify-between">
        <Label className="text-lg font-semibold">Clinic Locations</Label>
        <Button onClick={saveLocations} disabled={isSaving} className="flex items-center gap-2">
          {isSaving ? (<Loader2 className="w-4 h-4 animate-spin" />) : (<Save className="w-4 h-4" />)}
          {isSaving ? "Saving..." : "Save Locations"}
        </Button>
      </div>
       
       <div className="flex justify-end">
         <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 "
        >
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
       </div>
      

      {/* Display locations count */}
      <p className="text-sm text-muted-foreground">Found {locations.length} location(s)</p>
      
      {/* Existing Locations */}
      {locations.map((location, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                {location.name}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLocation(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{location.address}</p>
            
            {location.hours && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {location.hours}
              </div>
            )}


          </CardContent>
        </Card>
      ))}

      {/* Show empty state if no locations */}
      {locations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No locations added yet</p>
          <p className="text-sm">Click "Add Location" to create your first location</p>
        </div>
      )}

      {/* Add New Location Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add New Location
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name *</Label>
                <Input
                  id="locationName"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  placeholder="Main Office, Branch 1, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationHours">Operating Hours</Label>
                <Input
                  id="locationHours"
                  value={newLocation.hours}
                  onChange={(e) => setNewLocation({...newLocation, hours: e.target.value})}
                  placeholder="Mon-Fri 9AM-5PM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationAddress">Address *</Label>
              <Input
                id="locationAddress"
                value={newLocation.address}
                onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                placeholder="123 Main St, City, State 12345"
              />
            </div>



            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddLocation}
                disabled={!newLocation.name || !newLocation.address}
              >
                Add Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Management Information */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Location Management</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Add multiple locations for your clinic</p>
            <p>• Each location can have different services and operating hours</p>
            <p>• Locations will be available for patient booking</p>
            <p>• You can update location information at any time</p>
          </div>
        </div>
      </div>
    </div>
  );
}