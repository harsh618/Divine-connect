import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  X, 
  Plus, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, isSameDay } from 'date-fns';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00'
];

export default function PriestCalendarManager({ profile, bookings = [] }) {
  const queryClient = useQueryClient();
  
  const [weeklySchedule, setWeeklySchedule] = useState(
    profile?.weekly_schedule || DAYS.map(day => ({
      day,
      is_available: day !== 'sunday',
      slots: day !== 'sunday' ? [{ start_time: '09:00', end_time: '18:00' }] : []
    }))
  );
  
  const [defaultSlotDuration, setDefaultSlotDuration] = useState(
    profile?.default_slot_duration || 60
  );
  
  const [unavailableDates, setUnavailableDates] = useState(
    profile?.unavailable_dates || []
  );
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateReason, setDateReason] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Save schedule mutation
  const saveScheduleMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ProviderProfile.update(profile.id, {
        weekly_schedule: weeklySchedule,
        default_slot_duration: defaultSlotDuration,
        unavailable_dates: unavailableDates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-profile']);
      toast.success('Schedule saved successfully!');
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error('Failed to save schedule: ' + error.message);
    }
  });

  const updateDayAvailability = (day, isAvailable) => {
    setWeeklySchedule(prev => {
      const filtered = prev.filter(s => s.day !== day);
      return [...filtered, {
        day,
        is_available: isAvailable,
        slots: isAvailable ? [{ start_time: '09:00', end_time: '18:00' }] : []
      }];
    });
    setHasChanges(true);
  };

  const updateDaySlots = (day, slotIndex, field, value) => {
    setWeeklySchedule(prev => {
      const daySchedule = prev.find(s => s.day === day);
      if (!daySchedule) return prev;
      
      const updatedSlots = [...daySchedule.slots];
      updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
      
      return prev.map(s => s.day === day ? { ...s, slots: updatedSlots } : s);
    });
    setHasChanges(true);
  };

  const addSlot = (day) => {
    setWeeklySchedule(prev => {
      return prev.map(s => {
        if (s.day === day) {
          return { ...s, slots: [...s.slots, { start_time: '14:00', end_time: '18:00' }] };
        }
        return s;
      });
    });
    setHasChanges(true);
  };

  const removeSlot = (day, slotIndex) => {
    setWeeklySchedule(prev => {
      return prev.map(s => {
        if (s.day === day) {
          return { ...s, slots: s.slots.filter((_, i) => i !== slotIndex) };
        }
        return s;
      });
    });
    setHasChanges(true);
  };

  const addUnavailableDate = () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (!unavailableDates.find(d => d.date === dateStr)) {
        setUnavailableDates(prev => [...prev, {
          date: dateStr,
          reason: dateReason || 'Not available'
        }]);
        setHasChanges(true);
      }
      setSelectedDate(null);
      setDateReason('');
    }
  };

  const removeUnavailableDate = (index) => {
    setUnavailableDates(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Get bookings for next 7 days for preview
  const getBookingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => b.date === dateStr && ['pending', 'confirmed'].includes(b.status));
  };

  const isDateUnavailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailableDates.some(d => d.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Save Button - Fixed at top when changes exist */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">You have unsaved changes</span>
          </div>
          <Button 
            onClick={() => saveScheduleMutation.mutate()}
            disabled={saveScheduleMutation.isPending}
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveScheduleMutation.isPending ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      )}

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="exceptions">Exception Dates</TabsTrigger>
          <TabsTrigger value="preview">7-Day Preview</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule Tab */}
        <TabsContent value="weekly" className="space-y-4">
          <Card className="p-4">
            <Label className="mb-2 block">Default Slot Duration (minutes)</Label>
            <Input
              type="number"
              value={defaultSlotDuration}
              onChange={(e) => {
                setDefaultSlotDuration(Number(e.target.value));
                setHasChanges(true);
              }}
              placeholder="60"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Standard booking duration for each pooja
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Weekly Availability
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Set your recurring working hours. Devotees can only book during these times.
            </p>

            <div className="space-y-4">
              {DAYS.map(day => {
                const daySchedule = weeklySchedule.find(s => s.day === day) || { 
                  day, is_available: false, slots: [] 
                };
                
                return (
                  <div key={day} className={`border rounded-lg p-4 ${daySchedule.is_available ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={daySchedule.is_available}
                          onCheckedChange={(checked) => updateDayAvailability(day, checked)}
                        />
                        <span className="font-semibold capitalize text-lg">{day}</span>
                        {daySchedule.is_available ? (
                          <Badge className="bg-green-100 text-green-700">Available</Badge>
                        ) : (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                      </label>
                      {daySchedule.is_available && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addSlot(day)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Time Slot
                        </Button>
                      )}
                    </div>

                    {daySchedule.is_available && daySchedule.slots.length > 0 && (
                      <div className="space-y-3 ml-8">
                        {daySchedule.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                            <span className="text-sm text-gray-500 min-w-[40px]">From</span>
                            <select
                              value={slot.start_time}
                              onChange={(e) => updateDaySlots(day, idx, 'start_time', e.target.value)}
                              className="border rounded-md px-3 py-2"
                            >
                              {TIME_SLOTS.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="text-sm text-gray-500">to</span>
                            <select
                              value={slot.end_time}
                              onChange={(e) => updateDaySlots(day, idx, 'end_time', e.target.value)}
                              className="border rounded-md px-3 py-2"
                            >
                              {TIME_SLOTS.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            {daySchedule.slots.length > 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => removeSlot(day, idx)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Exception Dates Tab */}
        <TabsContent value="exceptions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-orange-600" />
              Mark Unavailable Dates
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Block specific dates when you won't be available (festivals, personal days, travel, etc.)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || isDateUnavailable(date)}
                  className="rounded-lg border"
                  modifiers={{
                    unavailable: unavailableDates.map(d => new Date(d.date))
                  }}
                  modifiersStyles={{
                    unavailable: { backgroundColor: '#FEE2E2', color: '#DC2626' }
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Reason (Optional)</Label>
                  <Input
                    placeholder="e.g., Attending festival, Personal leave"
                    value={dateReason}
                    onChange={(e) => setDateReason(e.target.value)}
                  />
                </div>
                <Button
                  onClick={addUnavailableDate}
                  disabled={!selectedDate}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Block This Date
                </Button>

                {unavailableDates.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Blocked Dates:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {unavailableDates
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div>
                              <span className="font-medium text-red-700">
                                {format(new Date(item.date), 'PPP')}
                              </span>
                              {item.reason && (
                                <span className="text-gray-600 text-sm ml-2">— {item.reason}</span>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-100"
                              onClick={() => removeUnavailableDate(idx)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 7-Day Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Next 7 Days Preview</h3>
            <p className="text-sm text-gray-600 mb-6">
              See your availability and existing bookings for the upcoming week
            </p>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = addDays(new Date(), i);
                const dayName = format(date, 'EEEE').toLowerCase();
                const daySchedule = weeklySchedule.find(s => s.day === dayName);
                const dayBookings = getBookingsForDate(date);
                const isBlocked = isDateUnavailable(date);

                return (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border-2 ${
                      isBlocked 
                        ? 'bg-red-50 border-red-200' 
                        : daySchedule?.is_available 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="font-semibold">{format(date, 'EEE')}</p>
                      <p className="text-2xl font-bold">{format(date, 'd')}</p>
                      <p className="text-xs text-gray-500">{format(date, 'MMM')}</p>
                    </div>

                    {isBlocked ? (
                      <Badge className="w-full justify-center bg-red-100 text-red-700">
                        Blocked
                      </Badge>
                    ) : daySchedule?.is_available ? (
                      <>
                        <Badge className="w-full justify-center bg-green-100 text-green-700 mb-2">
                          Available
                        </Badge>
                        {daySchedule.slots.map((slot, idx) => (
                          <p key={idx} className="text-xs text-center text-gray-600">
                            {slot.start_time} - {slot.end_time}
                          </p>
                        ))}
                        {dayBookings.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-medium text-orange-600">
                              {dayBookings.length} booking(s)
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="w-full justify-center">
                        Off
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}