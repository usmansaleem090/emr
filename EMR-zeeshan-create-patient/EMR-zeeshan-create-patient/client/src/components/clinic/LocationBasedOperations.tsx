import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { MapPin, Users, Calendar, FileText } from 'lucide-react';

interface LocationBasedOperationsProps {
  children: React.ReactNode;
  requireLocation?: boolean;
}

export function LocationBasedOperations({ 
  children, 
  requireLocation = false 
}: LocationBasedOperationsProps) {
  const { selectedLocation } = useLocation();

  if (requireLocation && !selectedLocation) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-amber-900 mb-1">
              Location Selection Required
            </h3>
            <p className="text-sm text-amber-700">
              Please select a clinic location above to continue with this operation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {selectedLocation && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Operating at: {selectedLocation.name}
                  </p>
                  <p className="text-xs text-green-600">{selectedLocation.address}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedLocation.services.length > 0 && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {selectedLocation.services.length} Services
                  </Badge>
                )}
                {selectedLocation.providers.length > 0 && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {selectedLocation.providers.length} Providers
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {children}
    </div>
  );
}

// Higher-order component to wrap pages that need location context
export function withLocationContext<P extends object>(
  Component: React.ComponentType<P>, 
  requireLocation = false
) {
  return function LocationAwareComponent(props: P) {
    return (
      <LocationBasedOperations requireLocation={requireLocation}>
        <Component {...props} />
      </LocationBasedOperations>
    );
  };
}

// Hook for filtering data by selected location
export function useLocationFilter() {
  const { selectedLocation } = useLocation();

  const filterByLocation = <T extends { locationId?: number; clinicLocationId?: number }>(
    items: T[]
  ): T[] => {
    if (!selectedLocation) return items;
    
    return items.filter(item => 
      item.locationId === selectedLocation.id || 
      item.clinicLocationId === selectedLocation.id
    );
  };

  const addLocationToData = <T extends object>(data: T): T & { locationId: number } => {
    if (!selectedLocation) return data as T & { locationId: number };
    
    return {
      ...data,
      locationId: selectedLocation.id
    };
  };

  return {
    selectedLocation,
    filterByLocation,
    addLocationToData,
    hasLocationSelected: !!selectedLocation
  };
}