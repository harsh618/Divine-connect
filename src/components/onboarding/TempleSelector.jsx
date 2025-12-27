import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Check, Search } from 'lucide-react';

export default function TempleSelector({ associatedTemples, setAssociatedTemples }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: temples, isLoading } = useQuery({
    queryKey: ['temples-list'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false }),
    enabled: showDropdown
  });

  const filteredTemples = temples?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isTempleSelected = (templeId) => {
    return associatedTemples.some(t => t.temple_id === templeId);
  };

  const toggleTemple = (temple) => {
    const existing = associatedTemples.find(t => t.temple_id === temple.id);
    
    if (existing) {
      // Remove temple
      setAssociatedTemples(prev => prev.filter(t => t.temple_id !== temple.id));
    } else {
      // Add temple
      setAssociatedTemples(prev => [
        ...prev,
        {
          temple_id: temple.id,
          temple_name: temple.name,
          city: temple.city,
          state: temple.state,
          role: '',
          years_serving: 0,
          accepts_temple_visits: false
        }
      ]);
    }
  };

  const updateTempleDetails = (templeId, field, value) => {
    setAssociatedTemples(prev =>
      prev.map(t =>
        t.temple_id === templeId ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Temple Search */}
      <Card className="p-4">
        <Label className="mb-2 block">Search & Select Associated Temple(s) *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search temple by name or city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="pl-10"
          />
        </div>

        {showDropdown && (
          <Card className="mt-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading temples...</div>
            ) : filteredTemples.length > 0 ? (
              <div className="divide-y">
                {filteredTemples.map(temple => (
                  <button
                    key={temple.id}
                    onClick={() => {
                      toggleTemple(temple);
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{temple.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {temple.city}, {temple.state}
                        </p>
                      </div>
                    </div>
                    {isTempleSelected(temple.id) && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No temples found. Try a different search.
              </div>
            )}
          </Card>
        )}
      </Card>

      {/* Selected Temples */}
      {associatedTemples.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Selected Temples & Details</h3>
          {associatedTemples.map((temple, idx) => (
            <Card key={idx} className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {temple.temple_name}
                  </h4>
                  <p className="text-sm text-gray-600">{temple.city}, {temple.state}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAssociatedTemples(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs mb-1">Your Role</Label>
                  <Input
                    placeholder="e.g., Head Priest, Resident Astrologer"
                    value={temple.role}
                    onChange={(e) => updateTempleDetails(temple.temple_id, 'role', e.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1">Years Serving</Label>
                  <Input
                    type="number"
                    placeholder="Years"
                    value={temple.years_serving}
                    onChange={(e) => updateTempleDetails(temple.temple_id, 'years_serving', Number(e.target.value))}
                    size="sm"
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-orange-300">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={temple.accepts_temple_visits}
                    onCheckedChange={(checked) =>
                      updateTempleDetails(temple.temple_id, 'accepts_temple_visits', checked)
                    }
                  />
                  <div>
                    <p className="font-medium text-sm">I accept "Temple Visit" bookings</p>
                    <p className="text-xs text-gray-600 mt-1">
                      By checking this, you'll be available to guide devotees during their darshan at this temple. 
                      Users can book you directly from the temple page.
                    </p>
                  </div>
                </label>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}