import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function JournalsSection({ templeId, templeName, primaryDeity }) {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['temple-journals', templeId],
    queryFn: () => base44.entities.Article.filter({ 
      temple_id: templeId,
      is_published: true,
      is_deleted: false 
    }, '-created_date', 6),
    enabled: !!templeId
  });

  if (isLoading) {
    return (
      <Card className="p-8 border-0 shadow-sm">
        <h2 className="text-2xl font-normal mb-6 tracking-wide flex items-center">
          <BookOpen className="w-5 h-5 mr-3 text-primary" />
          Journals & Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <Card className="p-8 border-0 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-normal tracking-wide flex items-center">
          <BookOpen className="w-5 h-5 mr-3 text-primary" />
          Journals & Stories
        </h2>
        <Link to={createPageUrl('Articles')}>
          <button className="text-sm text-primary hover:text-primary/80 font-light uppercase tracking-wider">
            View All
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Link key={article.id} to={createPageUrl(`ArticleDetail?id=${article.id}`)}>
            <Card className="group overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer h-full">
              {article.images?.[0] && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.images[0]}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {article.scripture_reference && (
                    <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground border-0 text-xs">
                      {article.scripture_reference}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="p-6">
                <h3 className="font-normal text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 font-light leading-relaxed">
                  {article.content.replace(/[#*_`]/g, '').substring(0, 150)}...
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground font-light">
                  {article.author_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(article.created_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                {article.quote && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs italic text-muted-foreground font-light line-clamp-2">
                      "{article.quote}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
}