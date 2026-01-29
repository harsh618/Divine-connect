import React from 'react';
import { Card } from "@/components/ui/card";
import { BookOpen, ScrollText, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TempleHistorySection({ temple }) {
  if (!temple) return null;

  const hasHistory = temple.history || temple.legend || temple.historical_timeline?.length > 0;
  
  if (!hasHistory) return null;

  return (
    <Card className="p-8 md:p-10 bg-white shadow-sm border-gray-100">
      <h2 className="text-2xl md:text-3xl font-serif text-amber-600 mb-8 flex items-center gap-3">
        <BookOpen className="w-7 h-7" />
        History & Legend
      </h2>

      <div className="space-y-10">
        {/* Sthala Purana / Legend */}
        {temple.legend && (
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
            <div className="pl-6">
              <h3 className="text-xl font-serif text-gray-900 mb-4 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-600" />
                Sthala Purana (Temple Legend)
              </h3>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed bg-amber-50/50 p-6 rounded-xl border border-amber-100">
                <ReactMarkdown>
                  {temple.legend}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Historical Facts */}
        {temple.history && (
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full" />
            <div className="pl-6">
              <h3 className="text-xl font-serif text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Historical Background
              </h3>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown>
                  {temple.history}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Historical Timeline */}
        {temple.historical_timeline?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-serif text-gray-900 mb-6">Historical Timeline</h3>
            <div className="relative pl-8">
              {/* Vertical Line */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-amber-300 via-amber-500 to-amber-300" />
              
              <div className="space-y-6">
                {temple.historical_timeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-8 top-1 w-4 h-4 bg-amber-500 rounded-full shadow-md group-hover:scale-125 transition-all border-2 border-white" />
                    
                    <div className="group-hover:bg-amber-50/50 p-4 rounded-lg transition-all -ml-2">
                      <p className="font-mono text-sm font-semibold text-amber-700 mb-1">
                        {item.year}
                      </p>
                      <p className="text-gray-700">{item.event}</p>
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