import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Checkbox } from '@/components/UI/checkbox';
import { Badge } from '@/components/UI/badge';
import { ScrollArea } from '@/components/UI/scroll-area';
import { Separator } from '@/components/UI/separator';
import { SimpleDropdown } from '@/components/UI/SimpleDropdown';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Heart, 
  Brain, 
  Eye, 
  Stethoscope, 
  Baby, 
  Bone,
  Microscope,
  Monitor,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  MapPin,
  Save
} from 'lucide-react';
import { Input } from '@/components/UI/input';
import { api } from '../../utils/apiClient';

// Define service categories and their services
const CLINIC_SERVICES = {
  "Laboratory Services": [
    "Complete Blood Count (CBC)",
    "Blood Glucose Testing", 
    "Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)",
    "Liver Function Tests (LFT)",
    "Kidney Function Tests (RFT)",
    "Urine Analysis",
    "Thyroid Profile (TSH, T3, T4)",
    "HbA1c",
    "Culture & Sensitivity Tests (Urine, Blood, Throat Swab)"
  ],
  "Neurology / Neurodiagnostics": [
    "EEG (Electroencephalogram) – brain activity monitoring",
    "Nerve Conduction Studies (NCS)", 
    "EMG (Electromyography) – muscle and nerve function",
    "Evoked Potential Tests (VEP, SSEP, BAEP)"
  ],
  "Cardiology Services": [
    "ECG / EKG (Electrocardiogram)",
    "2D Echo / Echocardiography",
    "Treadmill Test (TMT) / Stress Test", 
    "Holter Monitoring (24-48hr ECG monitoring)",
    "Ambulatory Blood Pressure Monitoring"
  ],
  "Radiology / Imaging": [
    "X-Ray",
    "Ultrasound (Abdomen, Pelvis, Obstetric)",
    "Color Doppler Studies",
    "Mammography", 
    "CT Scan / MRI (usually referred unless a large clinic)"
  ],
  "Genetic & Specialized Testing": [
    "DNA / Genetic Testing",
    "Hormonal Assays",
    "Allergy Testing (IgE)",
    "Tumor Markers (CA-125, PSA, etc.)"
  ],
  "General Medical Services": [
    "General Practitioner (GP) Consultations",
    "Annual Health Checkups",
    "Vaccinations & Immunizations",
    "Minor Procedures (wound dressing, suturing)",
    "Diabetes & Hypertension Management"
  ],
  "Dental Services": [
    "Routine Dental Checkup",
    "Scaling & Polishing", 
    "Tooth Extraction",
    "Fillings",
    "Root Canal Treatment (RCT)",
    "Crowns & Bridges"
  ],
  "Pediatrics": [
    "Child Growth Monitoring",
    "Pediatric Immunization",
    "Developmental Screening"
  ],
  "Ophthalmology": [
    "Vision Testing",
    "Fundus Photography",
    "Eye Pressure Testing (Tonometry)",
    "Refraction Services",
    "Cataract Screening"
  ],
  "ENT Services": [
    "Audiometry (Hearing Tests)",
    "Tympanometry",
    "Nasal Endoscopy",
    "Throat Swab Culture"
  ],
  "Gynecology & Women's Health": [
    "Pap Smear",
    "Pelvic Ultrasound",
    "Antenatal Checkups",
    "Fertility Workup",
    "Menopause Management"
  ],
  "Orthopedic Services": [
    "Bone Density Scan (DEXA)",
    "Fracture Management",
    "Arthritis Screening"
  ],
  "Other Specialized Services": [
    "Physiotherapy",
    "Nutrition & Diet Consultation",
    "Mental Health Counseling / Psychiatry",
    "Dermatology (Skin) Consultations",
    "Home Sample Collection / Teleconsultation"
  ]
};

// Category icons mapping
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    "Laboratory Services": Microscope,
    "Neurology / Neurodiagnostics": Brain,
    "Cardiology Services": Heart,
    "Radiology / Imaging": Monitor,
    "Genetic & Specialized Testing": FileText,
    "General Medical Services": Stethoscope,
    "Dental Services": Settings,
    "Pediatrics": Baby,
    "Ophthalmology": Eye,
    "ENT Services": Settings,
    "Gynecology & Women's Health": Heart,
    "Orthopedic Services": Bone,
    "Other Specialized Services": Settings
  };
  
  const IconComponent = iconMap[category] || Settings;
  return IconComponent;
};

