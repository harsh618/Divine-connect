import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Star } from 'lucide-react';

export default function TempleDeitiesSection({ temple }) {
  if (!temple?.deities && !temple?.primary_deity) return null;

  const deities = temple.deities || {};
  const mainDeity = deities.main_deity || { name: temple.primary_deity };

  return (
    <Card className="p-8 md:p-10 bg-white shadow-sm border-gray-100">
      <h2 className="text-2xl md:text-3xl font-serif text-amber-600 mb-8 flex items-center gap-3">
        <Sparkles className="w-7 h-7" />
        Deities (Murti)
      </h2>

      <div className="space-y-8">
        {/* Main Deity */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 border border-amber-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="relative">
            <Badge className="bg-amber-600 text-white border-0 mb-4">Main Deity</Badge>
            <h3 className="text-2xl font-serif text-gray-900 mb-2">
              {mainDeity.name}
            </h3>
            {mainDeity.posture && (
              <p className="text-amber-700 font-medium mb-3">
                Form: <span className="capitalize">{mainDeity.posture}</span>
              </p>
            )}
            {mainDeity.description && (
              <p className="text-gray-700 leading-relaxed">
                {mainDeity.description}
              </p>
            )}
          </div>
        </div>

        {/* Consort */}
        {deities.consort?.name && (
          <div className="rounded-xl bg-pink-50 p-5 border border-pink-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <Badge className="bg-pink-600 text-white border-0 mb-2">Consort</Badge>
                <h4 className="text-xl font-serif text-gray-900 mb-1">
                  {deities.consort.name}
                </h4>
                {deities.consort.description && (
                  <p className="text-gray-700 text-sm">
                    {deities.consort.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub-shrines */}
        {deities.sub_shrines?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-600" />
              Other Deities & Sub-shrines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deities.sub_shrines.map((shrine, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors border border-gray-100"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {shrine.deity_name}
                  </h4>
                  {shrine.description && (
                    <p className="text-sm text-gray-600">
                      {shrine.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}