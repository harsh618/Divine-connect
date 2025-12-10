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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminArticles() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    temple_id: '',
    title: '',
    content: '',
    scripture_reference: '',
    quote: '',
    language: 'english'
  });

  const { data: articles } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => base44.entities.Article.filter({ is_deleted: false }, '-created_date')
  });

  const { data: temples } = useQuery({
    queryKey: ['temples-list'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false })
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Article.create({
        ...data,
        source: 'admin',
        author_id: user.id,
        author_name: user.full_name,
        status: 'approved',
        is_published: true
      });
    },
    onSuccess: () => {
      toast.success('Article created successfully');
      queryClient.invalidateQueries(['admin-articles']);
      setShowModal(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Article.update(id, data),
    onSuccess: () => {
      toast.success('Article updated');
      queryClient.invalidateQueries(['admin-articles']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.update(id, { is_deleted: true }),
    onSuccess: () => {
      toast.success('Article deleted');
      queryClient.invalidateQueries(['admin-articles']);
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.update(id, { 
      status: 'approved',
      is_published: true 
    }),
    onSuccess: () => {
      toast.success('Article approved and published');
      queryClient.invalidateQueries(['admin-articles']);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.update(id, { 
      status: 'rejected',
      is_published: false 
    }),
    onSuccess: () => {
      toast.success('Article rejected');
      queryClient.invalidateQueries(['admin-articles']);
    }
  });

  const generateAIArticles = useMutation({
    mutationFn: async (templeId) => {
      const temple = temples.find(t => t.id === templeId);
      const response = await base44.functions.invoke('generateTempleStories', {
        templeName: temple.name,
        deity: temple.primary_deity,
        city: temple.city,
        state: temple.state,
        language: 'english'
      });

      if (!response.data.success) throw new Error('AI generation failed');

      const stories = response.data.data.stories;
      const createdArticles = [];
      
      for (const story of stories) {
        const article = await base44.entities.Article.create({
          temple_id: templeId,
          title: story.title,
          content: story.content,
          scripture_reference: story.scripture,
          quote: story.quote,
          source: 'ai_generated',
          status: 'approved',
          is_published: true,
          language: 'english'
        });
        createdArticles.push(article);
      }

      return createdArticles;
    },
    onSuccess: () => {
      toast.success('AI articles generated successfully');
      queryClient.invalidateQueries(['admin-articles']);
    }
  });

  const resetForm = () => {
    setFormData({
      temple_id: '',
      title: '',
      content: '',
      scripture_reference: '',
      quote: '',
      language: 'english'
    });
    setEditingArticle(null);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      temple_id: article.temple_id,
      title: article.title,
      content: article.content,
      scripture_reference: article.scripture_reference || '',
      quote: article.quote || '',
      language: article.language
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Temple Articles</h2>
          <p className="text-gray-500">Manage scripture articles and priest submissions</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Temple</th>
                <th className="text-left py-3 px-4">Source</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles?.map(article => {
                const temple = temples?.find(t => t.id === article.temple_id);
                return (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        {article.author_name && (
                          <p className="text-sm text-gray-500">By {article.author_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{temple?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={
                        article.source === 'ai_generated' ? 'border-purple-300 text-purple-700' :
                        article.source === 'priest' ? 'border-orange-300 text-orange-700' :
                        'border-blue-300 text-blue-700'
                      }>
                        {article.source === 'ai_generated' && <Sparkles className="w-3 h-3 mr-1" />}
                        {article.source.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[article.status]}>
                        {article.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {article.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => approveMutation.mutate(article.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectMutation.mutate(article.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(article)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(article.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Generate AI Articles from Scriptures
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a temple to automatically generate sacred stories from Hindu scriptures using AI.
        </p>
        <div className="flex gap-3">
          <Select onValueChange={(value) => generateAIArticles.mutate(value)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select temple..." />
            </SelectTrigger>
            <SelectContent>
              {temples?.map(temple => (
                <SelectItem key={temple.id} value={temple.id}>
                  {temple.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Temple *</Label>
              <Select 
                value={formData.temple_id} 
                onValueChange={(value) => setFormData({ ...formData, temple_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select temple" />
                </SelectTrigger>
                <SelectContent>
                  {temples?.map(temple => (
                    <SelectItem key={temple.id} value={temple.id}>
                      {temple.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="mb-2 block">Scripture Reference</Label>
              <Input
                placeholder="e.g., Bhagavad Gita, Chapter 2"
                value={formData.scripture_reference}
                onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
              />
            </div>

            <div>
              <Label className="mb-2 block">Sanskrit Quote</Label>
              <Input
                placeholder="Original verse or quote"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              />
            </div>

            <div>
              <Label className="mb-2 block">Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingArticle ? 'Update' : 'Create'} Article
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}