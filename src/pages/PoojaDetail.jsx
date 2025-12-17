import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Package,
  Video,
  CheckCircle,
  Loader2,
  Flame,
  Users,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '../components/ui/BackButton';
import FAQSection from '../components/faq/FAQSection';

export default function PoojaDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const poojaId = urlParams.get('id');

  const { data: pooja, isLoading } = useQuery({
    queryKey: ['pooja', poojaId],
    queryFn: async () => {
      const poojas = await base44.entities.Pooja.filter({ id: poojaId, is_deleted: false });
      return poojas[0];
    },
    enabled: !!poojaId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!pooja) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pooja not found</h2>
        <Link to={createPageUrl('Poojas')}>
          <Button>Back to Poojas</Button>
        </Link>
      </div>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800";
  const poojaImage = pooja.image_url || defaultImage;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Back Button - Fixed Top Left */}
      <div className="fixed top-20 left-4 z-50">
        <BackButton label="Back" />
      </div>

      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh] bg-black">
        <img
          src={poojaImage}
          alt={pooja.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        
        {/* Badges */}
        <div className="absolute top-20 right-4 flex gap-2">
          {pooja.is_popular && (
            <Badge className="bg-orange-500 text-white border-0">
              Popular
            </Badge>
          )}
          {pooja.base_price_virtual > 0 && (
            <Badge className="bg-blue-500 text-white border-0">
              <Video className="w-3 h-3 mr-1" />
              Virtual Available
            </Badge>
          )}
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                  {pooja.name}
                </h1>
                {pooja.category && (
                  <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-0 capitalize">
                    {pooja.category.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">About This Pooja</h2>
              {pooja.description && (
                <p className="text-gray-600 leading-relaxed mb-4">
                  {pooja.description}
                </p>
              )}
              {pooja.purpose && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Purpose</h3>
                  <p className="text-gray-600 leading-relaxed">{pooja.purpose}</p>
                </div>
              )}
              {pooja.benefits?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Benefits</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {pooja.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              {pooja.best_time && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Best Time to Perform</h3>
                  <p className="text-gray-600">{pooja.best_time}</p>
                </div>
              )}
            </Card>

            {/* Pooja Items */}
            {(pooja.required_items?.length > 0 || pooja.optional_items?.length > 0) && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-orange-500" />
                  Pooja Items
                </h2>
                {pooja.required_items?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Required Items</h3>
                    <ul className="list-disc list-inside text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      {pooja.required_items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {pooja.optional_items?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Optional Items</h3>
                    <ul className="list-disc list-inside text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      {pooja.optional_items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {pooja.items_arrangement_cost > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 Priest can arrange all items for an additional ₹{pooja.items_arrangement_cost}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                {pooja.total_bookings > 0 && (
                  <Badge variant="secondary">
                    {pooja.total_bookings} bookings completed
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Rajesh Kumar</span>
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Excellent service! The pandit was very knowledgeable and conducted the pooja with devotion.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQs */}
            <FAQSection entityType="pooja" entityId={poojaId} entityData={pooja} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6">
                {pooja.base_price_virtual || pooja.base_price_in_person || pooja.base_price_temple ? (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Starting from</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{pooja.base_price_virtual || pooja.base_price_in_person || pooja.base_price_temple}
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">Price on Request</p>
                )}
                {pooja.duration_minutes && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Approx. {pooja.duration_minutes} minutes
                  </p>
                )}
              </div>

              <Button 
                onClick={() => {
                  base44.auth.isAuthenticated().then(isAuth => {
                    if (isAuth) {
                      navigate(createPageUrl(`PoojaBooking?id=${pooja.id}`));
                    } else {
                      base44.auth.redirectToLogin();
                    }
                  });
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
              >
                Book This Pooja
              </Button>

              <div className="mt-4 space-y-2 text-sm">
                {pooja.base_price_virtual > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Virtual</span>
                    <span className="font-medium">₹{pooja.base_price_virtual}</span>
                  </div>
                )}
                {pooja.base_price_in_person > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>In-Person</span>
                    <span className="font-medium">₹{pooja.base_price_in_person}</span>
                  </div>
                )}
                {pooja.base_price_temple > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>At Temple</span>
                    <span className="font-medium">₹{pooja.base_price_temple}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified & Experienced Priests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Choose Your Preferred Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Personalized Rituals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Completion Certificate</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}