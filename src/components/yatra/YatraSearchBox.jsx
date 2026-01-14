import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';
import { format, addDays } from 'date-fns';

const POPULAR_PILGRIMAGES = [
  { name: 'Golden Temple, Amritsar', image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=200' },
  { name: 'Vaishno Devi, Katra', image: 'https://images.unsplash.com/photo-1591018653367-7d24e8bc519f?w=200' },
  { name: 'Sabarimala, Kerala', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200' },
  { name: 'Shirdi Sai Baba', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=200' },
  { name: 'Tirupati Balaji', image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=200' },
  { name: 'Varanasi Ghats', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200' },
];

const AUTOCOMPLETE_SUGGESTIONS = [
  { type: 'temple', name: 'Tirupati Balaji Temple', city: 'Tirupati' },
  { type: 'city', name: 'Varanasi', temples: 15 },
  { type: 'circuit', name: 'Char Dham Yatra', days: '12-14' },
  { type: 'temple', name: 'Kashi Vishwanath Temple', city: 'Varanasi' },
  { type: 'city', name: 'Haridwar', temples: 8 },
  { type: 'temple', name: 'Siddhivinayak Temple', city: 'Mumbai' },
];

export default function YatraSearchBox({ onSearch }) {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 3));
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    seniors: 0,
    infants: 0
  });

  const totalGuests = guests.adults + guests.children + guests.seniors + guests.infants;

  const filteredSuggestions = AUTOCOMPLETE_SUGGESTIONS.filter(s =>
    s.name.toLowerCase().includes(destination.toLowerCase())
  );

  const handleSearch = () => {
    onSearch?.({
      destination,
      checkIn,
      checkOut,
      guests
    });
  };

  const GuestCounter = ({ label, value, onIncrease, onDecrease, min = 0 }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={onDecrease}
          disabled={value <= min}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={onIncrease}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Search Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-serif text-center mb-6">Find Perfect Stay for Your Pilgrimage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Destination */}
          <div className="relative md:col-span-1">
            <label className="text-xs text-gray-500 font-medium mb-1 block">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
              <input
                type="text"
                placeholder="Temple, city or circuit..."
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(destination.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-orange-500 transition-all"
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border z-50 max-h-64 overflow-y-auto">
                  {filteredSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDestination(s.name);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        s.type === 'temple' ? 'bg-orange-100' :
                        s.type === 'city' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <MapPin className={`w-4 h-4 ${
                          s.type === 'temple' ? 'text-orange-600' :
                          s.type === 'city' ? 'text-blue-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">
                          {s.type === 'temple' ? `Temple in ${s.city}` :
                           s.type === 'city' ? `${s.temples} temples` :
                           `${s.days} day circuit`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Check-in */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Check-in</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-gray-50 border-0 hover:bg-gray-100">
                  <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                  {format(checkIn, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    if (date) {
                      setCheckIn(date);
                      if (checkOut <= date) {
                        setCheckOut(addDays(date, 1));
                      }
                    }
                  }}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Check-out</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-gray-50 border-0 hover:bg-gray-100">
                  <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                  {format(checkOut, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={(date) => date && setCheckOut(date)}
                  disabled={(date) => date <= checkIn}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Guests</label>
            <Popover open={showGuestPicker} onOpenChange={setShowGuestPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-gray-50 border-0 hover:bg-gray-100">
                  <Users className="w-4 h-4 mr-2 text-orange-500" />
                  {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <GuestCounter 
                    label="Adults" 
                    value={guests.adults} 
                    min={1}
                    onIncrease={() => setGuests({ ...guests, adults: guests.adults + 1 })}
                    onDecrease={() => setGuests({ ...guests, adults: Math.max(1, guests.adults - 1) })}
                  />
                  <GuestCounter 
                    label="Children (5-12)" 
                    value={guests.children}
                    onIncrease={() => setGuests({ ...guests, children: guests.children + 1 })}
                    onDecrease={() => setGuests({ ...guests, children: Math.max(0, guests.children - 1) })}
                  />
                  <GuestCounter 
                    label="Seniors (60+)" 
                    value={guests.seniors}
                    onIncrease={() => setGuests({ ...guests, seniors: guests.seniors + 1 })}
                    onDecrease={() => setGuests({ ...guests, seniors: Math.max(0, guests.seniors - 1) })}
                  />
                  <GuestCounter 
                    label="Infants (0-4)" 
                    value={guests.infants}
                    onIncrease={() => setGuests({ ...guests, infants: guests.infants + 1 })}
                    onDecrease={() => setGuests({ ...guests, infants: Math.max(0, guests.infants - 1) })}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          onClick={handleSearch}
          className="w-full mt-4 h-12 bg-orange-500 hover:bg-orange-600 rounded-xl text-lg"
        >
          <Search className="w-5 h-5 mr-2" />
          Search Stays
        </Button>
      </div>

      {/* Popular Pilgrimages */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Popular Pilgrimages</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {POPULAR_PILGRIMAGES.map((place, idx) => (
            <button
              key={idx}
              onClick={() => setDestination(place.name)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all"
            >
              <img src={place.image} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium whitespace-nowrap">{place.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}