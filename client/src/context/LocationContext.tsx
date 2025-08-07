import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface LocationContextType {
  selectedLocation: ClinicLocation | null;
  setSelectedLocation: (location: ClinicLocation | null) => void;
  isLocationRequired: boolean;
  setLocationRequired: (required: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [selectedLocation, setSelectedLocation] = useState<ClinicLocation | null>(null);
  const [isLocationRequired, setLocationRequired] = useState(false);

  // Persist selected location in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedClinicLocation');
    if (saved) {
      try {
        const location = JSON.parse(saved);
        setSelectedLocation(location);
      } catch (error) {
        console.error('Failed to parse saved location:', error);
        localStorage.removeItem('selectedClinicLocation');
      }
    }
  }, []);

  const handleSetSelectedLocation = (location: ClinicLocation | null) => {
    setSelectedLocation(location);
    if (location) {
      localStorage.setItem('selectedClinicLocation', JSON.stringify(location));
    } else {
      localStorage.removeItem('selectedClinicLocation');
    }
  };

  const value = {
    selectedLocation,
    setSelectedLocation: handleSetSelectedLocation,
    isLocationRequired,
    setLocationRequired,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}