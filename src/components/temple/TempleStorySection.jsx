import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

export default function TempleStorySection({ temple }) {
  if (!temple) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-16 md:py-24"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <span className="text-amber-600 font-mono text-sm tracking-[0.3em] uppercase">The Sacred Story</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-4">
            About {temple.name}
          </h2>
        </motion.div>

        {/* Story Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => {
                    const text = String(children);
                    if (text.length > 0) {
                      const firstLetter = text.charAt(0);
                      const rest = text.slice(1);
                      return (
                        <p className="mb-6 leading-relaxed first-of-type:first-letter:float-left first-of-type:first-letter:text-6xl first-of-type:first-letter:font-serif first-of-type:first-letter:text-amber-600 first-of-type:first-letter:leading-none first-of-type:first-letter:mr-3 first-of-type:first-letter:mt-1">
                          {children}
                        </p>
                      );
                    }
                    return <p className="mb-6 leading-relaxed">{children}</p>;
                  },
                }}
              >
                {temple.description || 'A sacred place of worship and spiritual significance.'}
              </ReactMarkdown>
            </div>

            {temple.significance && (
              <div className="mt-10 pt-8 border-t border-amber-200">
                <h3 className="text-2xl font-serif text-amber-700 mb-4">Divine Significance</h3>
                <div className="prose max-w-none text-gray-600 leading-relaxed">
                  <ReactMarkdown>{temple.significance}</ReactMarkdown>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}