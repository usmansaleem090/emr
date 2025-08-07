import { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Checkbox } from "@/components/UI/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { api } from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  X,
  Coffee,
  Utensils
} from "lucide-react";
import { SimpleDropdown } from "../UI/SimpleDropdown";

interface Location {
  id: number;
  name: string;
  address: string;
}

interface Break {
  startTime: string;
  endTime: string;
  type: 'lunch' | 'short';
}

interface DaySchedule {
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
  breaks: Break[];
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface LocationSchedule {
  id?: number;
  locationId: number;
  scheduleName: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  weeklySchedule: WeeklySchedule;
  timeZone: string;
  notes?: string;
  location?: Location;
}

interface ClinicLocationSchedulingProps {
  clinicId: number;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

export function ClinicLocationScheduling({ clinicId }: ClinicLocationSchedulingProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<LocationSchedule[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LocationSchedule | null>(null);
  const { toast } = useToast();

  // Form state for new/edit schedule
  const [formData, setFormData] = useState<Partial<LocationSchedule>>({
    scheduleName: '',
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    timeZone: 'America/New_York',
    weeklySchedule: {
      monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
      tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
      wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
      thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
      friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
      saturday: { isWorkingDay: false, breaks: [] },
      sunday: { isWorkingDay: false, breaks: [] },
    },
  });

  useEffect(() => {
    loadLocations();
    loadSchedules();
  }, [clinicId]);

  // Remove automatic location selection - let user choose

  // Monitor dialog state changes for debugging
  useEffect(() => {
    if (isDialogOpen) {
      console.log('Dialog opened successfully');
    }
  }, [isDialogOpen]);

  const loadLocations = async () => {
    try {
      const response = await api.get(`/api/clinics/${clinicId}/locations`);
      console.log('Locations API response:', response.data);
      const customziedResponse = response.data?.map((e: any) => ({ value: e.id.toString(), label: e.name })) || [];
      setLocations(customziedResponse);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/clinics/${clinicId}/schedules`);
    
      // Handle different response structures
      let schedulesData: LocationSchedule[] = [];
      
      // Check if response.data is directly an array (most likely case based on your API response)
      if (response.data && Array.isArray(response.data)) {
        schedulesData = response.data.map((item: any) => {
         
          
          return {
            ...item.schedule,
            location: item.location // Attach the location object directly
          };
        });
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        schedulesData = response.data.data.map((item: any) => ({
          ...item.schedule,
          location: item.location
        }));
      } else if (response.data && response.data.schedules && Array.isArray(response.data.schedules)) {
        schedulesData = response.data.schedules.map((item: any) => ({
          ...item.schedule,
          location: item.location
        }));
      } else {
        schedulesData = [];
      }
      
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    console.log('Opening dialog...');
    setEditingSchedule(null);
    setFormData({
      scheduleName: '',
      isActive: true,
      effectiveFrom: new Date().toISOString().split('T')[0],
      timeZone: 'America/New_York',
      weeklySchedule: {
        monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        saturday: { isWorkingDay: false, breaks: [] },
        sunday: { isWorkingDay: false, breaks: [] },
      },
    });
    setIsDialogOpen(true);
  };

  const handleEditSchedule = (schedule: LocationSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      ...schedule,
      effectiveFrom: schedule.effectiveFrom,
      effectiveTo: schedule.effectiveTo,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!selectedLocation || !formData.scheduleName || !formData.effectiveFrom) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const scheduleData = {
        ...formData,
        locationId: parseInt(selectedLocation.value),
      };

      console.log('Saving schedule data:', scheduleData);
      console.log('Editing schedule:', editingSchedule);

      if (editingSchedule) {
        console.log('Updating schedule with ID:', editingSchedule.id);
        console.log('Update URL:', `/api/schedules/${editingSchedule.id}`);
        const response = await api.put(`/api/schedules/${editingSchedule.id}`, scheduleData);
        console.log('Update response:', response);
        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        });
      } else {
        console.log('Creating new schedule');
        console.log('Create URL:', `/api/clinics/${clinicId}/schedules`);
        const response = await api.post(`/api/clinics/${clinicId}/schedules`, scheduleData);
        console.log('Create response:', response);
        toast({
          title: 'Success',
          description: 'Schedule created successfully',
        });
      }

      setIsDialogOpen(false);
      loadSchedules();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save schedule',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await api.delete(`/api/schedules/${scheduleId}`);
      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });
      loadSchedules();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule!,
        [day]: { ...prev.weeklySchedule![day as keyof WeeklySchedule], ...updates }
      }
    }));
  };
  
  // console.log('Updated Form Data----------:', formData);
  const addBreak = (day: string) => {
    const newBreak: Break = {
      startTime: '12:00',
      endTime: '13:00',
      type: 'lunch'
    };

    updateDaySchedule(day, {
      breaks: [...(formData.weeklySchedule![day as keyof WeeklySchedule].breaks || []), newBreak]
    });
  };

  const removeBreak = (day: string, breakIndex: number) => {
    updateDaySchedule(day, {
      breaks: formData.weeklySchedule![day as keyof WeeklySchedule].breaks.filter((_, i) => i !== breakIndex)
    });
  };

  const updateBreak = (day: string, breakIndex: number, updates: Partial<Break>) => {
    const updatedBreaks = [...formData.weeklySchedule![day as keyof WeeklySchedule].breaks];
    updatedBreaks[breakIndex] = { ...updatedBreaks[breakIndex], ...updates };
    updateDaySchedule(day, { breaks: updatedBreaks });
  };

  const getLocationName = (locationId: number) => {
    // Find the schedule that has this locationId and use its attached location name
    const scheduleWithLocation = schedules.find(s => s.locationId === locationId && s.location);
    console.log('Getting location name for locationId:', locationId);
    console.log('Found schedule with location:', scheduleWithLocation);
    console.log('Location name:', scheduleWithLocation?.location?.name);
    return scheduleWithLocation?.location?.name || 'Unknown Location';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleTimeZoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, timeZone: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading schedules...</span>

      </div>
    );
  }

  console.log('Rendering ClinicLocationScheduling:');
  console.log('- clinicId:', clinicId);
  console.log('- locations:', locations);
  console.log('- schedules:', schedules);
  console.log('- selectedLocation:', selectedLocation);
  console.log('- loading:', loading);

  // Filter schedules for selected location
  const filteredSchedules = selectedLocation 
    ? schedules.filter(s => s.locationId === parseInt(selectedLocation.value))
    : [];
  
  console.log('- filteredSchedules:', filteredSchedules);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Location Scheduling</h2>
          <p className="text-muted-foreground">
            Manage operating hours and schedules for each clinic location
          </p>
        </div>
        <Button onClick={handleCreateSchedule} disabled={!selectedLocation}>
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Location Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Select Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleDropdown
            value={selectedLocation?.value?.toString() || ''}
            onValueChange={(value) => {
              console.log('Location selected:', value);
              const selectedOption = locations.find(loc => loc.value.toString() === value);
              setSelectedLocation(selectedOption);
            }}
            className="w-1/4"
            options={locations}
            placeholder="Choose a location to manage schedules"
            label="Locations *"
          />

          {/* <Select value={selectedLocation?.toString()} onValueChange={(value) => setSelectedLocation(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a location to manage schedules" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </CardContent>
      </Card>

      {/* Schedules List */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedules for {getLocationName(parseInt(selectedLocation.value))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No schedules found for this location</p>
                <p className="text-sm">Create a schedule to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedules
                  .map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{schedule.scheduleName}</h3>
                          {schedule.isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Effective From:</span>
                          <p>{new Date(schedule.effectiveFrom).toLocaleDateString()}</p>
                        </div>
                        {schedule.effectiveTo && (
                          <div>
                            <span className="font-medium">Effective To:</span>
                            <p>{new Date(schedule.effectiveTo).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Time Zone:</span>
                          <p>{schedule.timeZone}</p>
                        </div>
                        {schedule.notes && (
                          <div>
                            <span className="font-medium">Notes:</span>
                            <p>{schedule.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Weekly Schedule Preview */}
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Weekly Schedule:</h4>
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          {DAYS_OF_WEEK.map(({ key, short }) => {
                            const daySchedule = schedule.weeklySchedule[key as keyof WeeklySchedule];
                            return (
                              <div key={key} className="text-center p-2 border rounded">
                                <div className="font-medium">{short}</div>
                                {daySchedule.isWorkingDay ? (
                                  <div>
                                    <div>{formatTime(daySchedule.startTime!)}</div>
                                    <div>{formatTime(daySchedule.endTime!)}</div>
                                    {daySchedule.breaks.length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {daySchedule.breaks.length} break(s)
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">Closed</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        console.log('Dialog onOpenChange called with:', open, 'current state:', isDialogOpen);
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            </DialogTitle>
            <DialogDescription>
              Configure the weekly schedule for this location
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleName">Schedule Name *</Label>
                <Input
                  id="scheduleName"
                  value={formData.scheduleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduleName: e.target.value }))}
                  placeholder="e.g., Regular Hours, Holiday Hours"
                />
              </div>
              <div>
                <Label htmlFor="timeZone">Time Zone</Label>
                <Select value={formData.timeZone || 'America/New_York'} onValueChange={handleTimeZoneChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone">
                        {formData.timeZone?.replace('America/', '').replace('_', ' ') || 'Select time zone'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace('America/', '').replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Label htmlFor="effectiveFrom">Effective From *</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={formData.effectiveTo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this schedule"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
              />
              <Label htmlFor="isActive">Set as active schedule</Label>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
              <Tabs defaultValue="monday" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  {DAYS_OF_WEEK.map(({ key, short }) => (
                    <TabsTrigger key={key} value={key} className="text-xs">
                      {short}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {DAYS_OF_WEEK.map(({ key, label }) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${key}-working`}
                        checked={formData.weeklySchedule![key as keyof WeeklySchedule].isWorkingDay}
                        onCheckedChange={(checked) =>
                          updateDaySchedule(key, { isWorkingDay: checked as boolean })
                        }
                      />
                      <Label htmlFor={`${key}-working`} className="font-medium">
                        {label} is a working day
                      </Label>
                    </div>

                    {formData.weeklySchedule![key as keyof WeeklySchedule].isWorkingDay && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`${key}-start`}>Start Time</Label>
                            <Select
                                value={formData.weeklySchedule![key as keyof WeeklySchedule].startTime || ''}
                                onValueChange={(value) => updateDaySchedule(key, { startTime: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select start time">
                                    {formData.weeklySchedule![key as keyof WeeklySchedule].startTime ? 
                                      formatTime(formData.weeklySchedule![key as keyof WeeklySchedule].startTime as string) : 
                                      'Select start time'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {formatTime(time)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                          </div>
                          <div>
                            <Label htmlFor={`${key}-end`}>End Time</Label>
                            <Select
                              value={formData.weeklySchedule![key as keyof WeeklySchedule].endTime || ''}
                              onValueChange={(value) => updateDaySchedule(key, { endTime: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select end time">
                                  {formData.weeklySchedule![key as keyof WeeklySchedule].endTime ? 
                                    formatTime(formData.weeklySchedule![key as keyof WeeklySchedule]?.endTime as string) : 
                                    'Select end time'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {formatTime(time)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Breaks */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Breaks</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addBreak(key)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Break
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {formData.weeklySchedule![key as keyof WeeklySchedule].breaks.map((breakItem, breakIndex) => (
                              <div key={breakIndex} className="flex items-center gap-2 p-2 border rounded">
                                {/* Break Type Selector */}
                                <Select
                                  value={breakItem.type}
                                  onValueChange={(value) => updateBreak(key, breakIndex, { type: value as 'lunch' | 'short' })}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue>
                                      {breakItem.type === 'lunch' ? (
                                        <div className="flex items-center gap-1">
                                          <Utensils className="w-3 h-3" />
                                          Lunch
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <Coffee className="w-3 h-3" />
                                          Short
                                        </div>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lunch">
                                      <div className="flex items-center gap-1">
                                        <Utensils className="w-3 h-3" />
                                        Lunch
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="short">
                                      <div className="flex items-center gap-1">
                                        <Coffee className="w-3 h-3" />
                                        Short
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                {/* Start Time Selector */}
                                <Select
                                  value={breakItem.startTime}
                                  onValueChange={(value) => updateBreak(key, breakIndex, { startTime: value })}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue>
                                      {breakItem.startTime ? formatTime(breakItem.startTime) : 'Start'}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {formatTime(time)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <span>to</span>

                                {/* End Time Selector */}
                                <Select
                                  value={breakItem.endTime}
                                  onValueChange={(value) => updateBreak(key, breakIndex, { endTime: value })}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue>
                                      {breakItem.endTime ? formatTime(breakItem.endTime) : 'End'}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {formatTime(time)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Remove Break Button */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBreak(key, breakIndex)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchedule} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 