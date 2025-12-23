import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Award, TrendingUp, CheckCircle } from 'lucide-react';

export default function PriestSelector({ 
  availablePriests, 
  selectedPriestId, 
  onSelect,
  serviceMode,
  showAllOption = true 
}) {
  const [showAll, setShowAll] = useState(false);

  if (!availablePriests || availablePriests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No priests available for this slot</p>
      </div>
    );
  }

  const displayedPriests = showAll ? availablePriests : availablePriests.slice(0, 3);
  const suggestedPriest = availablePriests[0]; // Top-ranked priest

  return (
    <div className="space-y-4">
      {/* Suggested Priest (Auto-assigned if user doesn't choose) */}
      {showAllOption && (
        <Card className={`p-4 border-2 ${!selectedPriestId ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-orange-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              Recommended
            </Badge>
            {!selectedPriestId && (
              <Badge variant="secondary">Auto-assigned</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={suggestedPriest.priestAvatar} />
              <AvatarFallback>{suggestedPriest.priestName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{suggestedPriest.priestName}</h4>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {suggestedPriest.yearsExperience || 0}+ years
                </span>
                {suggestedPriest.rating > 0 && (
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                    {suggestedPriest.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            {suggestedPriest.price && (
              <div className="text-right">
                <p className="text-lg font-bold text-orange-600">₹{suggestedPriest.price}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            {serviceMode === 'virtual' 
              ? 'Most active priest for online bookings'
              : 'Highly experienced temple priest'}
          </p>
        </Card>
      )}

      {/* Or Choose Your Own */}
      {showAllOption && (
        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-300 flex-1" />
          <span className="text-sm text-gray-500">Or choose your priest</span>
          <div className="h-px bg-gray-300 flex-1" />
        </div>
      )}

      {/* List of Available Priests */}
      <div className="space-y-3">
        {displayedPriests.map((priest) => {
          const isSelected = selectedPriestId === priest.priestId;
          
          return (
            <Card
              key={priest.priestId}
              onClick={() => onSelect(priest.priestId)}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={priest.priestAvatar} />
                  <AvatarFallback>{priest.priestName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{priest.priestName}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      {priest.yearsExperience || 0}+ years
                    </span>
                    {priest.rating > 0 && (
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                        {priest.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {priest.price && (
                    <p className="text-lg font-bold text-gray-900">₹{priest.price}</p>
                  )}
                  {isSelected && (
                    <Badge className="mt-1 bg-blue-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Show More Button */}
      {availablePriests.length > 3 && !showAll && (
        <Button
          variant="outline"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          Show {availablePriests.length - 3} more priests
        </Button>
      )}
    </div>
  );
}