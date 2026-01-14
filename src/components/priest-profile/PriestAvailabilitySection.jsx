import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarDays, Clock, ChevronLeft, ChevronRight, 
  Check, X, AlertCircle
} from 'lucide-react';
import { format, addDays, isSameDay, startOfWeek, addWeeks } from 'date-fns';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function PriestAvailabilitySection({ provider, onSelectSlot }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'week'

  const weeklySchedule = provider.weekly_schedule || [];
  const unavailableDates = provider.unavailable_dates || [];

  // Get slots for selected date
  const slotsForDate = useMemo(() => {
    const dayName = DAYS[selectedDate.getDay()];
    const daySchedule = weeklySchedule.find(d => d.day === dayName);
    
    // Check if date is unavailable
    const isUnavailable = unavailableDates.some(ud => 
      isSameDay(new Date(ud.date), selectedDate)
    );

    if (isUnavailable || !daySchedule?.is_available) {
      return [];
    }

    return daySchedule?.slots || [];
  }, [selectedDate, weeklySchedule, unavailableDates]);

  // Generate next 7 days quick view
  const next7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i);
      const dayName = DAYS[date.getDay()];
      const daySchedule = weeklySchedule.find(d => d.day === dayName);
      const isUnavailable = unavailableDates.some(ud => 
        isSameDay(new Date(ud.date), date)
      );
      
      return {
        date,
        dayName: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        isAvailable: !isUnavailable && daySchedule?.is_available,
        slots: daySchedule?.slots || []
      };
    });
  }, [weeklySchedule, unavailableDates]);

  // Check if a date should be disabled
  const isDateDisabled = (date) => {
    if (date < new Date()) return true;
    const dayName = DAYS[date.getDay()];
    const daySchedule = weeklySchedule.find(d => d.day === dayName);
    const isUnavailable = unavailableDates.some(ud => 
      isSameDay(new Date(ud.date), date)
    );
    return isUnavailable || !daySchedule?.is_available;
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Availability</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week View
            </Button>
          </div>
        </div>

        {/* Quick 7-Day View */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {next7Days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(day.date)}
              disabled={!day.isAvailable}
              className={`flex-shrink-0 w-14 p-2 rounded-xl text-center transition-all ${
                isSameDay(selectedDate, day.date)
                  ? 'bg-blue-500 text-white'
                  : day.isAvailable
                    ? 'bg-gray-50 hover:bg-blue-50 text-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="text-xs font-medium">{day.dayName}</div>
              <div className="text-lg font-bold">{day.dayNum}</div>
              <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                day.isAvailable ? 'bg-green-400' : 'bg-red-400'
              }`} />
            </button>
          ))}
        </div>

        {viewMode === 'calendar' ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Calendar */}
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={isDateDisabled}
                className="rounded-xl border p-3"
              />
            </div>

            {/* Slots for Selected Date */}
            <div className="flex-1">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <p className="text-sm text-gray-500">
                  {slotsForDate.length > 0 
                    ? `${slotsForDate.length} time slots available`
                    : 'No slots available'
                  }
                </p>
              </div>

              {slotsForDate.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {slotsForDate.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectSlot?.({ date: selectedDate, slot })}
                      className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-center transition-all"
                    >
                      <Clock className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Not available on this date</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Week View */
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const schedule = weeklySchedule.find(d => d.day === day);
                  return (
                    <div key={day} className="text-center">
                      <div className="font-semibold text-gray-700 capitalize mb-2">
                        {day.slice(0, 3)}
                      </div>
                      <div className={`p-2 rounded-xl ${
                        schedule?.is_available 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-100'
                      }`}>
                        {schedule?.is_available ? (
                          schedule.slots?.map((slot, idx) => (
                            <div key={idx} className="text-xs text-gray-600 py-1">
                              {slot.start_time}-{slot.end_time}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 py-2">Unavailable</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <span className="text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}