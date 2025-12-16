import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FAQSection({ entityType, entityId, entityData }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs', entityType, entityId],
    queryFn: () => {
      if (entityId) {
        return base44.entities.FAQ.filter({ 
          entity_type: entityType, 
          entity_id: entityId 
        }, 'order');
      }
      return base44.entities.FAQ.filter({ entity_type: entityType }, 'order');
    }
  });

  const generateFAQsMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate 5-8 frequently asked questions and detailed answers for a ${entityType} with the following information:

${JSON.stringify(entityData, null, 2)}

The FAQs should be practical, informative, and cover common concerns users might have. Format the response as a JSON array.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            faqs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create FAQ records
      const faqPromises = result.faqs.map((faq, index) =>
        base44.entities.FAQ.create({
          question: faq.question,
          answer: faq.answer,
          entity_type: entityType,
          entity_id: entityId || null,
          order: index
        })
      );

      await Promise.all(faqPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['faqs', entityType, entityId]);
      toast.success('FAQs generated successfully!');
      setIsGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate FAQs');
      setIsGenerating(false);
    }
  });

  const handleGenerateFAQs = () => {
    setIsGenerating(true);
    generateFAQsMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-500" />
          Frequently Asked Questions
        </h2>
        {(!faqs || faqs.length === 0) && entityData && (
          <Button
            onClick={handleGenerateFAQs}
            disabled={isGenerating}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate FAQs
              </>
            )}
          </Button>
        )}
      </div>

      {faqs && faqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.id} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No FAQs available yet.</p>
          {entityData && (
            <p className="text-sm mt-2">Click "Generate FAQs" to create them automatically.</p>
          )}
        </div>
      )}
    </Card>
  );
}