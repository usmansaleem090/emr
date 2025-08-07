import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, User, Filter, Search, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Badge } from '@/components/UI/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { api } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/context/LocationContext';
import { LocationBasedOperations } from '@/components/clinic/LocationBasedOperations';
import { AddAppointmentModal } from '@/components/appointments/AddAppointmentModal';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface AppointmentWithDetails {
  id: number;
  clinicId: number;
  patientId: number;
  doctorId: number;
  locationId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: 'onsite' | 'online';
  status: 'scheduled' | 'cancelled' | 'completed';
  notes: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  patientName: string;
  doctorName: string;
  locationName: string;
  clinicName: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const { selectedLocation } = useLocation();

  useEffect(() => {
    loadAppointments();
  }, [selectedLocation]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = selectedLocation ? { locationId: selectedLocation.id } : {};
      const response = await api.get('/api/appointments', { params });
      console.log('Appointments API response:', response.data);
      
      // Handle both response.data.data and response.data structures
      const appointmentsData = response.data.data || response.data || [];
      console.log('Raw appointments data:', appointmentsData);
      
      // Map snake_case to camelCase for consistency
      const mappedAppointments = appointmentsData.map((apt: any) => ({
        id: apt.id,
        clinicId: apt.clinic_id || apt.clinicId,
        patientId: apt.patient_id || apt.patientId,
        doctorId: apt.doctor_id || apt.doctorId,
        locationId: apt.location_id || apt.locationId,
        appointmentDate: apt.appointment_date || apt.appointmentDate,
        startTime: apt.start_time || apt.startTime,
        endTime: apt.end_time || apt.endTime,
        type: apt.type,
        status: apt.status,
        notes: apt.notes,
        createdBy: apt.created_by || apt.createdBy,
        createdAt: apt.created_at || apt.createdAt,
        updatedAt: apt.updated_at || apt.updatedAt,
        patientName: apt.patient_name || apt.patientName,
        doctorName: apt.doctor_name || apt.doctorName,
        locationName: apt.location_name || apt.locationName,
        clinicName: apt.clinic_name || apt.clinicName,
      }));
      
      console.log('Mapped appointments data:', mappedAppointments);
      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    console.log('Filtering appointments:', appointments);

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    console.log('Filtered appointments:', filtered);
    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      completed: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      cancelled: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeBadge = (type: string) => {
    return type === 'online' 
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : 'bg-orange-50 text-orange-700 border-orange-200';
  };

  const getDateDisplay = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getTimeDisplay = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const handleAppointmentCreated = () => {
    setShowAddModal(false);
    loadAppointments();
    toast({
      title: "Success",
      description: "Appointment created successfully",
    });
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: 'completed' | 'cancelled') => {
    try {
      if (newStatus === 'cancelled') {
        await api.patch(`/api/appointments/${appointmentId}/cancel`);
      } else {
        await api.put(`/api/appointments/${appointmentId}`, { status: newStatus });
      }
      
      loadAppointments();
      toast({
        title: "Success",
        description: `Appointment ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <LocationBasedOperations requireLocation>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          </div>
        </div>
      </LocationBasedOperations>
    );
  }

  const appointmentStats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    today: appointments.filter(a => {
      try {
        // Handle both camelCase and snake_case date fields
        const dateField = a.appointmentDate || (a as any).appointment_date;
        return isToday(parseISO(dateField)) && a.status === 'scheduled';
      } catch {
        return false;
      }
    }).length,
  };

  console.log('Appointment stats:', appointmentStats);
  console.log('Appointments for stats:', appointments);

  return (
    <LocationBasedOperations requireLocation>
      <div className="container mx-auto p-4 space-y-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">
              Manage patient appointments and schedules across all locations
            </p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-auto"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            New Appointment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Total Appointments</p>
                  <p className="text-2xl font-bold text-blue-900">{appointmentStats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">Scheduled</p>
                  <p className="text-2xl font-bold text-green-900">{appointmentStats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-800 text-sm font-medium">Today</p>
                  <p className="text-2xl font-bold text-orange-900">{appointmentStats.today}</p>
                </div>
                <User className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by patient, doctor, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 h-11">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 h-11">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No appointments found' : 'No appointments yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria or filters to find more appointments.' 
                    : 'Get started by scheduling your first patient appointment with our easy-to-use booking system.'}
                </p>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule First Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card 
                key={appointment.id} 
                className="border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Main Info */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-gray-900 text-lg">
                            {appointment.patientName || 'Unknown Patient'}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">with</span>
                          <span className="font-medium text-gray-900">
                            {appointment.doctorName || 'Unknown Doctor'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {getDateDisplay(appointment.appointmentDate || (appointment as any).appointment_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{getTimeDisplay(appointment.startTime, appointment.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.locationName || 'Unknown Location'}</span>
                        </div>
                      </div>
                      
                      {/* Notes */}
                      {appointment.notes && (
                        <div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-400">
                          <p className="text-sm text-gray-700 italic">
                            "{appointment.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions & Status */}
                    <div className="flex items-center gap-4 ml-6">
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusBadge(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getTypeBadge(appointment.type)}>
                          {appointment.type === 'online' ? 'Online' : 'On-site'}
                        </Badge>
                      </div>
                      
                      {appointment.status === 'scheduled' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Appointment Modal */}
        <AddAppointmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAppointmentCreated={handleAppointmentCreated}
          selectedLocation={selectedLocation}
        />
      </div>
    </LocationBasedOperations>
  );
}