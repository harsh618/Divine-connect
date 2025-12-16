import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ArticleCard from '@/components/articles/ArticleCard';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from 'lucide-react';

export default function ArticlesSection() {
  const { data: featuredArticles, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: () => base44.entities.Article.filter({ is_published: true, is_deleted: false, is_featured: true }, '-created_date', 3),
  });

  const { data: recentArticles, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: () => base44.entities.Article.filter({ is_published: true, is_deleted: false }, '-created_date', 3),
    enabled: !loadingFeatured && (!featuredArticles || featuredArticles.length === 0)
  });

  const articles = featuredArticles?.length > 0 ? featuredArticles : recentArticles;
  const isLoading = loadingFeatured || loadingRecent;

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            {featuredArticles?.length > 0 ? 'Featured Articles' : 'Latest Articles'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden shadow-sm rounded-lg">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
          {featuredArticles?.length > 0 ? 'Featured Articles' : 'Latest Journal'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to={createPageUrl('Articles')}>
            <button className="px-8 py-3 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors inline-flex items-center gap-2">
              View All Articles
              <BookOpen className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}