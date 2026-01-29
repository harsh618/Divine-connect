import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Shirt, 
  IndianRupee, 
  Camera, 
  Smartphone, 
  Sun, 
  Plane, 
  Train, 
  Car,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function TempleVisitorInfoSection({ temple }) {
  if (!temple) return null;

  const visitorInfo = temple.visitor_info || {};
  const dressCode = temple.dress_code || {};

  return (
    <Card className="p-6 md:p-8 bg-white shadow-xl border-gray-100">
      <h3 className="text-xl font-serif text-amber-600 mb-6 flex items-center gap-2">
        <Info className="w-5 h-5" />
        Visitor Information
      </h3>

      <div className="space-y-6">
        {/* Opening Hours */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">Opening Hours</p>
            {temple.opening_hours_structured?.length > 0 ? (
              <div className="space-y-1">
                {temple.opening_hours_structured.map((session, idx) => (
                  <p key={idx} className="text-sm text-gray-600">
                    <span className="font-medium">{session.session}:</span> {session.opens} - {session.closes}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">{temple.opening_hours || '5:00 AM - 9:00 PM'}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">Location</p>
            <p className="text-sm text-gray-600">
              {temple.location || `${temple.city}, ${temple.state}`}
              {temple.pincode && ` - ${temple.pincode}`}
            </p>
          </div>
        </div>

        {/* Dress Code */}
        {(dressCode.general || dressCode.men || dressCode.women || typeof temple.dress_code === 'string') && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Shirt className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-2">Dress Code</p>
              {typeof temple.dress_code === 'string' ? (
                <p className="text-sm text-gray-600">{temple.dress_code}</p>
              ) : (
                <div className="space-y-2">
                  {dressCode.general && (
                    <p className="text-sm text-gray-600">{dressCode.general}</p>
                  )}
                  {dressCode.men && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Men:</span> {dressCode.men}
                    </p>
                  )}
                  {dressCode.women && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Women:</span> {dressCode.women}
                    </p>
                  )}
                  {dressCode.restrictions?.length > 0 && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm font-medium text-red-800 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Not Allowed:
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {dressCode.restrictions.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <XCircle className="w-3 h-3" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entry Fee */}
        {(visitorInfo.entry_fee || visitorInfo.special_darshan_fee) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-2">Entry Fee</p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">General Entry:</span> {visitorInfo.entry_fee || 'Free'}
              </p>
              {visitorInfo.special_darshan_fee && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Special Darshan:</span> {visitorInfo.special_darshan_fee}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Best Time to Visit */}
        {visitorInfo.best_time_to_visit && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Sun className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Best Time to Visit</p>
              <p className="text-sm text-gray-600">{visitorInfo.best_time_to_visit}</p>
            </div>
          </div>
        )}

        {/* Photography & Mobile Policies */}
        <div className="flex gap-4 flex-wrap">
          {visitorInfo.photography_allowed !== undefined && (
            <Badge 
              variant="secondary" 
              className={`${visitorInfo.photography_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0 px-3 py-1.5`}
            >
              <Camera className="w-4 h-4 mr-1.5" />
              Photography {visitorInfo.photography_allowed ? 'Allowed' : 'Not Allowed'}
            </Badge>
          )}
          {visitorInfo.mobile_allowed !== undefined && (
            <Badge 
              variant="secondary" 
              className={`${visitorInfo.mobile_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0 px-3 py-1.5`}
            >
              <Smartphone className="w-4 h-4 mr-1.5" />
              Mobile {visitorInfo.mobile_allowed ? 'Allowed' : 'Not Allowed'}
            </Badge>
          )}
        </div>

        {/* How to Reach */}
        {visitorInfo.how_to_reach && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="font-semibold text-gray-900 mb-4">How to Reach</p>
            <div className="space-y-3">
              {visitorInfo.how_to_reach.by_air && (
                <div className="flex items-start gap-3">
                  <Plane className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">By Air</p>
                    <p className="text-sm text-gray-600">{visitorInfo.how_to_reach.by_air}</p>
                  </div>
                </div>
              )}
              {visitorInfo.how_to_reach.by_rail && (
                <div className="flex items-start gap-3">
                  <Train className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">By Rail</p>
                    <p className="text-sm text-gray-600">{visitorInfo.how_to_reach.by_rail}</p>
                  </div>
                </div>
              )}
              {visitorInfo.how_to_reach.by_road && (
                <div className="flex items-start gap-3">
                  <Car className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">By Road</p>
                    <p className="text-sm text-gray-600">{visitorInfo.how_to_reach.by_road}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nearby Attractions */}
        {visitorInfo.nearby_attractions?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Nearby Attractions</p>
            <div className="flex flex-wrap gap-2">
              {visitorInfo.nearby_attractions.map((attraction, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                  {attraction}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}