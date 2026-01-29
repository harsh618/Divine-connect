import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Columns, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TempleArchitectureSection({ temple }) {
  if (!temple?.architecture && !temple?.description) return null;

  const arch = temple.architecture || {};

  return (
    <Card className="p-8 md:p-10 bg-white shadow-sm border-gray-100">
      <h2 className="text-2xl md:text-3xl font-serif text-amber-600 mb-8 flex items-center gap-3">
        <Building2 className="w-7 h-7" />
        Architecture
      </h2>

      <div className="space-y-6">
        {/* Architectural Style */}
        {arch.style && (
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Columns className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium uppercase tracking-wider mb-1">Architectural Style</p>
              <p className="text-xl font-serif text-gray-900">{arch.style}</p>
            </div>
          </div>
        )}

        {/* Key Features */}
        {arch.key_features?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Architectural Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {arch.key_features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-semibold text-sm">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Description */}
        {arch.description && (
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mt-6">
            <ReactMarkdown>
              {arch.description}
            </ReactMarkdown>
          </div>
        )}

        {/* Glossary Note */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-2">Temple Architecture Terms:</p>
              <ul className="space-y-1 text-amber-800">
                <li><strong>Gopuram</strong> - Monumental tower at the temple entrance</li>
                <li><strong>Vimana</strong> - Tower above the main shrine (Garbhagriha)</li>
                <li><strong>Garbhagriha</strong> - Sanctum Sanctorum, the innermost shrine</li>
                <li><strong>Mandapa</strong> - Pillared hall for gatherings and ceremonies</li>
                <li><strong>Prakara</strong> - Enclosure walls surrounding the temple</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}