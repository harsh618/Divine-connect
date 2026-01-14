import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from 'lucide-react';

// Predefined quick slots
const QUICK_SLOTS = [
  { label: 'Early Morning (5-6 AM)', value: '5:00 AM' },
  { label: 'Morning (6-9 AM)', value: '6:00 AM' },
  { label: 'Late Morning (9-12 PM)', value: '9:00 AM' },
  { label: 'Afternoon (12-3 PM)', value: '12:00 PM' },
  { label: 'Evening (4-7 PM)', value: '4:00 PM' },
  { label: 'Night (7-9 PM)', value: '7:00 PM' },
];

/**
 * Custom Time Slot Picker Component
 * Allows users to either select a predefined slot or enter a custom time
 */
export default function TimeSlotPicker({ 
  value, 
  onChange, 
  label = "Select Time",
  showCustomOption = true,
  quickSlots = QUICK_SLOTS
}) {
  const [isCustom, setIsCustom] = useState(false);
  const [customHour, setCustomHour] = useState('9');
  const [customMinute, setCustomMinute] = useState('00');
  const [customPeriod, setCustomPeriod] = useState('AM');

  const handleQuickSlotChange = (slot) => {
    setIsCustom(false);
    onChange(slot);
  };

  const handleCustomTimeChange = () => {
    const formattedTime = `${customHour}:${customMinute} ${customPeriod}`;
    onChange(formattedTime);
  };

  const toggleCustom = () => {
    setIsCustom(!isCustom);
    if (!isCustom) {
      // When switching to custom, set a default time
      handleCustomTimeChange();
    }
  };

  // Hours for dropdown (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  
  // Minutes for dropdown
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="space-y-3">
      <Label className="font-semibold block">{label}</Label>
      
      {!isCustom ? (
        <div className="space-y-2">
          <Select value={value} onValueChange={handleQuickSlotChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a time slot">
                {value && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{value}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {quickSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{slot.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showCustomOption && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleCustom}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 w-full justify-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Set Custom Time
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">Custom Time</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleCustom}
              className="text-amber-600 hover:text-amber-700 h-auto py-1"
            >
              Use Quick Slots
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Hour */}
            <Select value={customHour} onValueChange={(v) => {
              setCustomHour(v);
              setTimeout(handleCustomTimeChange, 0);
            }}>
              <SelectTrigger className="w-20 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <span className="text-xl font-bold text-amber-600">:</span>
            
            {/* Minute */}
            <Select value={customMinute} onValueChange={(v) => {
              setCustomMinute(v);
              setTimeout(handleCustomTimeChange, 0);
            }}>
              <SelectTrigger className="w-20 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* AM/PM */}
            <Select value={customPeriod} onValueChange={(v) => {
              setCustomPeriod(v);
              setTimeout(handleCustomTimeChange, 0);
            }}>
              <SelectTrigger className="w-20 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-amber-800">
              Selected: {customHour}:{customMinute} {customPeriod}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}