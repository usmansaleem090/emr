import React, { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Button } from '@/components/UI/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/UI/dialog';
import { Badge } from '@/components/UI/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { api } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';

interface ClinicLocation {
  id: number;
  clinicId: number;
  name: string;
  address: string;
  hours?: string;
  services: string[];
  providers: string[];
  createdAt: string;
}

interface LocationSelectorProps {
  currentUser: any;
  onLocationSelected: (location: ClinicLocation | null) => void;
  selectedLocation: ClinicLocation | null;
}

export function LocationSelector({ 
  currentUser, 
  onLocationSelected, 
  selectedLocation 
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.clinicId) {
      loadClinicLocations();
    }
  }, [currentUser?.clinicId]);

  const loadClinicLocations = async () => {
    if (!currentUser?.clinicId) return;
    
    try {
      setLoading(true);
      console.log('Loading locations for clinic:', currentUser.clinicId);
      const response = await api.get(`/api/clinics/${currentUser.clinicId}/locations`);
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      
      // Handle different response structures
      let savedLocations = [];
      if (response.data && Array.isArray(response.data.data)) {
        savedLocations = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        savedLocations = response.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        savedLocations = [];
      }
      
      console.log('Extracted locations array:', savedLocations);
      console.log('Locations array length:', savedLocations.length);
      
      // Convert database format to component format
      const convertedLocations = savedLocations.map((loc: any, index: number) => {
        console.log(`Converting location ${index}:`, loc);
        const converted = {
          id: loc.id,
          clinicId: loc.clinic_id,
          name: loc.name,
          address: loc.address,
          hours: loc.hours,
          services: Array.isArray(loc.services) ? loc.services : [],
          providers: Array.isArray(loc.providers) ? loc.providers : [],
          createdAt: loc.created_at || loc.createdAt
        };
        console.log(`Converted location ${index}:`, converted);
        return converted;
      });
      
      console.log('Converted locations:', convertedLocations);
      setLocations(convertedLocations);
      
      // Auto-select if only one location
      if (convertedLocations.length === 1 && !selectedLocation) {
        onLocationSelected(convertedLocations[0]);
      }
    } catch (error) {
      console.error('Failed to load clinic locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id.toString() === locationId);
    if (location) {
      onLocationSelected(location);
      setShowSelector(false);
      toast({
        title: "Location Selected",
        description: `Now working with: ${location.name}`,
      });
    }
  };

  const handleClearSelection = () => {
    onLocationSelected(null);
    toast({
      title: "Location Cleared",
      description: "No specific location selected",
    });
  };

  // Don't show selector if user doesn't have a clinic or is superadmin
  if (!currentUser?.clinicId || currentUser?.userType === 'SuperAdmin') {
    return null;
  }

  // Show loading state while fetching
  if (loading) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Loading clinic locations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no locations available (but only after loading is complete)
  // if (!loading && locations.length === 0) {
  //   return (
  //     <Card className="mb-4 border-orange-200 bg-orange-50">
  //       <CardContent className="pt-4">
  //         <div className="flex items-center gap-2 text-orange-600">
  //           <MapPin className="h-4 w-4" />
  //           <span className="text-sm">No clinic locations configured yet.</span>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <>
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {selectedLocation ? 'Working with:' : 'Select Location:'}
                </p>
                {selectedLocation ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {selectedLocation.name}
                    </Badge>
                    <span className="text-xs text-blue-600">{selectedLocation.address}</span>
                  </div>
                ) : (
                  <p className="text-xs text-blue-600">
                    Choose a location to continue working
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {selectedLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelector(true)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {selectedLocation ? 'Change' : 'Select'} Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSelector} onOpenChange={setShowSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Clinic Location
            </DialogTitle>
            <DialogDescription>
              Choose a location to work with. This will apply to all operations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {locations.map((location) => (
              <Card 
                key={location.id} 
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedLocation?.id === location.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleLocationSelect(location.id.toString())}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{location.name}</h4>
                        {selectedLocation?.id === location.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                      
                      {location.services.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {location.services.slice(0, 3).map((service, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {location.services.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{location.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}