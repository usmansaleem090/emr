import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Badge } from '@/components/UI/badge';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Textarea } from '@/components/UI/textarea';
import { CalendarIcon, Clock, MapPin, User, Stethoscope, FileText } from 'lucide-react';
import { format, addDays, startOfDay, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/utils/apiClient';

interface Service {
  name: string;
  category: string;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
}

interface ClinicLocation {
  id: number;
  clinicId: number;
  name: string;
  address: string;
  services: string[];
  providers: string[];
}

interface Doctor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialty: string;
  clinicId: number;
}

interface DoctorSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

const BookAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'onsite' | 'online'>('onsite');
  const [notes, setNotes] = useState<string>('');

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [doctorSchedule, setDoctorSchedule] = useState<DoctorSchedule[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    services: false,
    clinics: false,
    locations: false,
    doctors: false,
    slots: false,
    booking: false,
  });

  // Load initial services
  useEffect(() => {
    loadServices();
  }, []);

  // Load clinics when service is selected
  useEffect(() => {
    if (selectedService) {
      loadClinicsForService();
    } else {
      setClinics([]);
      setSelectedClinic('');
    }
  }, [selectedService]);

  // Load locations when clinic is selected
  useEffect(() => {
    if (selectedClinic) {
      loadLocationsForClinic();
      loadDoctorsForClinic();
    } else {
      setLocations([]);
      setDoctors([]);
      setSelectedLocation('');
      setSelectedDoctor('');
    }
  }, [selectedClinic]);

  // Load available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate && selectedLocation) {
      loadAvailableSlots();
      loadDoctorSchedule();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate, selectedLocation]);

  const loadServices = async () => {
    try {
      setLoading(prev => ({ ...prev, services: true }));
      // Get all unique services from clinic locations
      const response = await api.get('/api/clinic-locations');
      const allLocations = response.data.data || [];
      
      const serviceSet = new Set<string>();
      allLocations.forEach((location: ClinicLocation) => {
        if (location.services && Array.isArray(location.services)) {
          location.services.forEach(service => serviceSet.add(service));
        }
      });

      const uniqueServices = Array.from(serviceSet).map(service => ({
        name: service,
        category: 'Medical Service'
      }));

      setServices(uniqueServices);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast({
        title: "Error",
        description: "Failed to load available services",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const loadClinicsForService = async () => {
    try {
      setLoading(prev => ({ ...prev, clinics: true }));
      // Get clinics that offer the selected service
      const response = await api.get('/api/clinic-locations');
      const allLocations = response.data.data || [];
      
      const clinicIds = new Set<number>();
      allLocations.forEach((location: ClinicLocation) => {
        if (location.services && location.services.includes(selectedService)) {
          clinicIds.add(location.clinicId);
        }
      });

      // Get clinic details for matching clinic IDs
      const clinicsResponse = await api.get('/api/clinics');
      const allClinics = clinicsResponse.data.data || [];
      
      const filteredClinics = allClinics.filter((clinic: Clinic) => 
        clinicIds.has(clinic.id)
      );

      setClinics(filteredClinics);
    } catch (error) {
      console.error('Failed to load clinics:', error);
      toast({
        title: "Error",
        description: "Failed to load clinics for selected service",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, clinics: false }));
    }
  };

  const loadLocationsForClinic = async () => {
    try {
      setLoading(prev => ({ ...prev, locations: true }));
      const response = await api.get(`/api/clinics/${selectedClinic}/locations`);
      const clinicLocations = response.data.data || [];
      
      // Filter locations that offer the selected service
      const filteredLocations = clinicLocations.filter((location: ClinicLocation) =>
        location.services && location.services.includes(selectedService)
      );
      
      setLocations(filteredLocations);
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast({
        title: "Error",
        description: "Failed to load clinic locations",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const loadDoctorsForClinic = async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }));
      const response = await api.get('/api/doctors');
      const allDoctors = response.data.data || [];
      
      // Filter doctors for the selected clinic
      const clinicDoctors = allDoctors.filter((doctor: Doctor) => 
        doctor.clinicId === parseInt(selectedClinic)
      );
      
      setDoctors(clinicDoctors);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors for selected clinic",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  };

  const loadDoctorSchedule = async () => {
    try {
      const response = await api.get(`/api/doctors/${selectedDoctor}/schedules`);
      setDoctorSchedule(response.data.data || []);
    } catch (error) {
      console.error('Failed to load doctor schedule:', error);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoading(prev => ({ ...prev, slots: true }));
      const dateStr = format(selectedDate!, 'yyyy-MM-dd');
      const response = await api.get('/api/appointments/available-slots', {
        params: {
          doctorId: selectedDoctor,
          date: dateStr,
          locationId: selectedLocation
        }
      });
      
      setAvailableSlots(response.data.data || []);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, slots: false }));
    }
  };

  const bookAppointment = async () => {
    if (!selectedService || !selectedClinic || !selectedLocation || !selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, booking: true }));
      
      // Get patient ID from current user
      const patientsResponse = await api.get('/api/patients');
      const patients = patientsResponse.data.data || [];
      const currentPatient = patients.find((p: any) => p.userId === user?.id);
      
      if (!currentPatient) {
        toast({
          title: "Error",
          description: "Patient profile not found. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      const appointmentData = {
        clinicId: parseInt(selectedClinic),
        patientId: currentPatient.id,
        doctorId: parseInt(selectedDoctor),
        locationId: parseInt(selectedLocation),
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTimeSlot,
        endTime: calculateEndTime(selectedTimeSlot),
        type: appointmentType,
        status: 'scheduled',
        notes: notes || '',
        createdBy: user?.id || 0
      };

      await api.post('/api/appointments', appointmentData);
      
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });

      // Reset form
      resetForm();
      
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = endMinutes >= 60 ? hours + 1 : hours;
    const finalMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
    
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setSelectedService('');
    setSelectedClinic('');
    setSelectedLocation('');
    setSelectedDoctor('');
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
    setAppointmentType('onsite');
    setNotes('');
    setClinics([]);
    setLocations([]);
    setDoctors([]);
    setAvailableSlots([]);
  };

  const isDayAvailable = (date: Date): boolean => {
    if (!doctorSchedule.length) return true;
    
    const dayOfWeek = date.getDay();
    return doctorSchedule.some(schedule => schedule.dayOfWeek === dayOfWeek);
  };

  const selectedClinicData = clinics.find(c => c.id.toString() === selectedClinic);
  const selectedLocationData = locations.find(l => l.id.toString() === selectedLocation);
  const selectedDoctorData = doctors.find(d => d.id.toString() === selectedDoctor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-600">Schedule your visit with our healthcare professionals</p>
        </div>

        {/* Booking Form */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Selection Steps */}
          <div className="space-y-6">
            {/* Step 1: Select Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Step 1: Select Service
                </CardTitle>
                <CardDescription>Choose the medical service you need</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedService} onValueChange={setSelectedService} disabled={loading.services}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading.services ? "Loading services..." : "Select a service"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 2: Select Clinic */}
            {selectedService && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Step 2: Select Clinic
                  </CardTitle>
                  <CardDescription>Choose a clinic that offers {selectedService}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedClinic} onValueChange={setSelectedClinic} disabled={loading.clinics}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading.clinics ? "Loading clinics..." : "Select a clinic"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id.toString()}>
                          <div>
                            <div className="font-medium">{clinic.name}</div>
                            <div className="text-sm text-gray-500">{clinic.address}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Select Location */}
            {selectedClinic && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Step 3: Select Location
                  </CardTitle>
                  <CardDescription>Choose a specific location within the clinic</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={loading.locations}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading.locations ? "Loading locations..." : "Select a location"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-500">{location.address}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Select Doctor */}
            {selectedClinic && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" />
                    Step 4: Select Doctor
                  </CardTitle>
                  <CardDescription>Choose your preferred healthcare provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={loading.doctors}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading.doctors ? "Loading doctors..." : "Select a doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          <div>
                            <div className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</div>
                            <div className="text-sm text-gray-500">{doctor.specialty}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Date & Time Selection */}
          <div className="space-y-6">
            {/* Step 5: Select Date */}
            {selectedDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-red-600" />
                    Step 5: Select Date
                  </CardTitle>
                  <CardDescription>Choose your preferred appointment date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => 
                          date < startOfDay(new Date()) || 
                          date > addDays(new Date(), 30) ||
                          !isDayAvailable(date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Select Time Slot */}
            {selectedDate && selectedDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Step 6: Select Time
                  </CardTitle>
                  <CardDescription>Choose an available time slot</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.slots ? (
                    <div className="text-center py-4">Loading available slots...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className="h-10"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No available slots for selected date
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Appointment Type & Notes */}
            {selectedTimeSlot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Appointment Type</label>
                    <Select value={appointmentType} onValueChange={(value: 'onsite' | 'online') => setAppointmentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">In-Person Visit</SelectItem>
                        <SelectItem value="online">Telemedicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information or special requests..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Booking Summary & Confirmation */}
        {selectedTimeSlot && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm">
                <div><strong>Service:</strong> {selectedService}</div>
                <div><strong>Clinic:</strong> {selectedClinicData?.name}</div>
                <div><strong>Location:</strong> {selectedLocationData?.name}</div>
                <div><strong>Doctor:</strong> Dr. {selectedDoctorData?.firstName} {selectedDoctorData?.lastName}</div>
                <div><strong>Date:</strong> {selectedDate && format(selectedDate, "PPP")}</div>
                <div><strong>Time:</strong> {selectedTimeSlot} - {calculateEndTime(selectedTimeSlot)}</div>
                <div><strong>Type:</strong> <Badge variant={appointmentType === 'online' ? 'secondary' : 'default'}>{appointmentType === 'online' ? 'Telemedicine' : 'In-Person'}</Badge></div>
              </div>
              
              <Button 
                onClick={bookAppointment} 
                disabled={loading.booking}
                className="w-full mt-4"
                size="lg"
              >
                {loading.booking ? "Booking..." : "Confirm Appointment"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentPage;