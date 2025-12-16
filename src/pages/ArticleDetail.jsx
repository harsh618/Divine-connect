import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, User, Loader2 } from 'lucide-react';
import moment from 'moment';
import BackButton from '@/components/ui/BackButton';
import ArticleCard from '@/components/articles/ArticleCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ArticleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const articles = await base44.entities.Article.filter({ id: articleId, is_deleted: false });
      return articles[0];
    },
    enabled: !!articleId
  });

  const { data: temple } = useQuery({
    queryKey: ['temple', article?.temple_id],
    queryFn: async () => {
      const temples = await base44.entities.Temple.filter({ id: article.temple_id, is_deleted: false });
      return temples[0];
    },
    enabled: !!article?.temple_id
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', article?.temple_id],
    queryFn: () => base44.entities.Article.filter({ 
      is_published: true, 
      is_deleted: false,
      temple_id: article.temple_id || null
    }, '-created_date', 3),
    enabled: !!article
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
        <Link to={createPageUrl('Articles')}>
          <button className="px-6 py-2 bg-teal-500 text-white rounded-lg">Back to Articles</button>
        </Link>
      </div>
    );
  }

  const defaultImage = article.images?.[0] || "https://images.unsplash.com/photo-1518655189052-ba153835e009?w=1200";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="relative h-96 overflow-hidden">
        <img src={defaultImage} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <BackButton label="Back" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-teal-100 text-teal-700">
                <BookOpen className="w-3 h-3 mr-1" />
                {article.source === 'ai_generated' ? 'AI Generated' : article.source === 'admin' ? 'Admin' : 'Priest'}
              </Badge>
              {article.temple_id && temple && (
                <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
                  <Badge variant="outline" className="hover:bg-gray-100">
                    {temple.name}
                  </Badge>
                </Link>
              )}
              {!article.temple_id && (
                <Badge variant="secondary">General Article</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{moment(article.created_date).format('MMMM DD, YYYY')}</span>
              </div>
              {article.author_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author_name}</span>
                </div>
              )}
            </div>

            {article.quote && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 italic text-gray-700">
                "{article.quote}"
                {article.scripture_reference && (
                  <div className="text-sm text-gray-600 mt-2 not-italic">
                    — {article.scripture_reference}
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {article.scripture_reference && !article.quote && (
              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Scripture Reference:</strong> {article.scripture_reference}
                </p>
              </div>
            )}
          </Card>

          {relatedArticles && relatedArticles.length > 1 && (
            <div className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                {article.temple_id ? 'More from this Temple' : 'Related Articles'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles
                  .filter(a => a.id !== article.id)
                  .slice(0, 3)
                  .map(relatedArticle => (
                    <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}