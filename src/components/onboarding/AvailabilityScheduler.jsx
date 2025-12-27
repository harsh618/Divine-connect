import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, X, Plus } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AvailabilityScheduler({ weeklySchedule, setWeeklySchedule, defaultSlotDuration, setDefaultSlotDuration, unavailableDates, setUnavailableDates }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateReason, setDateReason] = useState('');

  const initializeDay = (day) => {
    const existing = weeklySchedule.find(s => s.day === day);
    if (existing) return existing;
    return {
      day,
      is_available: true,
      slots: [{ start_time: '09:00', end_time: '17:00' }]
    };
  };

  const updateDayAvailability = (day, isAvailable) => {
    setWeeklySchedule(prev => {
      const filtered = prev.filter(s => s.day !== day);
      if (isAvailable) {
        return [...filtered, {
          day,
          is_available: true,
          slots: [{ start_time: '09:00', end_time: '17:00' }]
        }];
      }
      return [...filtered, { day, is_available: false, slots: [] }];
    });
  };

  const updateDaySlots = (day, slotIndex, field, value) => {
    setWeeklySchedule(prev => {
      const daySchedule = prev.find(s => s.day === day) || initializeDay(day);
      const updatedSlots = [...daySchedule.slots];
      updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
      
      return [
        ...prev.filter(s => s.day !== day),
        { ...daySchedule, slots: updatedSlots }
      ];
    });
  };

  const addSlot = (day) => {
    setWeeklySchedule(prev => {
      const daySchedule = prev.find(s => s.day === day) || initializeDay(day);
      return [
        ...prev.filter(s => s.day !== day),
        { ...daySchedule, slots: [...daySchedule.slots, { start_time: '09:00', end_time: '17:00' }] }
      ];
    });
  };

  const removeSlot = (day, slotIndex) => {
    setWeeklySchedule(prev => {
      const daySchedule = prev.find(s => s.day === day);
      if (!daySchedule) return prev;
      
      return [
        ...prev.filter(s => s.day !== day),
        { ...daySchedule, slots: daySchedule.slots.filter((_, i) => i !== slotIndex) }
      ];
    });
  };

  const addUnavailableDate = () => {
    if (selectedDate) {
      setUnavailableDates(prev => [
        ...prev,
        {
          date: selectedDate.toISOString().split('T')[0],
          reason: dateReason || 'Not available'
        }
      ]);
      setSelectedDate(null);
      setDateReason('');
    }
  };

  const removeUnavailableDate = (index) => {
    setUnavailableDates(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Slot Duration */}
      <Card className="p-4">
        <Label className="mb-2 block">Default Slot Duration (minutes) *</Label>
        <Input
          type="number"
          value={defaultSlotDuration}
          onChange={(e) => setDefaultSlotDuration(Number(e.target.value))}
          placeholder="30"
          className="max-w-xs"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be your standard booking duration (e.g., 30 or 60 minutes)
        </p>
      </Card>

      {/* Weekly Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Weekly Availability
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Set your recurring working hours for each day of the week
        </p>

        <div className="space-y-4">
          {DAYS.map(day => {
            const daySchedule = weeklySchedule.find(s => s.day === day) || { day, is_available: false, slots: [] };
            
            return (
              <div key={day} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={daySchedule.is_available}
                      onCheckedChange={(checked) => updateDayAvailability(day, checked)}
                    />
                    <span className="font-medium capitalize">{day}</span>
                  </label>
                  {daySchedule.is_available && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addSlot(day)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Slot
                    </Button>
                  )}
                </div>

                {daySchedule.is_available && daySchedule.slots.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {daySchedule.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateDaySlots(day, idx, 'start_time', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateDaySlots(day, idx, 'end_time', e.target.value)}
                          className="w-32"
                        />
                        {daySchedule.slots.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
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

      {/* Exception Dates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Mark Unavailable Dates
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select specific dates when you're not available (holidays, personal days, etc.)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-lg border"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label className="mb-2 block">Reason (Optional)</Label>
              <Input
                placeholder="e.g., Festival, Personal leave"
                value={dateReason}
                onChange={(e) => setDateReason(e.target.value)}
              />
            </div>
            <Button
              onClick={addUnavailableDate}
              disabled={!selectedDate}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mark Date Unavailable
            </Button>

            {unavailableDates.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Marked Dates:</h4>
                {unavailableDates.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                      {item.reason && <span className="text-gray-600 ml-2">- {item.reason}</span>}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeUnavailableDate(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}