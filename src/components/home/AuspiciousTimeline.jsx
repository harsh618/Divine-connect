import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function TimelineCard({ event }) {
  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      {event.image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-full">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-orange-600">{event.date}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}

export default function AuspiciousTimeline() {
  const scrollRef = useRef(null);

  const { data: adminDays } = useQuery({
    queryKey: ['auspicious-days-admin'],
    queryFn: () => base44.entities.AuspiciousDay.filter({ 
      is_deleted: false, 
      is_visible: true 
    }, 'date', 20),
  });

  const { data: aiTimeline, isLoading } = useQuery({
    queryKey: ['auspicious-timeline'],
    queryFn: async () => {
      // If admin has added days, use those instead of AI
      if (adminDays && adminDays.length > 0) {
        return adminDays.map(day => ({
          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          title: day.title,
          description: day.description,
          image_url: day.image_url
        }));
      }

      // Fallback to AI generation
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a list of 5 auspicious days and spiritual events for the upcoming month (December 2025) in Hindu calendar. For each event, provide: date (format: "Dec 15"), title (short, 3-5 words), and description (one sentence, max 15 words). Return as JSON array with objects having: date, title, description fields.`,
        response_json_schema: {
          type: "object",
          properties: {
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response.events || [];
    },
    enabled: !!adminDays, // Wait for admin days to load first
    staleTime: 1000 * 60 * 60 * 24 // Cache for 24 hours
  });

  return (
    <section className="bg-slate-50 px-6 py-24 from-white to-orange-50/30">
      <div className="container mx-auto max-w-7xl mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-orange-500" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Auspicious Days
          </h2>
        </div>
        <p className="text-gray-500">Upcoming sacred moments this month</p>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-6">
            {isLoading ?
            Array(3).fill(0).map((_, i) =>
            <div key={i} className="flex-shrink-0 w-80">
                  <Skeleton className="w-full h-48 rounded-2xl" />
                </div>
            ) :
            aiTimeline?.length > 0 ?
            aiTimeline.map((event, idx) =>
            <TimelineCard key={idx} event={event} />
            ) :

            <div className="w-80 text-gray-500 text-center py-12">
                No events available
              </div>
            }
          </div>
        </div>
      </div>
    </section>);

}