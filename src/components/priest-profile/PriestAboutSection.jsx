import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, Award, BookOpen, Users, MapPin, Globe, 
  Sparkles, Star, CheckCircle
} from 'lucide-react';

export default function PriestAboutSection({ provider }) {
  return (
    <div className="space-y-6">
      {/* Bio Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">About</h2>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {provider.bio || 'Dedicated to serving devotees through authentic Vedic rituals and spiritual guidance.'}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            {provider.gotra && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Gotra</p>
                <p className="font-semibold text-gray-900">{provider.gotra}</p>
              </div>
            )}
            {provider.sampradaya && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Sampradaya</p>
                <p className="font-semibold text-gray-900">{provider.sampradaya}</p>
              </div>
            )}
            {provider.vedic_training && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Training</p>
                <p className="font-semibold text-gray-900">{provider.vedic_training}</p>
              </div>
            )}
            {provider.travel_radius_km && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Travel Radius</p>
                <p className="font-semibold text-gray-900">{provider.travel_radius_km} km</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education & Lineage */}
      {provider.education_lineage && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Education & Lineage</h2>
            </div>

            <div className="space-y-4">
              {provider.education_lineage.institution && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">{provider.education_lineage.institution}</p>
                    <p className="text-sm text-gray-500">Formal Education</p>
                  </div>
                </div>
              )}
              {provider.education_lineage.guru_name && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">Guru: {provider.education_lineage.guru_name}</p>
                    <p className="text-sm text-gray-500">Spiritual Lineage</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specializations */}
      {provider.specializations?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Specializations</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {provider.specializations.map((spec, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-800"
                >
                  <Star className="w-3 h-3 mr-1 fill-orange-400 text-orange-400" />
                  {spec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {provider.certifications?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Certifications & Awards</h2>
            </div>

            <div className="grid gap-3">
              {provider.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800">{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {provider.languages?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Languages</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {provider.languages.map((lang, idx) => (
                <Badge key={idx} variant="outline" className="px-3 py-1.5">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Associated Temples */}
      {provider.associated_temples?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Associated Temples</h2>
            </div>

            <div className="space-y-3">
              {provider.associated_temples.map((temple, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{temple.temple_name}</p>
                    <p className="text-sm text-gray-500">{temple.city}, {temple.state}</p>
                  </div>
                  {temple.role && (
                    <Badge variant="secondary">{temple.role}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}