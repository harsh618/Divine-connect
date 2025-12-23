import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, MapPin, Building2 } from 'lucide-react';

export default function ServiceModeSelector({ selectedMode, onSelect, templeId }) {
  const modes = [
    {
      id: 'virtual',
      title: 'Online Pooja',
      description: 'Join virtually via video call from anywhere',
      icon: Video,
      color: 'blue',
      available: true
    },
    {
      id: 'in_person',
      title: 'Onsite Pooja',
      description: 'Priest visits your location',
      icon: MapPin,
      color: 'green',
      available: true
    },
    {
      id: 'temple',
      title: 'Temple Pooja',
      description: 'Pooja performed at the temple on your behalf',
      icon: Building2,
      color: 'orange',
      available: !!templeId
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.id;
        const isAvailable = mode.available;

        return (
          <Card
            key={mode.id}
            onClick={() => isAvailable && onSelect(mode.id)}
            className={`p-5 cursor-pointer transition-all ${
              !isAvailable 
                ? 'opacity-50 cursor-not-allowed' 
                : isSelected
                ? `border-2 border-${mode.color}-500 bg-${mode.color}-50`
                : 'hover:border-gray-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg bg-${mode.color}-100 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 text-${mode.color}-600`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{mode.title}</h3>
                <p className="text-sm text-gray-600">{mode.description}</p>
                {isSelected && (
                  <Badge className={`mt-2 bg-${mode.color}-500`}>Selected</Badge>
                )}
                {!isAvailable && (
                  <Badge variant="secondary" className="mt-2">Not Available</Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}