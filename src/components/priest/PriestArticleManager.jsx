import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Flame,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PriestArticleManager({ profile }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    temple_id: '',
    scripture_reference: '',
    quote: '',
    language: 'english'
  });

  // Fetch priest's articles
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['priest-articles', profile?.id],
    queryFn: async () => {
      return base44.entities.Article.filter({
        author_id: profile.user_id,
        source: 'priest',
        is_deleted: false
      }, '-created_date');
    },
    enabled: !!profile
  });

  // Fetch temples for selection
  const { data: temples = [] } = useQuery({
    queryKey: ['temples-for-article'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false })
  });

  // Fetch poojas for selection
  const { data: poojas = [] } = useQuery({
    queryKey: ['poojas-for-article'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false })
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Article.create({
        ...data,
        source: 'priest',
        author_id: profile.user_id,
        author_name: profile.display_name,
        status: 'pending', // Requires admin approval
        is_published: false,
        is_deleted: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-articles']);
      toast.success('Article submitted for review!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create article: ' + error.message);
    }
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return base44.entities.Article.update(id, {
        ...data,
        status: 'pending' // Re-submit for review after edit
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-articles']);
      toast.success('Article updated and resubmitted for review!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update article: ' + error.message);
    }
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Article.update(id, { is_deleted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-articles']);
      toast.success('Article deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      temple_id: '',
      scripture_reference: '',
      quote: '',
      language: 'english'
    });
    setEditingArticle(null);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      temple_id: article.temple_id || '',
      scripture_reference: article.scripture_reference || '',
      quote: article.quote || '',
      language: article.language || 'english'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            My Articles & FAQs
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Share your knowledge about temples, poojas, and spiritual practices
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Write Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Edit Article' : 'Write New Article'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., The Significance of Rudrabhishek"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Related Temple (Optional)</Label>
                  <Select
                    value={formData.temple_id}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, temple_id: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select temple" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {temples.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, language: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="sanskrit">Sanskrit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Scripture Reference (Optional)</Label>
                <Input
                  value={formData.scripture_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, scripture_reference: e.target.value }))}
                  placeholder="e.g., Shiva Purana, Chapter 5"
                />
              </div>

              <div>
                <Label>Sanskrit Quote (Optional)</Label>
                <Input
                  value={formData.quote}
                  onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="ॐ नमः शिवाय"
                />
              </div>

              <div>
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here. Share your knowledge about the temple, pooja significance, rituals, or spiritual guidance..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Articles List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-4">
          {articles.map(article => (
            <Card key={article.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(article.created_date), 'PP')}
                    </span>
                    {article.temple_id && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {temples.find(t => t.id === article.temple_id)?.name || 'Temple'}
                      </span>
                    )}
                  </div>
                </div>
                {getStatusBadge(article.status)}
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {article.content}
              </p>

              {article.scripture_reference && (
                <p className="text-xs text-orange-600 mb-3">
                  📖 {article.scripture_reference}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this article?')) {
                      deleteMutation.mutate(article.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No articles yet</h3>
          <p className="text-gray-600 mb-4">
            Share your wisdom! Write articles about temples, poojas, or spiritual guidance.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Write Your First Article
          </Button>
        </Card>
      )}
    </div>
  );
}