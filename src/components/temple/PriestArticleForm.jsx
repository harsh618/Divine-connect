import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PriestArticleForm({ templeId, templeName, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scripture_reference: '',
    quote: '',
    images: []
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const provider = await base44.entities.ProviderProfile.filter({ 
        user_id: user.id, 
        provider_type: 'priest' 
      });
      
      return base44.entities.Article.create({
        ...data,
        temple_id: templeId,
        source: 'priest',
        author_id: user.id,
        author_name: provider[0]?.display_name || user.full_name,
        status: 'pending',
        is_published: false
      });
    },
    onSuccess: () => {
      toast.success('Article submitted for admin review!');
      queryClient.invalidateQueries(['articles']);
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit article');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            Article Seva for {templeName}
          </DialogTitle>
          <DialogDescription>
            Share your knowledge and devotion. Your article will be reviewed by admin before publication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label className="mb-2 block">Article Title *</Label>
            <Input
              placeholder="e.g., The Legend of Lord Shiva at this Temple"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label className="mb-2 block">Scripture Reference</Label>
            <Input
              placeholder="e.g., Shiva Purana, Chapter 12"
              value={formData.scripture_reference}
              onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2 block">Sanskrit Quote (Optional)</Label>
            <Input
              placeholder="Original Sanskrit verse or quote"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2 block">Article Content *</Label>
            <Textarea
              placeholder="Write your article content here... Share the divine story, historical significance, or spiritual teachings."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              required
            />
          </div>

          <div>
            <Label className="mb-2 block">Article Images (Optional)</Label>
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({...formData, images})}
              multiple={true}
            />
          </div>

          <div className="bg-amber-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-amber-800 mb-1">Note:</p>
            <p>Your article will be submitted to admin for review. Once approved, it will be visible to all devotees visiting this temple page.</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}