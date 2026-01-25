import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from '../TranslationProvider';

function TimelineCard({ event }) {
  return (
    <div className="min-w-[80px] h-[120px] flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer snap-start group flex-shrink-0">
      <span className="text-xs text-stone-400 uppercase tracking-wider mb-1">{event.date.split(' ')[0]}</span>
      <span className="text-2xl font-bold text-stone-800 mb-1">{event.date.split(' ')[1]}</span>
      <span className="text-[10px] text-amber-600 font-medium text-center px-2 line-clamp-2">{event.title}</span>
    </div>
  );
}

export default function AuspiciousTimeline() {
  const { t } = useTranslation();
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
    <section className="bg-[#FAFAF9] py-16 px-6">
      <div className="container mx-auto max-w-7xl mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-3xl font-serif font-semibold text-[#1C1917] tracking-tight">
                {t('Auspicious Days')}
              </h2>
            </div>
            <p className="text-stone-600 text-sm">{t('Check daily for sacred moments')}</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto snap-x no-scrollbar pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-4 px-1">
            {isLoading ?
            Array(8).fill(0).map((_, i) =>
            <div key={i} className="flex-shrink-0">
                  <Skeleton className="w-[80px] h-[120px] rounded-2xl" />
                </div>
            ) :
            displayEvents?.length > 0 ?
            displayEvents.slice(0, 12).map((event, idx) =>
            <TimelineCard key={idx} event={event} />
            ) :

            <div className="min-w-[200px] bg-white rounded-2xl border border-stone-200 p-8 text-center flex-shrink-0">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-stone-500 text-sm">{t('No days scheduled')}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>);

}