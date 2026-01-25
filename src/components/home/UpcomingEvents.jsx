import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '../TranslationProvider';

function EventCard({ event, temple }) {
  return (
    <div className="flex-shrink-0 w-96 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={temple?.images?.[0] || temple?.thumbnail_url || "https://images.unsplash.com/photo-1548013146-72479768bada?w=800"}
          alt={event.title}
          className="w-full h-full object-cover" />

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
          {event.event_date ? format(new Date(event.event_date), 'MMM dd') : 'TBA'}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-orange-600 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          {event.event_type?.replace(/_/g, ' ')}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        {temple &&
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            {temple.name}
          </div>
        }
      </div>
    </div>);

}

export default function UpcomingEvents() {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => base44.entities.TempleEvent.filter({ is_deleted: false }, 'event_date', 10)
  });

  const { data: temples } = useQuery({
    queryKey: ['temples-for-events'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }),
    enabled: !!events?.length
  });

  const templesMap = temples?.reduce((acc, temple) => {
    acc[temple.id] = temple;
    return acc;
  }, {}) || {};

  return (
    <section className="bg-white pt-16 pr-6 pb-20 pl-6">
      <div className="container mx-auto max-w-7xl mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
          {t('Upcoming Events')}
        </h2>
        <p className="text-gray-500">{t('Festivals and ceremonies near you')}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-6">
            {isLoading ?
            Array(3).fill(0).map((_, i) =>
            <div key={i} className="flex-shrink-0 w-96">
                  <Skeleton className="w-full h-80 rounded-2xl" />
                </div>
            ) :
            events?.length > 0 ?
            events.map((event) =>
            <EventCard
              key={event.id}
              event={event}
              temple={templesMap[event.temple_id]} />

            ) :

            <div className="w-96 text-gray-500 text-center py-12">
                {t('No upcoming events')}
              </div>
            }
          </div>
        </div>
      </div>
    </section>);

}