interface ClinicLocation {
  id: number;
  name: string;
  address: string;
  hours?: string;
  services: string[];
  providers: string[];
}

interface LocationService {
  locationId: number;
  locationName: string;
  locationAddress: string;
  services: string[];
}

interface ClinicServicesProps {
  clinicId: number;
  clinicName?: string;
}

export function ClinicServices({ clinicId, clinicName }: ClinicServicesProps) {
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [locationServices, setLocationServices] = useState<LocationService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (clinicId) {
      loadLocations();
      loadLocationServices();
    }
  }, [clinicId]);

  useEffect(() => {
    if (selectedLocation) {
      // Load services for selected location
      const locationService = locationServices.find(ls => ls.locationId === selectedLocation);
      if (locationService) {
        setSelectedServices(new Set(locationService.services));
      } else {
        setSelectedServices(new Set());
      }
    }
  }, [selectedLocation, locationServices]);

  const loadLocations = async () => {
    if (!clinicId) return;
    
    try {
      const response = await api.get(`/api/clinics/${clinicId}/locations`);
      console.log('Raw locations response in services:', response.data);
      
      // Handle both response formats: direct array or {data: [...]} structure
      let savedLocations = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        savedLocations = response.data;
        console.log('Using direct array response for locations');
      } else if (response.data.data) {
        // Wrapped response structure
        savedLocations = response.data.data;
        console.log('Using wrapped response structure for locations');
      } else {
        console.log('Unknown response format for locations:', response.data);
        savedLocations = [];
      }
      
      const convertedLocations = savedLocations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        hours: loc.hours,
        services: loc.services || [],
        providers: loc.providers || []
      }));
      
      console.log('Converted locations in services:', convertedLocations);
      setLocations(convertedLocations);
      
      // Set first location as selected if available
      if (convertedLocations.length > 0 && !selectedLocation) {
        setSelectedLocation(convertedLocations[0].id);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadLocationServices = async () => {
    if (!clinicId) return;
    
    try {
      const response = await api.get(`/api/clinics/${clinicId}/location-services`);
      console.log('Raw location services response:', response.data);
      
      // Handle both response formats: direct array or {data: [...]} structure
      let services = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        services = response.data;
        console.log('Using direct array response for location services');
      } else if (response.data.data) {
        // Wrapped response structure
        services = response.data.data;
        console.log('Using wrapped response structure for location services');
      } else {
        console.log('Unknown response format for location services:', response.data);
        services = [];
      }
      
      console.log('Processed location services:', services);
      
      // Group services by location
      const locationServicesMap = new Map<number, LocationService>();
      
      services.forEach((service: any) => {
        if (!locationServicesMap.has(service.locationId)) {
          locationServicesMap.set(service.locationId, {
            locationId: service.locationId,
            locationName: service.locationName,
            locationAddress: service.locationAddress,
            services: []
          });
        }
        locationServicesMap.get(service.locationId)!.services.push(service.serviceName);
      });
      
      const locationServicesArray = Array.from(locationServicesMap.values());
      console.log('Grouped location services:', locationServicesArray);
      setLocationServices(locationServicesArray);
    } catch (error) {
      console.error('Error loading location services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocationServices = async () => {
    if (!clinicId || !selectedLocation) return;
    
    try {
      setIsSaving(true);
      
      // Convert selected services to the required format
      const services = Array.from(selectedServices).map(serviceName => {
        // Find the category for this service
        const category = Object.entries(CLINIC_SERVICES).find(([cat, services]) => 
          services.includes(serviceName)
        )?.[0] || 'Other Specialized Services';
        
        return {
          serviceName,
          serviceCategory: category
        };
      });

      const locationServicesData = [{
        locationId: selectedLocation,
        services
      }];

      await api.post(`/api/clinics/${clinicId}/location-services`, { locationServices: locationServicesData });
      
      // Reload location services to get updated data
      await loadLocationServices();
      
      toast({
        title: "Success",
        description: `${services.length} services saved for selected location`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error: any) {
      console.error('Error saving location services:', error);
      toast({
        title: "Error", 
        description: "Failed to save location services",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceName)) {
        newSet.delete(serviceName);
      } else {
        newSet.add(serviceName);
      }
      return newSet;
    });
  };

  const toggleCategory = (category: string) => {
    const categoryServices = CLINIC_SERVICES[category as keyof typeof CLINIC_SERVICES];
    const allSelected = categoryServices.every(service => selectedServices.has(service));
    
    if (allSelected) {
      // Deselect all services in category
      setSelectedServices(prev => {
        const newSet = new Set(prev);
        categoryServices.forEach(service => newSet.delete(service));
        return newSet;
      });
    } else {
      // Select all services in category
      setSelectedServices(prev => {
        const newSet = new Set(prev);
        categoryServices.forEach(service => newSet.add(service));
        return newSet;
      });
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Filter services based on search term
  const filteredCategories = Object.entries(CLINIC_SERVICES).reduce((acc, [category, services]) => {
    if (searchTerm) {
      const filteredServices = services.filter(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredServices.length > 0) {
        acc[category] = filteredServices;
      }
    } else {
      acc[category] = services;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const selectedCount = selectedServices.size;
  const selectedLocationName = locations.find(loc => loc.id === selectedLocation)?.name;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading clinic services...</span>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Locations Found</h3>
            <p className="text-muted-foreground mb-4">
              You need to add locations to your clinic before configuring services.
            </p>
            <p className="text-sm text-muted-foreground">
              Please go to the Locations tab and add at least one location first.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Location Servkices {clinicName && `- ${clinicName}`}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
              {selectedCount} selected
            </Badge>
            <Button 
              onClick={saveLocationServices}
              disabled={isSaving || selectedCount === 0 || !selectedLocation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Services
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
                 {/* Location Selection */}
         <div className="mb-6">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <MapPin className="w-4 h-4" />
               <span className="font-medium">Select Location:</span>
             </div>
             <div className="w-64">
               <SimpleDropdown
                 value={selectedLocation?.toString() || ''}
                 onValueChange={(value) => setSelectedLocation(parseInt(value))}
                 options={locations.map((location) => ({
                   value: location.id.toString(),
                   label: `${location.name}`
                 }))}
                 placeholder="Choose a location"
               />
             </div>
             {selectedLocationName && (
               <Badge variant="outline">
                 {selectedLocationName}
               </Badge>
             )}
           </div>
         </div>

        {selectedLocation && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Service Categories */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(filteredCategories).map(([category, services]) => {
                  const IconComponent = getCategoryIcon(category);
                  const categorySelectedCount = services.filter(service => selectedServices.has(service)).length;
                  const isExpanded = expandedCategories.has(category);
                  const allCategorySelected = services.length > 0 && services.every(service => selectedServices.has(service));
                  const someCategorySelected = services.some(service => selectedServices.has(service));

                  return (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <h3 
                            className="font-semibold cursor-pointer hover:text-blue-600"
                            onClick={() => toggleCategoryExpansion(category)}
                          >
                            {category}
                          </h3>
                          <Badge variant="outline">
                            {categorySelectedCount}/{services.length}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={allCategorySelected}
                            onCheckedChange={() => toggleCategory(category)}
                            className={someCategorySelected && !allCategorySelected ? "opacity-50" : ""}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleCategoryExpansion(category)}
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="grid grid-cols-1 gap-2 ml-8">
                          {services.map((service) => (
                            <div key={service} className="flex items-center space-x-2">
                              <Checkbox
                                id={service}
                                checked={selectedServices.has(service)}
                                onCheckedChange={() => toggleService(service)}
                              />
                              <label 
                                htmlFor={service} 
                                className="text-sm cursor-pointer hover:text-blue-600 leading-relaxed"
                              >
                                {service}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Summary */}
            {selectedCount > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Selected Services Summary</h4>
                </div>
                <p className="text-sm text-blue-600">
                  {selectedCount} services selected for {selectedLocationName} across {Object.keys(filteredCategories).filter(cat => 
                    CLINIC_SERVICES[cat as keyof typeof CLINIC_SERVICES].some(service => selectedServices.has(service))
                  ).length} categories
                </p>
              </div>
            )}
          </>
        )}

        {!selectedLocation && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Please select a location to configure services</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}