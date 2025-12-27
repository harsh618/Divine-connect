import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, Loader2, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

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
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* Back Button - Floating */}
      <div className="fixed top-20 left-8 z-20">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full text-sm font-light transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <img src={defaultImage} alt={article.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-8 max-w-4xl">
        <div className="py-16">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {article.temple_id && temple && (
              <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
                <Badge variant="outline" className="text-xs uppercase tracking-wider font-light border-border hover:border-primary transition-colors">
                  {temple.name}
                </Badge>
              </Link>
            )}
            {article.scripture_reference && (
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-light border-border">
                {article.scripture_reference}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-8 leading-tight tracking-wide">
            {article.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-12 pb-12 border-b border-border font-light">
            {article.author_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>{format(new Date(article.created_date), 'MMMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Quote Block */}
          {article.quote && (
            <div className="my-12 py-8 border-y border-border">
              <blockquote className="text-2xl font-light italic text-foreground/80 leading-relaxed">
                "{article.quote}"
              </blockquote>
              {article.scripture_reference && (
                <p className="text-sm text-muted-foreground mt-4 font-light">
                  — {article.scripture_reference}
                </p>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-6 text-foreground/80 leading-relaxed font-light text-lg">{children}</p>,
                h1: ({ children }) => <h1 className="text-3xl font-normal mt-12 mb-6 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-normal mt-10 mb-5 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-normal mt-8 mb-4 text-foreground">{children}</h3>,
                ul: ({ children }) => <ul className="list-none pl-0 mb-6 space-y-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-3">{children}</ol>,
                li: ({ children }) => <li className="text-foreground/80 leading-relaxed font-light text-lg">{children}</li>,
                strong: ({ children }) => <strong className="font-normal text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary pl-6 my-8 italic text-foreground/70">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 1 && (
          <div className="py-16 border-t border-border">
            <h2 className="text-2xl font-normal text-foreground mb-8 tracking-wide">
              {article.temple_id ? 'More from this Temple' : 'Related Stories'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles
                .filter(a => a.id !== article.id)
                .slice(0, 3)
                .map(relatedArticle => (
                  <Link key={relatedArticle.id} to={createPageUrl(`ArticleDetail?id=${relatedArticle.id}`)}>
                    <div className="group cursor-pointer">
                      {relatedArticle.images?.[0] && (
                        <div className="relative aspect-[4/3] overflow-hidden mb-4">
                          <img
                            src={relatedArticle.images[0]}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <h3 className="font-normal text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedArticle.title}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}