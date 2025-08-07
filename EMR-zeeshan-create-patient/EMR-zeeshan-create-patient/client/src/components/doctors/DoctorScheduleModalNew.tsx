import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/UI/dialog';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Textarea } from '@/components/UI/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Switch } from '@/components/UI/switch';
import { Calendar, Clock, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/utils/apiClient';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

interface DoctorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number;
  doctorName: string;
  clinicId: number;
  type:string
}

interface ScheduleEntry {
  id?: number;
  doctorId: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isActive: boolean;
  notes?: string;
}

const DoctorScheduleModalNew: React.FC<DoctorScheduleModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  clinicId,
  type
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);
  // New weekly schedule state for table input
  type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  interface DaySchedule {
    isWorkingDay: boolean;
    startTime: string;
    endTime: string;
    breaks: { startTime: string; endTime: string; type: string }[];
  }
  const [weeklySchedule, setWeeklySchedule] = useState<Record<DayKey, DaySchedule>>({
    sunday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
    monday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
    tuesday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
    wednesday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
    thursday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
    friday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
    saturday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
  });
  const [slotDuration, setSlotDuration] = useState(45);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [showAddTimeOff, setShowAddTimeOff] = useState(false);

  const daysOfWeek = [
    { name: 'Sunday', value: 0 },
    { name: 'Monday', value: 1 },
    { name: 'Tuesday', value: 2 },
    { name: 'Wednesday', value: 3 },
    { name: 'Thursday', value: 4 },
    { name: 'Friday', value: 5 },
    { name: 'Saturday', value: 6 }
  ];

  const timeOffReasons = [
    'Vacation', 'Sick Leave', 'Personal', 'Conference',
    'Training', 'Emergency', 'Other'
  ];

  // Load schedule data
  const loadScheduleData = async () => {
    if (!doctorId || doctorId === 0) return;

    try {
      setLoading(true);
      const activeOnly = true; // or set this based on your logic
      const response = await api.get(`/api/schedules/user/${doctorId}?active_only=${activeOnly}`);
      console.log('Schedule API response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const scheduleObj = response.data[0];
        if (scheduleObj && scheduleObj.weeklySchedule) {
          setWeeklySchedule(scheduleObj.weeklySchedule);
          setSlotDuration(scheduleObj.slotDuration || 45);
          setEffectiveFrom(scheduleObj.effectiveFrom || '');
          setCurrentScheduleId(scheduleObj.id);
        } else {
          setWeeklySchedule({
            sunday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
            monday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
            tuesday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
            wednesday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
            thursday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
            friday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
            saturday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          });
          setCurrentScheduleId(null);
          setShowAddSchedule(true)
        }
      } else {
        setWeeklySchedule({
          sunday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          monday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          tuesday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          wednesday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          thursday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          friday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
          saturday: { isWorkingDay: false, startTime: '', endTime: '', breaks: [] },
        });
        setCurrentScheduleId(null);
        setShowAddSchedule(true)
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && doctorId && doctorId > 0) {
      loadScheduleData();
    }
  }, [isOpen, doctorId]);

  const handleSaveSchedule = async () => {
    try {
      // Validate working days have start and end time
      for (const [day, value] of Object.entries(weeklySchedule)) {
        if (value.isWorkingDay && (!value.startTime || !value.endTime)) {
          toast({
            title: 'Validation Error',
            description: `Start and End time are required for ${day.charAt(0).toUpperCase() + day.slice(1)}`,
            variant: 'destructive',
          });
          return;
        }
      }
      // Prepare weeklySchedule for API
      const formattedWeeklySchedule: { [key: string]: any } = {};
      Object.entries(weeklySchedule).forEach(([day, value]) => {
        formattedWeeklySchedule[day] = {
          isWorkingDay: value.isWorkingDay,
          startTime: value.isWorkingDay ? value.startTime : "",
          endTime: value.isWorkingDay ? value.endTime : "",
          breaks: value.breaks || [],
        };
      });
      const body = {
        clinicId,
        userId: doctorId,
        userType: type,
        weeklySchedule: formattedWeeklySchedule,
        slotDuration,
        isActive: true,
        effectiveFrom,
      };
      if (currentScheduleId) {
        await api.put(`/api/schedules/${currentScheduleId}`, body);
        toast({
          title: 'Success',
          description: 'Weekly schedule updated successfully',
        });
      } else {
        await api.post('/api/schedules', body);
        toast({
          title: 'Success',
          description: 'Weekly schedule added successfully',
        });
      }
      setShowAddSchedule(false);
      await loadScheduleData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save schedule',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await api.delete(`/api/doctor-schedules/${scheduleId}`);

      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });

      await loadScheduleData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };


  const resetForm = () => {
    setShowAddSchedule(false);
    setShowAddTimeOff(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Management - {doctorName}
          </DialogTitle>
          <DialogDescription>
            Manage weekly schedules and time-off requests for this {type}.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Weekly Schedule</h3>
              <Button
                onClick={() => setShowAddSchedule(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {currentScheduleId ? 'Update Schedule' : 'Add Schedule'}
              </Button>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading schedule..." />
            ) : (
              <div className="space-y-4">
                {/* Weekly Schedule Table - View or Edit/Add */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Weekly Schedule</span>
                      {showAddSchedule && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddSchedule(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border">Day</th>
                            <th className="p-2 border">Working</th>
                            <th className="p-2 border">Start Time</th>
                            <th className="p-2 border">End Time</th>
                            <th className="p-2 border">Breaks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(weeklySchedule).map((day) => {
                            const dayKey = day as DayKey;
                            return (
                              <tr key={dayKey}>
                                <td className="p-2 border font-semibold capitalize">{dayKey}</td>
                                <td className="p-2 border">
                                  <Switch
                                    checked={weeklySchedule[dayKey].isWorkingDay}
                                    disabled={!showAddSchedule}
                                    onCheckedChange={checked => showAddSchedule && setWeeklySchedule({
                                      ...weeklySchedule,
                                      [dayKey]: { ...weeklySchedule[dayKey], isWorkingDay: checked }
                                    })}
                                  />
                                </td>
                                <td className="p-2 border">
                                  <Input
                                    type="time"
                                    value={weeklySchedule[dayKey].startTime}
                                    disabled={!weeklySchedule[dayKey].isWorkingDay || !showAddSchedule}
                                    onChange={e => showAddSchedule && setWeeklySchedule({
                                      ...weeklySchedule,
                                      [dayKey]: { ...weeklySchedule[dayKey], startTime: e.target.value }
                                    })}
                                  />
                                </td>
                                <td className="p-2 border">
                                  <Input
                                    type="time"
                                    value={weeklySchedule[dayKey].endTime}
                                    disabled={!weeklySchedule[dayKey].isWorkingDay || !showAddSchedule}
                                    onChange={e => showAddSchedule && setWeeklySchedule({
                                      ...weeklySchedule,
                                      [dayKey]: { ...weeklySchedule[dayKey], endTime: e.target.value }
                                    })}
                                  />
                                </td>
                                <td className="p-2 border">
                                  <div className="flex flex-col gap-2">
                                    {weeklySchedule[dayKey].breaks.map((brk, idx) => (
                                      <div key={idx} className="flex gap-2 items-center">
                                        <Input
                                          type="time"
                                          value={brk.startTime}
                                          disabled={!weeklySchedule[dayKey].isWorkingDay || !showAddSchedule}
                                          placeholder="Break Start"
                                          onChange={e => {
                                            if (!showAddSchedule) return;
                                            const breaks = [...weeklySchedule[dayKey].breaks];
                                            breaks[idx].startTime = e.target.value;
                                            setWeeklySchedule({
                                              ...weeklySchedule,
                                              [dayKey]: { ...weeklySchedule[dayKey], breaks }
                                            });
                                          }}
                                        />
                                        <span>-</span>
                                        <Input
                                          type="time"
                                          value={brk.endTime}
                                          disabled={!weeklySchedule[dayKey].isWorkingDay || !showAddSchedule}
                                          placeholder="Break End"
                                          onChange={e => {
                                            if (!showAddSchedule) return;
                                            const breaks = [...weeklySchedule[dayKey].breaks];
                                            breaks[idx].endTime = e.target.value;
                                            setWeeklySchedule({
                                              ...weeklySchedule,
                                              [dayKey]: { ...weeklySchedule[dayKey], breaks }
                                            });
                                          }}
                                        />
                                        {showAddSchedule && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const breaks = weeklySchedule[dayKey].breaks.filter((_, i) => i !== idx);
                                              setWeeklySchedule({
                                                ...weeklySchedule,
                                                [dayKey]: { ...weeklySchedule[dayKey], breaks }
                                              });
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    {showAddSchedule && weeklySchedule[dayKey].isWorkingDay && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-1"
                                        onClick={() => {
                                          setWeeklySchedule({
                                            ...weeklySchedule,
                                            [dayKey]: {
                                              ...weeklySchedule[dayKey],
                                              breaks: [
                                                ...weeklySchedule[dayKey].breaks,
                                                { startTime: '', endTime: '', type: 'lunch' }
                                              ]
                                            }
                                          });
                                        }}
                                      >
                                        + Add Break
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {showAddSchedule && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                            <Input
                              id="slotDuration"
                              type="number"
                              min={1}
                              value={slotDuration}
                              onChange={e => setSlotDuration(Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="effectiveFrom">Effective From</Label>
                            <Input
                              id="effectiveFrom"
                              type="date"
                              value={effectiveFrom}
                              onChange={e => setEffectiveFrom(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddSchedule(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveSchedule}
                            disabled={Object.values(weeklySchedule).every(day => !day.isWorkingDay || (!day.startTime || !day.endTime)) || !slotDuration || !effectiveFrom}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {currentScheduleId ? 'Update Weekly Schedule' : 'Save Weekly Schedule'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorScheduleModalNew;