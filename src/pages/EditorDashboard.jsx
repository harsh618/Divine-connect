import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Image, 
  Building2, 
  Flame, 
  Heart, 
  FileText, 
  Calendar,
  Edit,
  Loader2
} from 'lucide-react';

export default function EditorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('temples');

  const { data: user } = useQuery({
    queryKey: ['editor-user'],
    queryFn: () => base44.auth.me()
  });

  // Check if user is editor or admin
  React.useEffect(() => {
    const checkRole = async () => {
      const userData = await base44.auth.me();
      const hasEditorAccess = userData.app_role === 'editor' || userData.role === 'admin';
      if (!hasEditorAccess) {
        navigate(createPageUrl('Home'));
      }
    };
    checkRole();
  }, [navigate]);

  const { data: temples = [], isLoading: templesLoading } = useQuery({
    queryKey: ['editor-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }, '-updated_date', 50)
  });

  const { data: poojas = [], isLoading: poojasLoading } = useQuery({
    queryKey: ['editor-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }, '-updated_date', 50)
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['editor-campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ is_deleted: false }, '-updated_date', 50)
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['editor-articles'],
    queryFn: () => base44.entities.Article.filter({ is_deleted: false }, '-updated_date', 50)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-orange-900 mb-2">Content Editor</h1>
          <p className="text-orange-700">Manage images, titles, and content across the platform</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="temples" className="gap-2">
              <Building2 className="w-4 h-4" />
              Mandirs ({temples.length})
            </TabsTrigger>
            <TabsTrigger value="poojas" className="gap-2">
              <Flame className="w-4 h-4" />
              Poojas ({poojas.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Heart className="w-4 h-4" />
              Campaigns ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="w-4 h-4" />
              Articles ({articles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temples">
            {templesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {temples.map((temple) => (
                  <Card key={temple.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                      <img
                        src={temple.thumbnail_url || temple.images?.[0] || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400'}
                        alt={temple.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{temple.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{temple.city}, {temple.state}</p>
                    <Button
                      size="sm"
                      onClick={() => navigate(createPageUrl(`TempleDetail?id=${temple.id}&edit=true`))}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="poojas">
            {poojasLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {poojas.map((pooja) => (
                  <Card key={pooja.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                      <img
                        src={pooja.image_url || 'https://images.unsplash.com/photo-1604608672516-f1e3e1f9f6e6?w=400'}
                        alt={pooja.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{pooja.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 capitalize">{pooja.category?.replace('_', ' ')}</p>
                    <Button
                      size="sm"
                      onClick={() => navigate(createPageUrl(`PoojaDetail?id=${pooja.id}&edit=true`))}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="campaigns">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                      <img
                        src={campaign.thumbnail_url || campaign.images?.[0] || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400'}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{campaign.location}</p>
                    <Button
                      size="sm"
                      onClick={() => navigate(createPageUrl(`CampaignDetail?campaignId=${campaign.id}&edit=true`))}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles">
            {articlesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.content?.substring(0, 150)}...</p>
                      <p className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(article.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(createPageUrl(`ArticleDetail?id=${article.id}&edit=true`))}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}