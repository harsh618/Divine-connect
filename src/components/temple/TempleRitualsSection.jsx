import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, CalendarDays } from 'lucide-react';

export default function TempleRitualsSection({ temple, upcomingFestivals, loadingFestivals }) {
  if (!temple) return null;

  const rituals = temple.rituals || {};
  const festivals = temple.festivals || [];
  const hasContent = rituals.daily_schedule?.length > 0 || festivals.length > 0;

  if (!hasContent && !upcomingFestivals?.length) return null;

  return (
    <Card className="p-8 md:p-10 bg-white shadow-sm border-gray-100">
      <h2 className="text-2xl md:text-3xl font-serif text-amber-600 mb-8 flex items-center gap-3">
        <Flame className="w-7 h-7" />
        Rituals, Poojas & Festivals
      </h2>

      <div className="space-y-10">
        {/* Daily Pooja Schedule */}
        {rituals.daily_schedule?.length > 0 && (
          <div>
            <h3 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Daily Pooja Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Ritual</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rituals.daily_schedule.map((ritual, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-amber-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{ritual.name}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0 font-mono">
                          {ritual.time}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Special Poojas */}
        {rituals.special_poojas?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Poojas Available</h3>
            <div className="flex flex-wrap gap-2">
              {rituals.special_poojas.map((pooja, idx) => (
                <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-800 border-0 px-3 py-1.5">
                  {pooja}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Major Festivals */}
        {festivals.length > 0 && (
          <div>
            <h3 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-600" />
              Major Festivals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {festivals.map((festival, idx) => {
                const festivalData = typeof festival === 'string' 
                  ? { name: festival } 
                  : festival;
                
                return (
                  <div 
                    key={idx}
                    className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {festivalData.name}
                    </h4>
                    {festivalData.month && (
                      <p className="text-sm text-amber-700 font-medium mb-2">
                        📅 {festivalData.month}
                        {festivalData.duration && ` • ${festivalData.duration}`}
                      </p>
                    )}
                    {festivalData.description && (
                      <p className="text-sm text-gray-600">
                        {festivalData.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming AI-Generated Festivals */}
        {upcomingFestivals?.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-serif text-gray-900 mb-6">Upcoming Festivals & Tithis</h3>
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300/0 via-gray-300 to-gray-300/0" />
              
              <div className="space-y-6">
                {upcomingFestivals.map((festival, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-8 top-2 w-4 h-4 bg-amber-500 rounded-full shadow-md group-hover:scale-125 transition-all" />
                    
                    <div className="group-hover:bg-amber-50/50 p-4 rounded-lg transition-all">
                      <h4 className="text-lg font-serif text-gray-900 mb-1">{festival.name}</h4>
                      <p className="font-mono text-xs tracking-widest uppercase text-amber-600 mb-2">{festival.date}</p>
                      <p className="text-sm text-gray-600">{festival.description}</p>
                      {festival.significance && (
                        <p className="text-xs text-gray-500 mt-2 italic">{festival.significance}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}