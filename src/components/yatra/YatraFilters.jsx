import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  SlidersHorizontal, 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Utensils,
  Wind,
  Waves,
  Coffee,
  Dumbbell,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Home,
  Bed
} from 'lucide-react';

const ACCOMMODATION_TYPES = [
  { id: 'hotel_3star', label: '3-Star Hotels' },
  { id: 'hotel_4star', label: '4-Star Hotels' },
  { id: 'hotel_5star', label: '5-Star Hotels' },
  { id: 'dharamshala', label: 'Dharamshalas (Temple-run)' },
  { id: 'ashram', label: 'Ashramas (Spiritual stays)' },
  { id: 'guesthouse', label: 'Guest Houses' },
  { id: 'budget', label: 'Budget Lodges' },
  { id: 'luxury', label: 'Luxury Resorts' }
];

const DISTANCE_OPTIONS = [
  { id: '1km', label: 'Within 1 km (walking)' },
  { id: '3km', label: '1-3 km (short auto)' },
  { id: '5km', label: '3-5 km' },
  { id: '10km', label: '5-10 km' },
  { id: '10plus', label: '> 10 km' }
];

const AMENITIES = [
  { id: 'parking', label: 'Free Parking', icon: Car },
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'hotwater', label: 'Hot Water 24x7', icon: Coffee },
  { id: 'veg_only', label: 'Vegetarian Food Only', icon: Utensils },
  { id: 'temple_view', label: 'Temple View Rooms', icon: Building2 },
  { id: 'meditation', label: 'Meditation Hall', icon: Home },
  { id: 'yoga', label: 'Yoga Classes', icon: Dumbbell },
  { id: 'laundry', label: 'Laundry Service', icon: Bed },
  { id: 'doctor', label: 'Doctor on Call', icon: Coffee }
];

const MEAL_PLANS = [
  { id: 'room_only', label: 'Room Only' },
  { id: 'breakfast', label: 'Breakfast Included' },
  { id: 'half_board', label: 'Breakfast + Dinner' },
  { id: 'full_board', label: 'All Meals Included' }
];

const SPECIAL_FEATURES = [
  { id: 'wheelchair', label: 'Wheelchair Accessible' },
  { id: 'family_suite', label: 'Family Suites' },
  { id: 'group_discount', label: 'Group Discounts' },
  { id: 'early_checkin', label: 'Early Check-in Available' },
  { id: 'late_checkout', label: 'Late Check-out Available' }
];

export default function YatraFilters({ filters, onFilterChange, resultCount = 0 }) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    type: true,
    distance: true,
    amenities: false,
    meals: false,
    features: false,
    rating: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key, value) => {
    onFilterChange?.({ ...filters, [key]: value });
  };

  const handleArrayToggle = (key, value) => {
    const current = filters[key] || [];
    const newArray = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange(key, newArray);
  };

  const clearFilters = () => {
    onFilterChange?.({
      priceRange: [500, 10000],
      types: [],
      distance: [],
      amenities: [],
      mealPlans: [],
      features: [],
      minRating: 0
    });
  };

  const hasActiveFilters = filters?.types?.length > 0 || 
    filters?.amenities?.length > 0 || 
    filters?.mealPlans?.length > 0 ||
    filters?.features?.length > 0 ||
    filters?.minRating > 0;

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-left"
      >
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-orange-600">
            Clear All
          </Button>
        )}
      </div>

      {/* Result Count */}
      <div className="text-sm text-gray-600 mb-4">
        <span className="font-semibold text-orange-600">{resultCount}</span> stays found
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range (per night)" section="price">
        <div className="px-2">
          <Slider
            value={filters?.priceRange || [500, 10000]}
            onValueChange={(value) => handleChange('priceRange', value)}
            min={500}
            max={10000}
            step={100}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{filters?.priceRange?.[0] || 500}</span>
            <span>₹{filters?.priceRange?.[1] || 10000}</span>
          </div>
        </div>
      </FilterSection>

      {/* Accommodation Type */}
      <FilterSection title="Accommodation Type" section="type">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {ACCOMMODATION_TYPES.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <Checkbox
                id={type.id}
                checked={filters?.types?.includes(type.id)}
                onCheckedChange={() => handleArrayToggle('types', type.id)}
              />
              <Label htmlFor={type.id} className="text-sm cursor-pointer">{type.label}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Distance from Temple */}
      <FilterSection title="Distance from Temple" section="distance">
        <div className="space-y-2">
          {DISTANCE_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Checkbox
                id={option.id}
                checked={filters?.distance?.includes(option.id)}
                onCheckedChange={() => handleArrayToggle('distance', option.id)}
              />
              <Label htmlFor={option.id} className="text-sm cursor-pointer">{option.label}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" section="amenities">
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {AMENITIES.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div key={amenity.id} className="flex items-center gap-2">
                <Checkbox
                  id={amenity.id}
                  checked={filters?.amenities?.includes(amenity.id)}
                  onCheckedChange={() => handleArrayToggle('amenities', amenity.id)}
                />
                <Icon className="w-4 h-4 text-gray-400" />
                <Label htmlFor={amenity.id} className="text-sm cursor-pointer">{amenity.label}</Label>
              </div>
            );
          })}
        </div>
      </FilterSection>

      {/* Meal Plans */}
      <FilterSection title="Meal Plans" section="meals">
        <div className="space-y-2">
          {MEAL_PLANS.map((plan) => (
            <div key={plan.id} className="flex items-center gap-2">
              <Checkbox
                id={plan.id}
                checked={filters?.mealPlans?.includes(plan.id)}
                onCheckedChange={() => handleArrayToggle('mealPlans', plan.id)}
              />
              <Label htmlFor={plan.id} className="text-sm cursor-pointer">{plan.label}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Special Features */}
      <FilterSection title="Special Features" section="features">
        <div className="space-y-2">
          {SPECIAL_FEATURES.map((feature) => (
            <div key={feature.id} className="flex items-center gap-2">
              <Checkbox
                id={feature.id}
                checked={filters?.features?.includes(feature.id)}
                onCheckedChange={() => handleArrayToggle('features', feature.id)}
              />
              <Label htmlFor={feature.id} className="text-sm cursor-pointer">{feature.label}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" section="rating">
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4].map((rating) => (
            <button
              key={rating}
              onClick={() => handleChange('minRating', rating)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all ${
                filters?.minRating === rating
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              {rating === 0 ? 'Any' : (
                <>
                  {rating}+ <Star className="w-3 h-3 fill-current" />
                </>
              )}
            </button>
          ))}
        </div>
      </FilterSection>
    </Card>
  );
}