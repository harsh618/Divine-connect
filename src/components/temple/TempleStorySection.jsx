import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TempleStorySection({ temple }) {
  if (!temple) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-20 md:py-32 bg-gradient-to-b from-white to-amber-50/30"
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 text-sm font-medium">The Sacred Story</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
            Discover {temple.name}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A divine sanctuary dedicated to {temple.primary_deity} in the holy land of {temple.city}, {temple.state}
          </p>
        </motion.div>

        {/* Quick Info Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <Badge variant="secondary" className="bg-white shadow-sm px-4 py-2 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-amber-600" />
            {temple.city}, {temple.state}
          </Badge>
          {temple.opening_hours && (
            <Badge variant="secondary" className="bg-white shadow-sm px-4 py-2 text-sm">
              <Clock className="w-4 h-4 mr-2 text-amber-600" />
              {temple.opening_hours}
            </Badge>
          )}
          {temple.architecture?.style && (
            <Badge variant="secondary" className="bg-white shadow-sm px-4 py-2 text-sm">
              {temple.architecture.style} Architecture
            </Badge>
          )}
        </motion.div>

        {/* Main Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-8 md:p-14 bg-white border-0 shadow-2xl rounded-3xl">
            {/* Tagline */}
            {temple.tagline && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mb-10 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-500"
              >
                <p className="text-xl md:text-2xl font-serif text-gray-800 leading-relaxed italic">
                  "{temple.tagline}"
                </p>
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed"
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-6 leading-relaxed text-gray-600 first-of-type:text-lg first-of-type:text-gray-800 first-of-type:font-medium">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-amber-700 font-semibold">{children}</strong>
                  ),
                }}
              >
                {temple.description || 'A sacred place of worship and spiritual significance where devotees come seeking divine blessings.'}
              </ReactMarkdown>
            </motion.div>

            {/* Significance Section */}
            {temple.significance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="mt-12 pt-10 border-t border-amber-100"
              >
                <h3 className="text-2xl md:text-3xl font-serif text-amber-700 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </span>
                  Divine Significance
                </h3>
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed">{children}</p>
                      ),
                    }}
                  >
                    {temple.significance}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* History Preview */}
            {temple.history && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-12 pt-10 border-t border-amber-100"
              >
                <h3 className="text-2xl md:text-3xl font-serif text-amber-700 mb-6">
                  Historical Legacy
                </h3>
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed">{children}</p>
                      ),
                    }}
                  >
                    {temple.history.length > 600 
                      ? temple.history.substring(0, 600).trim() + '...' 
                      : temple.history}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Legend Section */}
            {temple.legend && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className="mt-12 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl"
              >
                <h3 className="text-xl font-serif text-orange-800 mb-4">
                  🪔 Sacred Legend (Sthala Purana)
                </h3>
                <div className="prose max-w-none text-orange-900/80 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-3 leading-relaxed italic">{children}</p>
                      ),
                    }}
                  >
                    {temple.legend.length > 500 
                      ? temple.legend.substring(0, 500).trim() + '...' 
                      : temple.legend}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}