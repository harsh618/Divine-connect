import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function TimelineCard({ event }) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all overflow-hidden group hover:scale-[1.02]">
        {event.image_url &&
        <div className="h-40 overflow-hidden">
            <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          </div>
        }
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl px-3 py-2 min-w-[60px]">
              <span className="text-2xl font-bold leading-none">{event.date.split(' ')[1]}</span>
              <span className="text-xs font-medium uppercase mt-1">{event.date.split(' ')[0]}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">{event.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{event.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

export default function AuspiciousTimeline() {
  const scrollRef = useRef(null);

  const { data: adminDays } = useQuery({
    queryKey: ['auspicious-days-admin'],
    queryFn: () => base44.entities.AuspiciousDay.filter({
      is_deleted: false,
      is_visible: true
    }, 'date', 20)
  });

  const displayEvents = adminDays?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    title: day.title,
    description: day.description,
    image_url: day.image_url
  })) || [];

  const isLoading = !adminDays;

  return (
    <section className="bg-gradient-to-b pt-8 pr-6 pb-12 pl-6 from-orange-50/30 to-white">
      <div className="container mx-auto max-w-7xl mb-12">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-orange-500" />
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                Auspicious Days
              </h2>
            </div>
            <p className="text-gray-600">Upcoming sacred moments and festivals this month</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-6">
            {isLoading ?
            Array(3).fill(0).map((_, i) =>
            <div key={i} className="flex-shrink-0 w-80">
                  <Skeleton className="w-full h-64 rounded-2xl" />
                </div>
            ) :
            displayEvents?.length > 0 ?
            displayEvents.slice(0, 5).map((event, idx) =>
            <TimelineCard key={idx} event={event} />
            ) :

            <div className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-gray-500">No auspicious days scheduled yet</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>);

}