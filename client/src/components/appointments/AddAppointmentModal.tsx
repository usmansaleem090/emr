import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, FileText, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/UI/dialog';
import { Badge } from '@/components/UI/badge';
import { api } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

interface ClinicLocation {
  id: number;
  name: string;
  address: string;
  services: string[];
  providers: string[];
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  userId: number;
  clinicId: number;
  status: string;
}

interface Doctor {
  id: number;
  userId: number;
  specialty: string;
  licenseNumber: string;
  status: string;
  firstName: string;
  lastName: string;
}

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
  selectedLocation: ClinicLocation | null;
}

export function AddAppointmentModal({ 
  isOpen, 
  onClose, 
  onAppointmentCreated, 
  selectedLocation 
}: AddAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    locationId: selectedLocation?.id.toString() || '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: 'onsite' as 'onsite' | 'online',
    notes: '',
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    patients: false,
    doctors: false,
    locations: false,
    slots: false,
    creating: false,
  });
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFormData(prev => ({
        ...prev,
        locationId: selectedLocation?.id.toString() || '',
      }));
    }
  }, [isOpen, selectedLocation]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate && formData.locationId) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.doctorId, formData.appointmentDate, formData.locationId]);

  const loadData = async () => {
    await Promise.all([
      loadPatients(),
      loadDoctors(),
      loadLocations(),
    ]);
  };

  const loadPatients = async () => {
    try {
      setLoading(prev => ({ ...prev, patients: true }));
      const userResponse = await api.get('/api/auth/verify');
      const clinicId = userResponse.data.user.clinicId;
      const response = await api.get('/api/patients', { params: { clinic_id: clinicId } });
      console.log('Patients response:', response.data);
      console.log('Setting patients:', response.data.data);
      // Check if data is in response.data.data or directly in response.data
      const patientsData = response.data.data || response.data || [];
      console.log('Actual patients data:', patientsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  };

  const loadDoctors = async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }));
      const userResponse = await api.get('/api/auth/verify');
      const clinicId = userResponse.data.user.clinicId;
      
      // Try clinic-specific first, then fallback to all doctors
      let response;
      try {
        response = await api.get('/api/doctors', { params: { clinicId: clinicId } });
        if (!response.data.data || response.data.data.length === 0) {
          // Fallback to all doctors if none for this clinic
          response = await api.get('/api/doctors');
        }
      } catch {
        // Fallback to all doctors if clinic filter fails
        response = await api.get('/api/doctors');
      }
      
      console.log('Doctors response:', response.data);
      console.log('Setting doctors:', response.data.data);
      // Check if data is in response.data.data or directly in response.data
      const doctorsData = response.data.data || response.data || [];
      console.log('Actual doctors data:', doctorsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  };

  const loadLocations = async () => {
    try {
      setLoading(prev => ({ ...prev, locations: true }));
      const userResponse = await api.get('/api/auth/verify');
      const clinicId = userResponse.data.user.clinicId;
      const response = await api.get(`/api/clinics/${clinicId}/locations`);
      console.log('Locations response:', response.data);
      console.log('Setting locations:', response.data.data);
      console.log('Current state before:', { patients, doctors, locations });
      // Check if data is in response.data.data or directly in response.data
      const locationsData = response.data.data || response.data || [];
      console.log('Actual locations data:', locationsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoading(prev => ({ ...prev, slots: true }));
      const response = await api.get(
        `/api/appointments/slots/${formData.doctorId}/${formData.appointmentDate}/${formData.locationId}`
      );
      console.log('Available slots response:', response.data);
      console.log('Available slots data:', response.data.data);
      
      // Check if data is in response.data.data or directly in response.data
      const slotsData = response.data.data || response.data || [];
      console.log('Setting available slots:', slotsData);
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(prev => ({ ...prev, slots: false }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeSlotSelect = (startTime: string) => {
    const endTime = calculateEndTime(startTime, 30);
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime,
    }));
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    if (step === 1) {
      if (!formData.patientId) newErrors.patientId = 'Patient is required';
      if (!formData.doctorId) newErrors.doctorId = 'Doctor is required';
      if (!formData.locationId) newErrors.locationId = 'Location is required';
    }

    if (step === 2) {
      if (!formData.appointmentDate) newErrors.appointmentDate = 'Date is required';
      if (!formData.startTime) newErrors.startTime = 'Time slot is required';
      
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Cannot schedule appointments in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // if (validateStep(currentStep)) {
      setCurrentStep(2);
    // }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    try {
      setLoading(prev => ({ ...prev, creating: true }));
      
      // Get current user and clinic info
      const userResponse = await api.get('/api/auth/verify');
      const currentUser = userResponse.data.user;
      
      console.log('Current user from API:', currentUser);
      console.log('User ID fields:', { userId: currentUser.userId, id: currentUser.id });
      
      const appointmentData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        locationId: parseInt(formData.locationId),
        clinicId: currentUser.clinicId,
        createdBy: currentUser.id, // User ID from auth verification
        status: 'scheduled',
      };

      console.log('Sending appointment data:', appointmentData);
      await api.post('/api/appointments', appointmentData);
      
      onAppointmentCreated();
      resetForm();
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      locationId: selectedLocation?.id.toString() || '',
      appointmentDate: '',
      startTime: '',
      endTime: '',
      type: 'onsite',
      notes: '',
    });
    setErrors({});
    setAvailableSlots([]);
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      dates.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM d, yyyy'),
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return dates;
  };

  const getSelectedPatient = () => {
    return patients.find(p => p.id.toString() === formData.patientId);
  };

  const getSelectedDoctor = () => {
    return doctors.find(d => d.id.toString() === formData.doctorId);
  };

  const getSelectedLocation = () => {
    return locations.find(l => l.id.toString() === formData.locationId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-blue-600" />
            Schedule New Appointment
          </DialogTitle>
          <DialogDescription>
            Book a new appointment with comprehensive scheduling options
          </DialogDescription>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="ml-2 hidden sm:block">Select People & Location</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 hidden sm:block">Choose Date & Time</span>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && (
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-blue-600" />
                      Select Patient
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.patientId} onValueChange={(value) => handleInputChange('patientId', value)}>
                      <SelectTrigger className={`h-12 ${errors.patientId ? 'border-red-500' : 'border-blue-200'}`}>
                        <SelectValue placeholder={loading.patients ? "Loading patients..." : "Choose a patient"} />
                      </SelectTrigger>
                      <SelectContent>
                        {patients && patients.length > 0 ? (
                          patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                                <span className="text-xs text-gray-500">({patient.medicalRecordNumber})</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-patients" disabled>
                            No patients available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.patientId && <p className="text-sm text-red-500 mt-1">{errors.patientId}</p>}
                    {loading.patients && <p className="text-sm text-gray-500 mt-1">Loading patients...</p>}
                    {!loading.patients && patients.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No patients found</p>
                    )}
                  </CardContent>
                </Card>

                {/* Doctor Selection */}
                <Card className="border-2 border-green-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      Select Doctor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)}>
                      <SelectTrigger className={`h-12 ${errors.doctorId ? 'border-red-500' : 'border-green-200'}`}>
                        <SelectValue placeholder={loading.doctors ? "Loading doctors..." : "Choose a doctor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors && doctors.length > 0 ? (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</span>
                                <span className="text-xs text-gray-500">({doctor.specialty})</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-doctors" disabled>
                            No doctors available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.doctorId && <p className="text-sm text-red-500 mt-1">{errors.doctorId}</p>}
                    {loading.doctors && <p className="text-sm text-gray-500 mt-1">Loading doctors...</p>}
                    {!loading.doctors && doctors.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No doctors found</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Location Selection */}
              <Card className="border-2 border-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    Select Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.locationId} onValueChange={(value) => handleInputChange('locationId', value)}>
                    <SelectTrigger className={`h-12 ${errors.locationId ? 'border-red-500' : 'border-purple-200'}`}>
                      <SelectValue placeholder={loading.locations ? "Loading locations..." : "Choose a location"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations && locations.length > 0 ? (
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            <span className="font-medium">{location.name}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-locations" disabled>
                          No locations available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.locationId && <p className="text-sm text-red-500 mt-1">{errors.locationId}</p>}
                  {loading.locations && <p className="text-sm text-gray-500 mt-1">Loading locations...</p>}
                  {!loading.locations && locations.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No locations found</p>
                  )}
                </CardContent>
              </Card>

              {/* Appointment Type */}
              <Card className="border-2 border-orange-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Appointment Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('type', 'onsite')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.type === 'onsite' 
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <MapPin className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">On-site Visit</div>
                      <div className="text-xs text-gray-500">In-person appointment</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('type', 'online')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.type === 'online' 
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Clock className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Online Consultation</div>
                      <div className="text-xs text-gray-500">Virtual appointment</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 p-6">
              {/* Summary Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Patient:</strong> {getSelectedPatient()?.firstName} {getSelectedPatient()?.lastName}
                    </div>
                    <div>
                      <strong>Doctor:</strong> Dr. {getSelectedDoctor()?.firstName} {getSelectedDoctor()?.lastName}
                    </div>
                    <div>
                      <strong>Location:</strong> {getSelectedLocation()?.name}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.appointmentDate} onValueChange={(value) => handleInputChange('appointmentDate', value)}>
                      <SelectTrigger className={`h-12 ${errors.appointmentDate ? 'border-red-500' : 'border-blue-200'}`}>
                        <SelectValue placeholder="Choose appointment date" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableDates().map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            <div className="flex items-center gap-2">
                              <span>{date.label}</span>
                              {date.isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                              {date.isTomorrow && <Badge variant="outline" className="text-xs">Tomorrow</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.appointmentDate && <p className="text-sm text-red-500 mt-1">{errors.appointmentDate}</p>}
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="border-2 border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                      Notes (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add special instructions or notes..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Time Slot Selection */}
              {formData.appointmentDate && (
                <Card className="border-2 border-green-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                      Available Time Slots
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading.slots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading available slots...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className={`p-3 border-2 rounded-lg transition-all text-sm font-medium ${
                              formData.startTime === slot
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-4">
                          <p className="text-orange-700 text-center">
                            No available slots for the selected doctor, date, and location.
                            Please try a different date or doctor.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {errors.startTime && <p className="text-sm text-red-500 mt-2">{errors.startTime}</p>}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
            {/* Form Actions */}
        <div className="flex justify-between items-center px-10 py-4 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={handleClose} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          
          <div className="flex gap-3">
            {currentStep === 2 && (
              <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
                Back
              </Button>
            )}
            
            {currentStep === 1 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                // disabled={!formData.patientId || !formData.doctorId || !formData.locationId}
                className="gap-2"
              >
                Next
                <Check className="h-4 w-4 mb-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={loading.creating || !formData.startTime}
                className="gap-2"
              >
                {loading.creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Appointment
              </Button>
            )}
          </div>
        </div>
        
        </div>

      
      </DialogContent>
    </Dialog>
  );
}