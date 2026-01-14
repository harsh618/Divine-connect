import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Send, 
  User, 
  CheckCircle,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

/**
 * Q&A Section for Pooja Detail Page
 * Allows users to ask questions and receive answers from Admins/Priests
 */
export default function PoojaQASection({ poojaId, poojaName }) {
  const queryClient = useQueryClient();
  const [newQuestion, setNewQuestion] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['pooja-questions', poojaId],
    queryFn: async () => {
      // Using FAQ entity as Q&A storage
      const faqs = await base44.entities.FAQ.filter({
        entity_type: 'pooja',
        entity_id: poojaId
      }, '-created_date');
      return faqs;
    },
    enabled: !!poojaId
  });

  // Submit question mutation
  const submitQuestionMutation = useMutation({
    mutationFn: async (question) => {
      const currentUser = await base44.auth.me();
      return base44.entities.FAQ.create({
        entity_type: 'pooja',
        entity_id: poojaId,
        question: question,
        answer: null, // Pending answer
        order: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pooja-questions', poojaId]);
      setNewQuestion('');
      toast.success('Question submitted! Our priests will answer soon.');
    },
    onError: (error) => {
      toast.error('Failed to submit question: ' + error.message);
    }
  });

  // Submit answer mutation (for admins/priests)
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }) => {
      return base44.entities.FAQ.update(questionId, {
        answer: answer
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pooja-questions', poojaId]);
      setReplyingTo(null);
      setReplyText('');
      toast.success('Answer submitted!');
    }
  });

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }
    submitQuestionMutation.mutate(newQuestion);
  };

  const handleSubmitAnswer = (questionId) => {
    if (!replyText.trim()) {
      toast.error('Please enter your answer');
      return;
    }
    submitAnswerMutation.mutate({ questionId, answer: replyText });
  };

  const canAnswer = user?.role === 'admin' || user?.provider_type === 'priest';

  return (
    <Card className="p-8 bg-white shadow-sm border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-serif text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-amber-600" />
          Questions & Answers
        </h3>
        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
          {questions?.length || 0} Questions
        </Badge>
      </div>

      {/* Ask Question Form */}
      <div className="mb-8 p-4 bg-amber-50 rounded-xl">
        <h4 className="font-semibold mb-3">Have a question about {poojaName}?</h4>
        <div className="flex gap-3">
          <Input
            placeholder="Type your question here..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
          />
          <Button 
            onClick={handleSubmitQuestion}
            disabled={submitQuestionMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Ask
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Our verified priests will answer your question within 24 hours
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : questions?.length > 0 ? (
          questions.map((qa) => (
            <div key={qa.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              {/* Question */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {qa.created_by || 'Devotee'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(qa.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-gray-800">{qa.question}</p>
                </div>
              </div>

              {/* Answer */}
              {qa.answer ? (
                <div className="ml-11 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">Answered by Panditji</span>
                  </div>
                  <p className="text-gray-700">{qa.answer}</p>
                </div>
              ) : (
                <div className="ml-11">
                  {canAnswer ? (
                    replyingTo === qa.id ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your answer..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleSubmitAnswer(qa.id)}
                            disabled={submitAnswerMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Submit Answer
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyingTo(qa.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Answer this question
                      </Button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      Awaiting answer from our priests
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No questions yet. Be the first to ask!</p>
          </div>
        )}
      </div>
    </Card>
  );
}