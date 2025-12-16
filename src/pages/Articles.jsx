import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from 'lucide-react';
import ArticleCard from '@/components/articles/ArticleCard';
import { Skeleton } from "@/components/ui/skeleton";

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.filter({ is_published: true, is_deleted: false }, '-created_date'),
  });

  const filteredArticles = articles?.filter(article =>
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 py-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Divine Insights & Stories
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Explore a collection of articles, spiritual insights, and stories from our community.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 -mt-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden shadow-sm rounded-lg">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))
          ) : filteredArticles?.length > 0 ? (
            filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}